<?php
/** Editable site content and the initial, non-destructive content import. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function rec_studio_content_defaults() {
	static $defaults;
	if ( null === $defaults ) {
		$defaults = json_decode( file_get_contents( __DIR__ . '/content-defaults.json' ), true );
	}
	return $defaults;
}

function rec_studio_resolve_assets( $value ) {
	return preg_replace_callback( '/\{\{asset:([^}]+)\}\}/', function ( $match ) {
		return rec_theme_asset( $match[1] );
	}, (string) $value );
}

function rec_studio_content( $key ) {
	$saved = get_option( 'rec_studio_content', array() );
	$fields = rec_studio_content_defaults()['fields'];
	$value = is_array( $saved ) && array_key_exists( $key, $saved ) ? $saved[ $key ] : ( $fields[ $key ]['default'] ?? '' );
	return rec_studio_resolve_assets( is_scalar( $value ) ? $value : '' );
}

function rec_studio_text( $key ) { echo nl2br( esc_html( rec_studio_content( $key ) ) ); }
function rec_studio_html( $key ) { echo wp_kses_post( wpautop( rec_studio_content( $key ) ) ); }

function rec_studio_lines( $value ) {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\r?\n/', (string) $value ) ), 'strlen' ) );
}

function rec_studio_status( $key ) {
	foreach ( rec_studio_lines( rec_studio_content( $key ) ) as $line ) {
		echo '<span>' . esc_html( $line ) . '</span>';
	}
}

function rec_studio_asset_overrides() {
	$saved = get_option( 'rec_studio_content', array() );
	$result = array();
	foreach ( rec_studio_content_defaults()['fields'] as $key => $field ) {
		if ( ! empty( $field['asset'] ) && isset( $saved[ $key ] ) && is_string( $saved[ $key ] ) && false === strpos( $saved[ $key ], '{{asset:' ) ) {
			$result[ $field['asset'] ] = esc_url_raw( $saved[ $key ], array( 'http', 'https' ) );
		}
	}
	return $result;
}

function rec_studio_menu_url( $slug ) {
	$custom = rec_studio_content( 'menu_url_' . $slug );
	return '' !== $custom ? $custom : ( 'home' === $slug ? home_url( '/' ) : rec_theme_page_url( $slug ) );
}

function rec_studio_register_content_types() {
	foreach ( array( 'rec_project' => 'Проекты', 'rec_service' => 'Услуги', 'rec_news' => 'Новости' ) as $type => $label ) {
		register_post_type( $type, array(
			'labels' => array( 'name' => $label, 'singular_name' => $label, 'add_new' => 'Добавить', 'add_new_item' => 'Добавить материал', 'edit_item' => 'Редактировать материал', 'all_items' => $label, 'search_items' => 'Найти материал', 'not_found' => 'Материалы не найдены' ),
			'public' => false, 'show_ui' => true, 'show_in_menu' => 'rec-studio-content',
			'show_in_rest' => true, 'map_meta_cap' => true, 'capability_type' => 'page',
			'supports' => array( 'title', 'editor', 'revisions', 'page-attributes', 'excerpt' ),
		) );
	}
}
add_action( 'init', 'rec_studio_register_content_types', 5 );

function rec_studio_import_content() {
	if ( ! current_user_can( 'manage_options' ) || '1' === get_option( 'rec_studio_content_version' ) ) { return; }
	$lock = (int) get_option( 'rec_studio_content_import_lock' );
	if ( $lock && time() - $lock > 300 ) { delete_option( 'rec_studio_content_import_lock' ); }
	if ( ! add_option( 'rec_studio_content_import_lock', time(), '', false ) ) { return; }
	try {
		foreach ( rec_studio_content_defaults()['records'] as $type => $records ) {
			foreach ( $records as $record ) {
				$existing = get_posts( array( 'post_type' => $type, 'post_status' => array( 'publish', 'draft', 'pending', 'private', 'trash', 'future' ), 'meta_key' => '_rec_seed_key', 'meta_value' => $record['key'], 'numberposts' => 1, 'fields' => 'ids' ) );
				if ( $existing ) { continue; }
				$meta = array( '_rec_seed_key' => $record['key'] );
				foreach ( $record['meta'] as $key => $value ) { $meta[ '_rec_' . $key ] = $value; }
				$id = wp_insert_post( wp_slash( array(
					'post_type' => $type, 'post_status' => 'publish', 'post_title' => $record['title'],
					'post_content' => rec_studio_resolve_assets( $record['content'] ),
					'post_excerpt' => $record['excerpt'] ?? '', 'menu_order' => $record['order'],
					'post_date' => $record['date'] ?? current_time( 'mysql' ), 'meta_input' => $meta,
				) ), true );
				if ( is_wp_error( $id ) || ! $id ) {
					update_option( 'rec_studio_content_import_error', 'Не удалось перенести все материалы. Повторите вход в админку. Уже перенесённые записи сохраняются.', false );
					return;
				}
			}
		}
		update_option( 'rec_studio_content_version', '1', false );
		delete_option( 'rec_studio_content_import_error' );
	} finally {
		delete_option( 'rec_studio_content_import_lock' );
	}
}
add_action( 'admin_init', 'rec_studio_import_content' );
add_action( 'after_switch_theme', 'rec_studio_import_content' );

function rec_studio_records( $type ) {
	static $cache = array();
	if ( isset( $cache[ $type ] ) ) { return $cache[ $type ]; }
	$records = array();
	if ( '1' !== get_option( 'rec_studio_content_version' ) ) {
		$records = rec_studio_content_defaults()['records'][ $type ] ?? array();
	} else {
		$posts = get_posts( array( 'post_type' => $type, 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => array( 'menu_order' => 'ASC', 'date' => 'DESC', 'ID' => 'ASC' ) ) );
		foreach ( $posts as $post ) {
			$meta = array();
			foreach ( get_post_meta( $post->ID ) as $key => $values ) {
				if ( 0 === strpos( $key, '_rec_' ) ) { $meta[ substr( $key, 5 ) ] = (string) $values[0]; }
			}
			$records[] = array( 'id' => $post->ID, 'key' => 'post-' . $post->ID, 'title' => $post->post_title, 'content' => $post->post_content, 'excerpt' => $post->post_excerpt, 'date' => $post->post_date, 'order' => $post->menu_order, 'meta' => $meta );
		}
	}
	foreach ( $records as &$record ) {
		$record['content'] = wp_kses_post( wpautop( rec_studio_resolve_assets( $record['content'] ) ) );
		$record['meta'] = array_map( 'rec_studio_resolve_assets', $record['meta'] );
	}
	$cache[ $type ] = $records;
	return $records;
}

function rec_studio_service_groups() {
	$groups = array();
	foreach ( array( 'support', 'advertising' ) as $key ) {
		$groups[ $key ] = array( 'title' => rec_studio_content( 'help_group_' . $key ), 'image' => rec_studio_content( 'help_image_' . $key ), 'items' => array() );
	}
	foreach ( rec_studio_records( 'rec_service' ) as $record ) {
		$meta = $record['meta'];
		$group = $meta['group'] ?? 'support';
		if ( ! isset( $groups[ $group ] ) ) { $group = 'support'; }
		$groups[ $group ]['items'][] = array( 'key' => $record['key'], 'title' => $record['title'], 'descriptionHtml' => $record['content'], 'description' => wp_strip_all_tags( $record['content'] ), 'image' => $meta['image'] ?? '', 'services' => rec_studio_lines( $meta['services'] ?? '' ), 'presentation' => esc_url_raw( $meta['presentation'] ?? '' ), 'price' => esc_url_raw( $meta['price'] ?? '' ) );
	}
	return array_filter( $groups, function ( $group ) { return ! empty( $group['items'] ); } );
}

function rec_studio_content_runtime() {
	$labels = array();
	foreach ( rec_studio_content_defaults()['fields'] as $key => $field ) {
		if ( in_array( $field['type'], array( 'text', 'textarea', 'lines', 'number' ), true ) ) { $labels[ $key ] = rec_studio_content( $key ); }
	}
	$menu = array();
	foreach ( array( 'home', 'projects', 'help', 'news', 'contacts' ) as $slug ) { $menu[] = array( 'title' => rec_studio_content( 'menu_' . $slug ), 'href' => esc_url_raw( rec_studio_menu_url( $slug ) ) ); }
	return array( 'labels' => $labels, 'menu' => $menu, 'serviceGroups' => rec_studio_service_groups(), 'assetOverrides' => rec_studio_asset_overrides() );
}

function rec_studio_print_content_styles() {
	$overrides = rec_studio_asset_overrides();
	$css = '';
	foreach ( rec_studio_content_defaults()['fields'] as $key => $field ) {
		if ( isset( $field['asset'], $overrides[ $field['asset'] ] ) ) {
			$url = $overrides[ $field['asset'] ];
			// CSS uses its own escapes; JSON's \u escapes would break Cyrillic URLs and query strings.
			$css_url = str_replace( array( '\\', '"', '<', "\n", "\r", "\f" ), array( '\\\\', '\\"', '\\3c ', '\\a ', '\\d ', '\\c ' ), $url );
			$css .= '--rec-' . sanitize_key( $key ) . ':' . ( '' === $url ? 'none' : 'url("' . $css_url . '")' ) . ';';
		}
	}
	if ( $css ) { echo '<style id="rec-studio-content-media">:root{' . $css . '}</style>'; } // Values are sanitized URLs escaped as CSS strings.
}
add_action( 'wp_head', 'rec_studio_print_content_styles', 20 );

require_once __DIR__ . '/content-render.php';
require_once __DIR__ . '/content-admin.php';
