<?php
/**
 * Template Name: REC News
 *
 * @package RecStudio
 */

get_header();
?>
<section class="menu">
      <a class="menu__logo-cont" href="<?php echo esc_url( rec_theme_page_url( 'menu' ) ); ?>"></a>

      <div class="menu-block" onclick="window.location.href='<?php echo esc_url( rec_theme_page_url( 'menu' ) ); ?>'">
        <div class="menu-text"><?php rec_studio_text( 'menu_label' ); ?></div>

        <button class="burger" type="button" aria-label="Вернуться в меню">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </section>


    <section class="settings">
      <button class="settings__lang-btn"><?php rec_studio_text( 'language_label' ); ?></button>
      <button class="settings__valume-btn">
        <img src="<?php echo esc_url( rec_theme_asset( 'assets/sound-on.png' ) ); ?>" class="settings__valume-btn__img" alt="volume">
      </button>
    </section>
    <section class="content content--page news-content">
      <div class="news-stage"><?php rec_studio_render_news(); ?></div>

      <button class="news-arrow" type="button" aria-label="Листать ниже"></button>
    </section>
<?php get_footer(); ?>
