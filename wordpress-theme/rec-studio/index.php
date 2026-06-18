<?php
/**
 * Main fallback template.
 *
 * @package RecStudio
 */

get_header();
?>
<main class="rec-wp-content">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : ?>
			<?php the_post(); ?>
			<article <?php post_class(); ?>>
				<h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
				<?php the_excerpt(); ?>
			</article>
		<?php endwhile; ?>
		<?php the_posts_navigation(); ?>
	<?php else : ?>
		<p><?php esc_html_e( 'Материалы не найдены.', 'rec-studio' ); ?></p>
	<?php endif; ?>
</main>
<?php
get_footer();
