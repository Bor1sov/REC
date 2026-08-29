<?php
/**
 * REC Studio theme functions.
 *
 * @package RecStudio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function rec_studio_theme_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);
}
add_action( 'after_setup_theme', 'rec_studio_theme_setup' );

function rec_theme_asset( $path = '' ) {
	return trailingslashit( get_template_directory_uri() ) . ltrim( $path, '/' );
}

function rec_studio_use_query_page_urls() {
	if ( defined( 'REC_STUDIO_QUERY_PAGE_URLS' ) ) {
		return (bool) REC_STUDIO_QUERY_PAGE_URLS;
	}

	$host = wp_parse_url( home_url( '/' ), PHP_URL_HOST );

	return 'dev.recstudio.biz' === strtolower( (string) $host );
}

function rec_theme_page_url( $slug ) {
	$slug = trim( $slug, '/' );

	if ( 'main' === $slug ) {
		return home_url( '/' );
	}
	$page = get_page_by_path( $slug, OBJECT, 'page' );

	if ( rec_studio_use_query_page_urls() ) {
		return add_query_arg( 'pagename', $page ? $page->post_name : $slug, home_url( '/' ) );
	}

	if ( $page ) {
		return get_permalink( $page );
	}

	return home_url( '/' . $slug . '/' );
}

function rec_studio_runtime_config() {
	return array(
		'assetBase' => trailingslashit( get_template_directory_uri() ),
		'pages'     => array(
			'home'     => home_url( '/' ),
			'main'     => home_url( '/' ),
			'menu'     => rec_theme_page_url( 'menu' ),
			'about'    => home_url( '/' ),
			'projects' => rec_theme_page_url( 'projects' ),
			'help'     => rec_theme_page_url( 'help' ),
			'news'     => rec_theme_page_url( 'news' ),
			'contacts' => rec_theme_page_url( 'contacts' ),
		),
	);
}

function rec_studio_print_runtime_config() {
	printf(
		'<script id="rec-studio-runtime-config">window.recTheme=%s;</script>' . "\n",
		wp_json_encode( rec_studio_runtime_config() )
	);
}
add_action( 'wp_head', 'rec_studio_print_runtime_config', 1 );

function rec_studio_enqueue_assets() {
	$style_path = get_template_directory() . '/styles/bundle.css';
	$script_path = get_template_directory() . '/scripts/script.js';
	$news_script_path = get_template_directory() . '/scripts/modules/news-parallax.js';

	wp_enqueue_style(
		'rec-studio',
		rec_theme_asset( 'styles/bundle.css' ),
		array(),
		file_exists( $style_path ) ? filemtime( $style_path ) : '1.0.0'
	);

	wp_enqueue_script(
		'rec-studio-main',
		rec_theme_asset( 'scripts/script.js' ),
		array(),
		file_exists( $script_path ) ? filemtime( $script_path ) : '1.0.0',
		true
	);

	if ( is_page( 'news' ) ) {
		wp_enqueue_script(
			'rec-studio-news',
			rec_theme_asset( 'scripts/modules/news-parallax.js' ),
			array(),
			file_exists( $news_script_path ) ? filemtime( $news_script_path ) : '1.0.0',
			true
		);
	}
}
add_action( 'wp_enqueue_scripts', 'rec_studio_enqueue_assets' );

function rec_studio_module_script_tag( $tag, $handle, $src ) {
	$module_handles = array(
		'rec-studio-main',
		'rec-studio-news',
	);

	if ( ! in_array( $handle, $module_handles, true ) ) {
		return $tag;
	}

	return sprintf(
		'<script type="module" src="%1$s" id="%2$s-js"></script>' . "\n",
		esc_url( $src ),
		esc_attr( $handle )
	);
}
add_filter( 'script_loader_tag', 'rec_studio_module_script_tag', 10, 3 );

function rec_studio_add_image_performance_attrs( $html ) {
	return preg_replace_callback(
		'/<img\b[^>]*>/i',
		function ( $matches ) {
			$tag = $matches[0];

			if ( false === stripos( $tag, 'decoding=' ) ) {
				$tag = preg_replace( '/<img\b/i', '<img decoding="async"', $tag, 1 );
			}

			$is_high_priority = false !== stripos( $tag, 'fetchpriority="high"' ) || false !== stripos( $tag, "fetchpriority='high'" );
			$is_ui_icon       = false !== stripos( $tag, 'settings__valume-btn__img' );

			if ( ! $is_high_priority && ! $is_ui_icon && false === stripos( $tag, 'loading=' ) ) {
				$tag = preg_replace( '/<img\b/i', '<img loading="lazy"', $tag, 1 );
			}

			return $tag;
		},
		$html
	);
}

function rec_studio_start_image_performance_buffer() {
	if ( ! is_admin() ) {
		ob_start( 'rec_studio_add_image_performance_attrs' );
	}
}
add_action( 'template_redirect', 'rec_studio_start_image_performance_buffer' );

function rec_studio_body_classes( $classes ) {
	if ( is_front_page() ) {
		$classes[] = 'main-page';
		$classes[] = 'about-page';
	}

	if ( is_page( 'menu' ) ) {
		$classes[] = 'menu-page';
		$classes[] = 'home-page';
	}

	$page_classes = array(
		'about'    => 'about-page',
		'projects' => 'projects-page',
		'help'     => 'help-page',
		'news'     => 'news-page',
		'contacts' => 'contacts-page',
	);

	foreach ( $page_classes as $slug => $class_name ) {
		if ( is_page( $slug ) ) {
			$classes[] = $class_name;
		}
	}

	return array_values( array_unique( $classes ) );
}
add_filter( 'body_class', 'rec_studio_body_classes' );

function rec_studio_create_required_pages( $flush_rewrite = true ) {
	$created_page = false;
	$pages = array(
		'menu'     => 'Меню',
		'about'    => 'Главная',
		'projects' => 'Наши проекты',
		'help'     => 'Услуги',
		'news'     => 'Новости',
		'contacts' => 'Контакты',
	);

	foreach ( $pages as $slug => $title ) {
		if ( get_page_by_path( $slug, OBJECT, 'page' ) ) {
			continue;
		}

		$created_page = true;
		wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $title,
				'post_name'    => $slug,
				'post_content' => '',
			)
		);
	}

	if ( $flush_rewrite && $created_page ) {
		flush_rewrite_rules();
	}
}
add_action( 'after_switch_theme', 'rec_studio_create_required_pages' );

function rec_studio_ensure_required_pages() {
	rec_studio_create_required_pages( false );
}
add_action( 'init', 'rec_studio_ensure_required_pages' );