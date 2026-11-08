<?php
/** Mail credentials are managed separately from editable public content. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'admin_menu', function () {
	add_submenu_page( 'rec-studio-content', 'Почта REC Studio', 'Почта и заявки', 'manage_options', 'rec-studio-mail', 'rec_studio_mail_admin_page' );
}, 20 );

function rec_studio_mail_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) { return; }
	$settings = rec_studio_mail_settings();
	$notice = get_transient( 'rec_mail_notice_' . get_current_user_id() );
	delete_transient( 'rec_mail_notice_' . get_current_user_id() );
	echo '<div class="wrap"><h1>Почта и заявки REC Studio</h1>';
	if ( $notice ) { echo '<div class="notice notice-' . ( $notice['ok'] ? 'success' : 'error' ) . '"><p>' . esc_html( $notice['message'] ) . '</p></div>'; }
	echo '<p>Заявки с главной страницы, страницы проектов и услуг отправляются через почту Timeweb. Отправитель совпадает с почтовым ящиком; ответ на письмо направляется на email посетителя, если он указан.</p>';
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="rec_studio_save_mail">';
	wp_nonce_field( 'rec_studio_save_mail' );
	echo '<table class="form-table"><tbody><tr><th>Отправка заявок</th><td><label><input type="checkbox" name="enabled" value="1" ' . checked( ! empty( $settings['enabled'] ), true, false ) . '> Включена</label></td></tr>';
	foreach ( array( 'username' => 'Почтовый ящик Timeweb', 'recipient' => 'Получатель заявок' ) as $key => $label ) {
		echo '<tr><th><label for="rec-mail-' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label></th><td><input class="regular-text" type="email" required maxlength="254" id="rec-mail-' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $settings[ $key ] ) . '"></td></tr>';
	}
	echo '<tr><th><label for="rec-mail-password">Пароль почты</label></th><td>';
	if ( defined( 'REC_STUDIO_SMTP_PASSWORD' ) ) {
		echo '<p>Пароль задан в настройках сервера (REC_STUDIO_SMTP_PASSWORD).</p>';
	} else {
		echo '<input class="regular-text" type="password" id="rec-mail-password" name="password" autocomplete="new-password" value="" maxlength="512"><p class="description">' . ( $settings['password'] ? 'Пароль сохранён. Оставьте поле пустым, чтобы не менять его.' : 'Введите пароль этого почтового ящика.' ) . '</p>';
	}
	echo '</td></tr><tr><th><label for="rec-mail-port">Соединение</label></th><td><select id="rec-mail-port" name="port"><option value="465" ' . selected( $settings['port'], 465, false ) . '>SSL, порт 465</option><option value="587" ' . selected( $settings['port'], 587, false ) . '>STARTTLS, порт 587</option></select><p class="description">Сервер: smtp.timeweb.ru</p></td></tr></tbody></table>';
	submit_button( 'Сохранить настройки' );
	echo '</form><hr><h2>Проверка отправки</h2><p>Сначала сохраните настройки. Проверочное письмо будет отправлено указанному получателю заявок.</p><form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '"><input type="hidden" name="action" value="rec_studio_test_mail">';
	wp_nonce_field( 'rec_studio_test_mail' );
	submit_button( 'Отправить проверочное письмо', 'secondary' );
	echo '</form>';
	$status = get_option( 'rec_studio_mail_status' );
	if ( is_array( $status ) ) { echo '<p>Последняя попытка: ' . esc_html( wp_date( 'd.m.Y H:i', $status['time'] ) ) . ' — ' . ( $status['ok'] ? 'письмо принято почтовым сервером.' : 'ошибка отправки.' ) . '</p>'; }
	echo '<p>После проверки убедитесь, что письмо появилось в почте получателя. Принятие сервером само по себе не подтверждает доставку во входящие.</p></div>';
}

function rec_studio_mail_admin_finish( $ok, $message ) {
	set_transient( 'rec_mail_notice_' . get_current_user_id(), array( 'ok' => $ok, 'message' => $message ), MINUTE_IN_SECONDS );
	wp_safe_redirect( admin_url( 'admin.php?page=rec-studio-mail' ) );
	exit;
}

function rec_studio_save_mail_settings() {
	if ( ! current_user_can( 'manage_options' ) ) { wp_die( 'Недостаточно прав.', '', array( 'response' => 403 ) ); }
	check_admin_referer( 'rec_studio_save_mail' );
	$input = wp_unslash( $_POST );
	foreach ( array( 'username', 'recipient' ) as $key ) {
		if ( ! isset( $input[ $key ] ) || ! is_string( $input[ $key ] ) || ! is_email( $input[ $key ] ) ) { rec_studio_mail_admin_finish( false, 'Укажите корректные адреса почтового ящика и получателя.' ); }
	}
	$saved = get_option( 'rec_studio_mail_settings', array() );
	$settings = array( 'enabled' => isset( $input['enabled'] ) && '1' === $input['enabled'], 'username' => $input['username'], 'recipient' => $input['recipient'], 'port' => isset( $input['port'] ) && '587' === $input['port'] ? 587 : 465, 'password' => is_array( $saved ) ? ( $saved['password'] ?? '' ) : '' );
	if ( ! defined( 'REC_STUDIO_SMTP_PASSWORD' ) && isset( $input['password'] ) && '' !== $input['password'] ) {
		if ( ! is_string( $input['password'] ) || strlen( $input['password'] ) > 512 || preg_match( '/[\r\n\x00]/', $input['password'] ) ) { rec_studio_mail_admin_finish( false, 'Проверьте пароль почтового ящика.' ); }
		// Preserve password characters exactly; never echo a saved password into HTML.
		$settings['password'] = $input['password'];
	}
	if ( $settings['enabled'] && ! ( defined( 'REC_STUDIO_SMTP_PASSWORD' ) ? REC_STUDIO_SMTP_PASSWORD : $settings['password'] ) ) { rec_studio_mail_admin_finish( false, 'Введите пароль перед включением отправки.' ); }
	update_option( 'rec_studio_mail_settings', $settings, false );
	rec_studio_mail_admin_finish( true, 'Настройки сохранены.' );
}
add_action( 'admin_post_rec_studio_save_mail', 'rec_studio_save_mail_settings' );

function rec_studio_test_mail() {
	if ( ! current_user_can( 'manage_options' ) ) { wp_die( 'Недостаточно прав.', '', array( 'response' => 403 ) ); }
	check_admin_referer( 'rec_studio_test_mail' );
	$key = 'rec_mail_test_' . get_current_user_id();
	if ( get_transient( $key ) ) { rec_studio_mail_admin_finish( false, 'Подождите минуту перед повторной проверкой.' ); }
	set_transient( $key, 1, MINUTE_IN_SECONDS );
	$result = rec_studio_send_mail( 'REC Studio — проверка почты', 'Проверка отправки заявок с сайта ' . home_url( '/' ) . "\nДата: " . wp_date( 'd.m.Y H:i:s' ) );
	rec_studio_mail_admin_finish( ! is_wp_error( $result ), is_wp_error( $result ) ? $result->get_error_message() : 'Письмо принято почтовым сервером. Проверьте почту получателя, включая папку «Спам».' );
}
add_action( 'admin_post_rec_studio_test_mail', 'rec_studio_test_mail' );
