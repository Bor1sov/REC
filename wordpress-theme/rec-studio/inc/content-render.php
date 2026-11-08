<?php
/** Front-end markup shared by the standalone pages and the home sections. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function rec_studio_render_ticker( $kind ) {
	$items = rec_studio_lines( rec_studio_content( $kind . '_ticker' ) );
	for ( $copy = 0; $copy < 2; $copy++ ) {
		foreach ( $items as $item ) {
			echo '<div class="' . esc_attr( $kind . '-service' ) . '"' . ( $copy ? ' aria-hidden="true"' : '' ) . '><span></span><p>' . esc_html( $item ) . '</p></div>';
		}
	}
}

function rec_studio_render_projects( $group ) {
	$found = false;
	foreach ( rec_studio_records( 'rec_project' ) as $record ) {
		$meta = $record['meta'];
		if ( ( $meta['group'] ?? 'series' ) !== $group ) { continue; }
		$found = true;
		$data = array( 'title' => $record['title'], 'description' => wp_strip_all_tags( $record['content'] ), 'description-html' => $record['content'] );
		$data['status'] = ! empty( $meta['status'] ) ? $meta['status'] : rec_studio_content( 'project_status' );
		foreach ( array( 'genre', 'note', 'age', 'format', 'duration', 'featured', 'home_order', 'teaser' ) as $key ) { $data[ str_replace( '_', '-', $key ) ] = $meta[ $key ] ?? ''; }
		echo '<article class="project-card"';
		foreach ( $data as $key => $value ) { echo ' data-project-' . esc_attr( $key ) . '="' . esc_attr( $value ) . '"'; }
		echo '><img src="' . esc_url( $meta['image'] ?? '' ) . '" alt="' . esc_attr( $record['title'] ) . '" loading="lazy"></article>';
	}
	if ( ! $found ) { echo '<p class="rec-content-empty">' . esc_html( rec_studio_content( 'empty_projects' ) ) . '</p>'; }
}

function rec_studio_render_service_cards() {
	$groups = rec_studio_service_groups();
	foreach ( $groups as $key => $group ) {
		echo '<article class="help-large-card" data-help-kind="' . esc_attr( $key ) . '" data-help-title="' . esc_attr( $group['title'] ) . '"><img src="' . esc_url( $group['image'] ) . '" alt="' . esc_attr( $group['title'] ) . '" loading="lazy"><div class="help-large-card__overlay"><h2>' . nl2br( esc_html( $group['title'] ) ) . '</h2></div></article>';
	}
	if ( ! $groups ) { echo '<p class="rec-content-empty">' . esc_html( rec_studio_content( 'empty_services' ) ) . '</p>'; }
}

function rec_studio_news_date( $record ) { return mysql2date( 'd.m.y', $record['date'] ); }

function rec_studio_render_news() {
	$records = rec_studio_records( 'rec_news' );
	foreach ( $records as $index => $record ) {
		$group = $record['meta']['group'] ?? 'authors';
		?>
		<section class="news-article" data-news-article="<?php echo esc_attr( $record['key'] ); ?>">
			<div class="news-article__top"><div class="news-article__date"><?php echo esc_html( rec_studio_news_date( $record ) ); ?></div><div class="news-article__category"><?php rec_studio_text( 'news_' . $group ); ?></div></div>
			<h1 class="news-article__title"><?php echo esc_html( $record['title'] ); ?></h1>
			<h2 class="news-article__lead"><?php echo wp_kses_post( $record['excerpt'] ?? '' ); ?></h2>
			<div class="rec-news-body"><?php echo $record['content']; // Sanitized by rec_studio_records. ?></div>
			<div class="news-share"><span><?php rec_studio_text( 'news_share' ); ?></span><div class="news-share__icons">
			<?php foreach ( array( 'vk' => 'social-vk.png', 'telegram' => 'social-telegram.png', 'dzen' => 'social-facebook.png', 'ok' => 'odnoklassniki-white.png' ) as $social => $icon ) : ?>
				<a href="<?php echo esc_url( rec_studio_content( 'social_' . $social ) ); ?>" target="_blank" rel="noopener noreferrer"><img src="<?php echo esc_url( rec_theme_asset( 'assets/' . $icon ) ); ?>" alt="<?php echo esc_attr( $social ); ?>"></a>
			<?php endforeach; ?></div></div>
			<button class="news-scroll-to-top" type="button" aria-label="Наверх"></button>
			<div class="news-related">
			<?php foreach ( array( -1 => 'news_previous', 1 => 'news_next' ) as $offset => $label ) :
				$related = $records[ $index + $offset ] ?? null;
				if ( ! $related ) { continue; } ?>
				<button type="button" class="news-related__item" data-news-target="<?php echo esc_attr( $related['key'] ); ?>"><span><?php rec_studio_text( $label ); ?></span><span class="news-related__card"><img src="<?php echo esc_url( $related['meta']['image'] ?? '' ); ?>" alt="" loading="lazy"><span><small><?php echo esc_html( rec_studio_news_date( $related ) ); ?></small><strong><?php echo esc_html( $related['title'] ); ?></strong></span></span></button>
			<?php endforeach; ?></div>
		</section>
		<?php
	}
	?>
	<section class="news-list-section">
		<div class="news-list-section__label"><?php rec_studio_text( 'news_title' ); ?></div>
		<div class="news-list-section__content">
			<div class="news-tabs"><?php foreach ( array( 'old', 'producers', 'marketers', 'authors', 'all' ) as $filter ) : ?><button type="button" class="news-tabs__item<?php echo 'all' === $filter ? ' is-active' : ''; ?>" data-news-filter="<?php echo esc_attr( $filter ); ?>"><?php rec_studio_text( 'news_' . $filter ); ?></button><?php endforeach; ?></div>
			<div class="news-list">
			<?php foreach ( $records as $record ) : $meta = $record['meta']; ?>
				<button type="button" class="news-list__item" data-news-target="<?php echo esc_attr( $record['key'] ); ?>" data-news-tags="<?php echo esc_attr( ( $meta['group'] ?? 'authors' ) . ( ! empty( $meta['archived'] ) ? ' old' : '' ) ); ?>"><img src="<?php echo esc_url( $meta['image'] ?? '' ); ?>" alt="" loading="lazy"><span><small><?php echo esc_html( rec_studio_news_date( $record ) ); ?></small><strong><?php echo esc_html( $record['title'] ); ?></strong></span></button>
			<?php endforeach; ?>
			<?php if ( ! $records ) : ?><p class="rec-content-empty"><?php rec_studio_text( 'empty_news' ); ?></p><?php endif; ?>
			</div>
			<div class="news-list-section__bottom"><a href="<?php echo esc_url( rec_studio_content( 'social_vk' ) ); ?>" class="news-list-section__vk" target="_blank" rel="noopener noreferrer"><span></span><?php rec_studio_text( 'news_vk_label' ); ?></a></div>
		</div>
	</section>
	<?php
}
