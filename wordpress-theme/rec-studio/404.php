<?php
/**
 * Not found template.
 *
 * @package RecStudio
 */

get_header();
?>
<main class="rec-wp-content">
	<h1><?php esc_html_e( 'Страница не найдена', 'rec-studio' ); ?></h1>
	<p><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Вернуться на главную', 'rec-studio' ); ?></a></p>
</main>
<?php
get_footer();
