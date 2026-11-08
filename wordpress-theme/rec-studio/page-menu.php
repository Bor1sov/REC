<?php
/**
 * Template Name: REC Menu
 *
 * @package RecStudio
 */

get_header();
?>
<main class="main-container hidden">
      <div class="logo-wrapper">
        <div class="main__container__logo"></div>

        <div class="logo-text">
          <div class="logo-top">
            <span class="rec"><?php rec_studio_text( 'brand_rec' ); ?></span><span class="studio"><?php rec_studio_text( 'brand_studio' ); ?></span>
          </div>

          <div class="logo-sub"><?php rec_studio_text( 'brand_tagline' ); ?></div>
        </div>
      </div>

      <section class="settings">
        <button class="settings__lang-btn" type="button"><?php rec_studio_text( 'language_label' ); ?></button>

        <button class="settings__valume-btn" type="button">
          <img src="<?php echo esc_url( rec_theme_asset( 'assets/sound-on.png' ) ); ?>" class="settings__valume-btn__img" alt="volume">
        </button>
      </section>

      <section class="menu">
        <div class="menu-block">
          <div class="menu-text"><?php rec_studio_text( 'menu_label' ); ?></div>

          <button class="burger" type="button" aria-label="Меню">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </section>

      <section class="content">
        <div class="content__links">
          <a href="<?php echo esc_url( rec_studio_menu_url( 'home' ) ); ?>" class="content__links__item faq"><?php rec_studio_text( 'menu_home' ); ?></a>
          <a href="<?php echo esc_url( rec_studio_menu_url( 'projects' ) ); ?>" class="content__links__item projects"><?php rec_studio_text( 'menu_projects' ); ?></a>
          <a href="<?php echo esc_url( rec_studio_menu_url( 'help' ) ); ?>" class="content__links__item help"><?php rec_studio_text( 'menu_help' ); ?></a>
          <a href="<?php echo esc_url( rec_studio_menu_url( 'news' ) ); ?>" class="content__links__item news"><?php rec_studio_text( 'menu_news' ); ?></a>
          <a href="<?php echo esc_url( rec_studio_menu_url( 'contacts' ) ); ?>" class="content__links__item contact"><?php rec_studio_text( 'menu_contacts' ); ?></a>
        </div>
      </section>
    </main>
<?php get_footer(); ?>
