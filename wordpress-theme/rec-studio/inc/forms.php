<?php
/** Server-side delivery for the public enquiry forms. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function rec_studio_mail_settings() {
	$saved = get_option( 'rec_studio_mail_settings', array() );
	$settings = array_merge( array( 'enabled' => false, 'username' => 'info@recstudio.biz', 'recipient' => 'info@recstudio.biz', 'password' => '', 'port' => 465 ), is_array( $saved ) ? $saved : array() );
	// A server constant takes precedence; secrets never enter the public content option.
	if ( defined( 'REC_STUDIO_SMTP_PASSWORD' ) ) { $settings['password'] = (string) REC_STUDIO_SMTP_PASSWORD; }
	return $settings;
}

function rec_studio_send_mail( $subject, $body, $reply_to = '' ) {
	$settings = rec_studio_mail_settings();
	if ( empty( $settings['enabled'] ) || ! $settings['password'] || ! is_email( $settings['username'] ) || ! is_email( $settings['recipient'] ) ) {
		return new WP_Error( 'mail_unconfigured', 'Отправка пока не настроена.' );
	}
	require_once ABSPATH . WPINC . '/PHPMailer/Exception.php';
	require_once ABSPATH . WPINC . '/PHPMailer/PHPMailer.php';
	require_once ABSPATH . WPINC . '/PHPMailer/SMTP.php';
	try {
		// A dedicated instance leaves WordPress and other plugins' mail settings intact.
		$mail = new \PHPMailer\PHPMailer\PHPMailer( true );
		$mail->isSMTP();
		$mail->Host = 'smtp.timeweb.ru';
		$mail->Port = 587 === (int) $settings['port'] ? 587 : 465;
		$mail->SMTPSecure = 587 === $mail->Port ? 'tls' : 'ssl';
		$mail->SMTPAuth = true;
		$mail->Username = $settings['username'];
		$mail->Password = $settings['password'];
		$mail->Timeout = 15;
		$mail->Timelimit = 20;
		$mail->SMTPDebug = 0;
		$mail->CharSet = 'UTF-8';
		$mail->setFrom( $settings['username'], 'REC Studio' );
		$mail->addAddress( $settings['recipient'] );
		if ( $reply_to ) { $mail->addReplyTo( $reply_to ); }
		$mail->Subject = $subject;
		$mail->Body = $body;
		$mail->isHTML( false );
		if ( ! $mail->send() ) { throw new \RuntimeException( 'Delivery failed' ); }
		update_option( 'rec_studio_mail_status', array( 'ok' => true, 'time' => time() ), false );
		return true;
	} catch ( \Exception $error ) {
		// No credentials, message contents or raw SMTP responses in logs or public errors.
		update_option( 'rec_studio_mail_status', array( 'ok' => false, 'time' => time() ), false );
		return new WP_Error( 'mail_failed', 'Почтовый сервер не принял письмо. Проверьте подключение и настройки почты.' );
	}
}

function rec_studio_form_fields( $type ) {
	echo '<input type="hidden" name="form_type" value="' . esc_attr( $type ) . '">';
	echo '<div class="rec-form-trap" aria-hidden="true"><label>Оставьте это поле пустым<input type="text" name="company_site" tabindex="-1" autocomplete="off"></label></div>';
	echo '<p class="rec-form-status" role="status" aria-live="polite" tabindex="-1" hidden></p>';
}

function rec_studio_form_token() {
	nocache_headers();
	wp_send_json_success( array( 'nonce' => wp_create_nonce( 'rec_studio_form' ) ) );
}
add_action( 'wp_ajax_rec_studio_form_token', 'rec_studio_form_token' );
add_action( 'wp_ajax_nopriv_rec_studio_form_token', 'rec_studio_form_token' );

function rec_studio_validate_form( $input ) {
	$limits = array( 'form_type' => 20, 'email' => 254, 'phone' => 80, 'name' => 120, 'message' => 5000, 'project' => 250, 'service_key' => 80, 'request_id' => 80, 'company_site' => 200 );
	$data = array();
	foreach ( $limits as $key => $limit ) {
		$value = $input[ $key ] ?? '';
		if ( ! is_string( $value ) || strlen( $value ) > $limit * 4 ) { return new WP_Error( 'invalid', 'Проверьте заполнение полей.' ); }
		$data[ $key ] = 'message' === $key ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );
	}
	if ( $data['company_site'] || ! preg_match( '/^[a-zA-Z0-9-]{16,80}$/D', $data['request_id'] ) || ! in_array( $data['form_type'], array( 'project', 'service', 'price' ), true ) ) { return new WP_Error( 'invalid', 'Не удалось отправить форму. Обновите страницу.' ); }
	if ( ! preg_match( '/^[+\d\s().-]{6,80}$/uD', $data['phone'] ) || strlen( preg_replace( '/\D/', '', $data['phone'] ) ) < 6 ) { return new WP_Error( 'phone', 'Укажите телефон для связи.' ); }
	$raw_email = $input['email'] ?? '';
	if ( $raw_email && ( preg_match( '/[\r\n]/', $raw_email ) || ! is_email( trim( $raw_email ) ) ) ) { return new WP_Error( 'email', 'Проверьте адрес электронной почты.' ); }
	$data['email'] = trim( $raw_email );
	$data['download'] = '';
	$data['service'] = '';
	$data['request_types'] = array();
	if ( 'project' === $data['form_type'] ) {
		$types = $input['request_type'] ?? array();
		if ( ! is_array( $types ) || ! count( $types ) || count( $types ) > 3 ) { return new WP_Error( 'type', 'Выберите хотя бы один тип заявки.' ); }
		foreach ( $types as $type ) {
			if ( ! is_string( $type ) || ! in_array( $type, array( 'buy', 'develop', 'produce' ), true ) ) { return new WP_Error( 'type', 'Выберите тип заявки.' ); }
			$data['request_types'][] = rec_studio_content( 'request_' . $type );
		}
	} else {
		foreach ( rec_studio_records( 'rec_service' ) as $record ) {
			if ( $record['key'] === $data['service_key'] ) {
				$data['service'] = $record['title'];
				if ( 'price' === $data['form_type'] ) { $data['download'] = esc_url_raw( $record['meta']['price'] ?? '', array( 'http', 'https' ) ); }
				break;
			}
		}
		if ( ! $data['service'] ) { return new WP_Error( 'service', 'Услуга недоступна. Обновите страницу и выберите услугу заново.' ); }
	}
	return $data;
}

function rec_studio_process_form( $input, $ip ) {
	$data = rec_studio_validate_form( $input );
	if ( is_wp_error( $data ) ) { return $data; }
	$identity = hash_hmac( 'sha256', (string) $ip, wp_salt( 'nonce' ) );
	$request = 'rec_form_sent_' . hash( 'sha256', $identity . $data['request_id'] );
	$fingerprint = hash( 'sha256', wp_json_encode( $data ) );
	$sent = get_transient( $request );
	if ( $sent ) { return hash_equals( $sent['fingerprint'], $fingerprint ) ? $sent['result'] : new WP_Error( 'conflict', 'Обновите страницу перед новой заявкой.' ); }
	// add_option is atomic; concurrent requests from one client cannot send duplicates.
	$lock = 'rec_form_lock_' . $identity;
	$locked_at = (int) get_option( $lock, 0 );
	if ( $locked_at && $locked_at < time() - 120 ) { delete_option( $lock ); }
	if ( ! add_option( $lock, time(), '', false ) ) { return new WP_Error( 'busy', 'Заявка уже отправляется. Подождите немного.' ); }
	try {
		// A preceding request may have completed between our first lookup and locking.
		$sent = get_transient( $request );
		if ( $sent ) { return hash_equals( $sent['fingerprint'], $fingerprint ) ? $sent['result'] : new WP_Error( 'conflict', 'Обновите страницу перед новой заявкой.' ); }
		$rate_key = 'rec_form_rate_' . $identity;
		$count = (int) get_transient( $rate_key );
		if ( $count >= 5 ) { return new WP_Error( 'rate', 'Слишком много попыток. Повторите через 10 минут.' ); }
		set_transient( $rate_key, $count + 1, 10 * MINUTE_IN_SECONDS );
		$subjects = array( 'project' => 'Заявка на проект', 'service' => 'Заявка на услугу', 'price' => 'Запрос прайс-листа' );
		$body = implode( "\n", array(
			$subjects[ $data['form_type'] ], 'Сайт: ' . home_url( '/' ),
			'Проект: ' . ( $data['project'] ?: 'Не выбран' ), 'Услуга: ' . ( $data['service'] ?: 'Не выбрана' ),
			'Тип заявки: ' . implode( ', ', $data['request_types'] ), 'Имя: ' . $data['name'],
			'Телефон: ' . $data['phone'], 'Email: ' . $data['email'], '', 'Сообщение:', $data['message'],
		) );
		$delivery = rec_studio_send_mail( 'REC Studio — ' . $subjects[ $data['form_type'] ], $body, $data['email'] );
		if ( is_wp_error( $delivery ) ) { return new WP_Error( 'delivery', 'Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами по телефону из раздела «Контакты».' ); }
		$result = array( 'message' => rec_studio_content( 'form_success' ), 'download' => $data['download'] );
		set_transient( $request, array( 'fingerprint' => $fingerprint, 'result' => $result ), HOUR_IN_SECONDS );
		return $result;
	} finally {
		delete_option( $lock );
	}
}

function rec_studio_submit_form() {
	nocache_headers();
	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) { wp_send_json_error( array( 'message' => 'Требуется отправка формы.' ), 405 ); }
	$input = wp_unslash( $_POST );
	if ( ! isset( $input['nonce'] ) || ! is_string( $input['nonce'] ) || ! wp_verify_nonce( $input['nonce'], 'rec_studio_form' ) ) { wp_send_json_error( array( 'message' => 'Обновите страницу и повторите отправку.' ), 403 ); }
	$result = rec_studio_process_form( $input, $_SERVER['REMOTE_ADDR'] ?? '' );
	if ( is_wp_error( $result ) ) {
		$code = $result->get_error_code();
		$status = 'delivery' === $code ? 503 : ( in_array( $code, array( 'rate', 'busy' ), true ) ? 429 : 400 );
		wp_send_json_error( array( 'message' => $result->get_error_message() ), $status );
	}
	wp_send_json_success( $result );
}
add_action( 'wp_ajax_rec_studio_submit_form', 'rec_studio_submit_form' );
add_action( 'wp_ajax_nopriv_rec_studio_submit_form', 'rec_studio_submit_form' );
