<?php
/** Native WordPress editing screens for REC Studio content. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function rec_studio_content_sections() {
	return array( 'general' => 'Общее', 'home' => 'Главная', 'menu' => 'Меню', 'projects' => 'Страница проектов', 'help' => 'Страница услуг', 'news' => 'Страница новостей', 'contacts' => 'Контакты', 'forms' => 'Формы и кнопки', 'media' => 'Фоны, иконки и звуки' );
}

function rec_studio_content_admin_menu() {
	add_menu_page( 'Контент REC Studio', 'REC Studio', 'edit_pages', 'rec-studio-content', 'rec_studio_content_admin_page', 'dashicons-admin-customizer', 21 );
	add_submenu_page( 'rec-studio-content', 'Контент REC Studio', 'Контент сайта', 'edit_pages', 'rec-studio-content', 'rec_studio_content_admin_page', 0 );
}
add_action( 'admin_menu', 'rec_studio_content_admin_menu' );

function rec_studio_content_admin_assets( $hook ) {
	$screen = get_current_screen();
	if ( 'toplevel_page_rec-studio-content' !== $hook && ! in_array( $screen->post_type ?? '', array( 'rec_project', 'rec_service', 'rec_news' ), true ) ) { return; }
	wp_enqueue_media();
	wp_enqueue_script( 'rec-content-admin', rec_theme_asset( 'scripts/content-admin.js' ), array( 'jquery', 'media-editor' ), filemtime( get_template_directory() . '/scripts/content-admin.js' ), true );
	wp_enqueue_style( 'rec-content-admin', rec_theme_asset( 'styles/content-admin.css' ), array(), filemtime( get_template_directory() . '/styles/content-admin.css' ) );
}
add_action( 'admin_enqueue_scripts', 'rec_studio_content_admin_assets' );

function rec_studio_admin_field( $key, $field, $value, $prefix = 'rec_content' ) {
	$id = $prefix . '_' . $key;
	$name = $prefix . '[' . $key . ']';
	echo '<div class="rec-admin-field"><label for="' . esc_attr( $id ) . '"><strong>' . esc_html( $field['label'] ) . '</strong></label>';
	$type = $field['type'];
	if ( 'richtext' === $type ) {
		wp_editor( $value, $id, array( 'textarea_name' => $name, 'textarea_rows' => 9, 'media_buttons' => true ) );
	} elseif ( in_array( $type, array( 'textarea', 'lines' ), true ) ) {
		echo '<textarea class="large-text" rows="5" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">' . esc_textarea( $value ) . '</textarea>';
	} elseif ( 'select' === $type ) {
		echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">';
		foreach ( $field['options'] as $option => $label ) { echo '<option value="' . esc_attr( $option ) . '" ' . selected( $value, $option, false ) . '>' . esc_html( $label ) . '</option>'; }
		echo '</select>';
	} elseif ( 'checkbox' === $type ) {
		echo '<input type="hidden" name="' . esc_attr( $name ) . '" value="0"><input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="1" ' . checked( $value, '1', false ) . '>';
	} else {
		$input_type = 'number' === $type ? 'number' : 'text';
		echo '<input class="large-text" type="' . esc_attr( $input_type ) . '" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '"' . ( 'number' === $type ? ' min="0" max="1000"' : '' ) . '>';
		if ( 'media' === $type ) {
			echo '<p><button type="button" class="button rec-select-media" data-target="' . esc_attr( $id ) . '">Выбрать из медиатеки</button> <button type="button" class="button rec-clear-media" data-target="' . esc_attr( $id ) . '">Очистить</button></p>';
			if ( preg_match( '/\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i', $value ) ) { echo '<img class="rec-media-preview" data-preview-for="' . esc_attr( $id ) . '" src="' . esc_url( $value ) . '" alt="">'; }
		}
	}
	if ( ! empty( $field['description'] ) ) { echo '<p class="description">' . esc_html( $field['description'] ) . '</p>'; }
	echo '</div>';
}

function rec_studio_content_admin_page() {
	if ( ! current_user_can( 'edit_pages' ) ) { return; }
	$sections = rec_studio_content_sections();
	$section = isset( $_GET['section'] ) && is_string( $_GET['section'] ) ? sanitize_key( wp_unslash( $_GET['section'] ) ) : 'general';
	if ( ! isset( $sections[ $section ] ) ) { $section = 'general'; }
	echo '<div class="wrap rec-content-admin"><h1>Контент REC Studio</h1><p>Изменения используются на отдельных страницах и в разделах главной. Черновики и записи в корзине на сайте не показываются.</p><p>';
	foreach ( array( 'rec_project' => 'Проекты', 'rec_service' => 'Услуги', 'rec_news' => 'Новости' ) as $type => $title ) {
		echo '<a class="button" href="' . esc_url( admin_url( 'edit.php?post_type=' . $type ) ) . '">' . esc_html( $title ) . '</a> ';
	}
	echo '</p>';
	if ( ! current_user_can( 'manage_options' ) ) { echo '<p>Общие настройки сайта доступны администратору. Проекты, услуги и новости можно редактировать по ссылкам выше.</p></div>'; return; }
	if ( get_option( 'rec_studio_content_import_error' ) ) { echo '<div class="notice notice-error"><p>' . esc_html( get_option( 'rec_studio_content_import_error' ) ) . '</p></div>'; }
	if ( isset( $_GET['saved'] ) ) { echo '<div class="notice notice-success is-dismissible"><p>Изменения сохранены.</p></div>'; }
	echo '<nav class="nav-tab-wrapper">';
	foreach ( $sections as $key => $label ) { echo '<a class="nav-tab ' . ( $key === $section ? 'nav-tab-active' : '' ) . '" href="' . esc_url( admin_url( 'admin.php?page=rec-studio-content&section=' . $key ) ) . '">' . esc_html( $label ) . '</a>'; }
	echo '</nav><form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="rec_studio_save_content"><input type="hidden" name="section" value="' . esc_attr( $section ) . '">';
	wp_nonce_field( 'rec_studio_save_content_' . $section );
	foreach ( rec_studio_content_defaults()['fields'] as $key => $field ) {
		if ( $section === $field['group'] ) { rec_studio_admin_field( $key, $field, rec_studio_content( $key ) ); }
	}
	submit_button( 'Сохранить изменения' );
	echo '</form></div>';
}

function rec_studio_sanitize_content_value( $value, $field ) {
	if ( ! is_scalar( $value ) ) { return ''; }
	$value = (string) $value;
	switch ( $field['type'] ) {
		case 'richtext': return wp_kses_post( $value );
		case 'textarea': case 'lines': return sanitize_textarea_field( $value );
		case 'media': return esc_url_raw( $value, array( 'http', 'https' ) );
		case 'url': return '#' === $value ? '#' : esc_url_raw( $value, array( 'http', 'https', 'mailto', 'tel' ) );
		case 'number': return (string) min( 1000, max( 0, (int) $value ) );
		case 'checkbox': return '1' === $value ? '1' : '0';
		case 'select': return array_key_exists( $value, $field['options'] ) ? $value : (string) array_key_first( $field['options'] );
		default: return sanitize_text_field( $value );
	}
}

function rec_studio_save_content() {
	if ( ! current_user_can( 'manage_options' ) ) { wp_die( 'Недостаточно прав.', '', array( 'response' => 403 ) ); }
	$section = isset( $_POST['section'] ) && is_string( $_POST['section'] ) ? sanitize_key( wp_unslash( $_POST['section'] ) ) : '';
	if ( ! array_key_exists( $section, rec_studio_content_sections() ) ) { wp_die( 'Неизвестный раздел.', '', array( 'response' => 400 ) ); }
	check_admin_referer( 'rec_studio_save_content_' . $section );
	$input = isset( $_POST['rec_content'] ) && is_array( $_POST['rec_content'] ) ? wp_unslash( $_POST['rec_content'] ) : array();
	$saved = get_option( 'rec_studio_content', array() );
	if ( ! is_array( $saved ) ) { $saved = array(); }
	foreach ( rec_studio_content_defaults()['fields'] as $key => $field ) {
		if ( $field['group'] === $section && array_key_exists( $key, $input ) ) { $saved[ $key ] = rec_studio_sanitize_content_value( $input[ $key ], $field ); }
	}
	update_option( 'rec_studio_content', $saved, false );
	wp_safe_redirect( admin_url( 'admin.php?page=rec-studio-content&section=' . $section . '&saved=1' ) );
	exit;
}
add_action( 'admin_post_rec_studio_save_content', 'rec_studio_save_content' );

function rec_studio_record_fields( $type ) {
	$fields = array( 'image' => array( 'label' => 'Изображение / обложка', 'type' => 'media' ) );
	if ( 'rec_project' === $type ) {
		$options = array();
		foreach ( array( 'series', 'cinema', 'documentary', 'tv' ) as $key ) { $options[ $key ] = rec_studio_content( 'projects_category_' . $key ); }
		$fields['group'] = array( 'label' => 'Раздел проектов', 'type' => 'select', 'options' => $options );
		foreach ( array( 'genre' => 'Жанр', 'note' => 'Примечание', 'age' => 'Возрастное ограничение', 'format' => 'Формат', 'duration' => 'Количество серий / хронометраж' ) as $key => $label ) { $fields[ $key ] = array( 'label' => $label, 'type' => 'text' ); }
		$fields['featured'] = array( 'label' => 'Показывать на главной', 'type' => 'checkbox' );
		$fields['home_order'] = array( 'label' => 'Порядок на главной (меньшее число выше)', 'type' => 'number' );
		$fields['teaser'] = array( 'label' => 'Ссылка на тизер', 'type' => 'media' );
		$fields['status'] = array( 'label' => 'Стадии готовности (каждая с новой строки; пусто — общие настройки)', 'type' => 'lines' );
	} elseif ( 'rec_service' === $type ) {
		$fields['group'] = array( 'label' => 'Раздел услуг', 'type' => 'select', 'options' => array( 'support' => rec_studio_content( 'help_group_support' ), 'advertising' => rec_studio_content( 'help_group_advertising' ) ) );
		$fields['services'] = array( 'label' => 'Виды услуг (каждый с новой строки)', 'type' => 'lines' );
		$fields['presentation'] = array( 'label' => 'Файл презентации', 'type' => 'media' );
		$fields['price'] = array( 'label' => 'Файл прайс-листа', 'type' => 'media' );
	} elseif ( 'rec_news' === $type ) {
		$fields['group'] = array( 'label' => 'Категория', 'type' => 'select', 'options' => array( 'producers' => rec_studio_content( 'news_producers' ), 'marketers' => rec_studio_content( 'news_marketers' ), 'authors' => rec_studio_content( 'news_authors' ) ) );
		$fields['archived'] = array( 'label' => 'Поместить в архив новостей', 'type' => 'checkbox' );
	}
	return $fields;
}

function rec_studio_add_content_meta_boxes() {
	foreach ( array( 'rec_project', 'rec_service', 'rec_news' ) as $type ) { add_meta_box( 'rec-content-fields', 'Настройки материала REC Studio', 'rec_studio_record_meta_box', $type, 'normal', 'high' ); }
}
add_action( 'add_meta_boxes', 'rec_studio_add_content_meta_boxes' );

function rec_studio_record_meta_box( $post ) {
	wp_nonce_field( 'rec_studio_record_' . $post->ID, 'rec_studio_record_nonce' );
	echo '<p>Заголовок и основной текст редактируются выше. Для новости поле «Отрывок» задаёт вступление, дата публикации отображается на сайте. Порядок записей задаётся в блоке «Свойства страницы».</p>';
	foreach ( rec_studio_record_fields( $post->post_type ) as $key => $field ) { rec_studio_admin_field( $key, $field, rec_studio_resolve_assets( get_post_meta( $post->ID, '_rec_' . $key, true ) ), 'rec_meta' ); }
}

function rec_studio_save_record( $post_id, $post ) {
	if ( ! in_array( $post->post_type, array( 'rec_project', 'rec_service', 'rec_news' ), true ) || wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) ) { return; }
	if ( ! current_user_can( 'edit_post', $post_id ) || ! isset( $_POST['rec_studio_record_nonce'] ) || ! is_string( $_POST['rec_studio_record_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rec_studio_record_nonce'] ) ), 'rec_studio_record_' . $post_id ) ) { return; }
	$input = isset( $_POST['rec_meta'] ) && is_array( $_POST['rec_meta'] ) ? wp_unslash( $_POST['rec_meta'] ) : array();
	foreach ( rec_studio_record_fields( $post->post_type ) as $key => $field ) {
		if ( array_key_exists( $key, $input ) ) { update_post_meta( $post_id, '_rec_' . $key, wp_slash( rec_studio_sanitize_content_value( $input[ $key ], $field ) ) ); }
	}
}
add_action( 'save_post', 'rec_studio_save_record', 10, 2 );

function rec_studio_use_visual_content_editor( $use, $type ) {
	return in_array( $type, array( 'rec_project', 'rec_service', 'rec_news' ), true ) ? false : $use;
}
add_filter( 'use_block_editor_for_post_type', 'rec_studio_use_visual_content_editor', 10, 2 );
