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
            <span class="rec">REC</span><span class="studio">STUDIO</span>
          </div>

          <div class="logo-sub">PRODUCTION COMPANY</div>
        </div>
      </div>

      <section class="settings">
        <button class="settings__lang-btn" type="button">RU</button>

        <button class="settings__valume-btn" type="button">
          <img
            src="<?php echo esc_url( rec_theme_asset( 'assets/sound-on.png' ) ); ?>"
            class="settings__valume-btn__img"
            alt="volume"
          />
        </button>
      </section>

      <section class="menu">
        <div class="menu-block">
          <div class="menu-text">МЕНЮ</div>

          <button class="burger" type="button" aria-label="Меню">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </section>

      <section class="content">
        <div class="content__links">
          <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="content__links__item faq">ГЛАВНАЯ</a>
          <a href="<?php echo esc_url( rec_theme_page_url( 'projects' ) ); ?>" class="content__links__item projects">
            НАШИ ПРОЕКТЫ
          </a>
          <a href="<?php echo esc_url( rec_theme_page_url( 'help' ) ); ?>" class="content__links__item help">УСЛУГИ</a>
          <a href="<?php echo esc_url( rec_theme_page_url( 'news' ) ); ?>" class="content__links__item news">НОВОСТИ</a>
          <a href="<?php echo esc_url( rec_theme_page_url( 'contacts' ) ); ?>" class="content__links__item contact">
            КОНТАКТЫ
          </a>
        </div>
      </section>
    </main>
<?php
get_footer();