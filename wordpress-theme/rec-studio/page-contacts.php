<?php
/**
 * Template Name: REC Contacts
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
    <section class="content contacts">
      <div class="contacts__inner">
        <div class="contacts__map">
          <div style="position: relative; overflow: hidden">
            <?php if ( rec_studio_content( 'contact_map' ) ) : ?>
              <iframe src="<?php echo esc_url( rec_studio_content( 'contact_map' ) ); ?>" width="100%" height="100%" frameborder="0" allowfullscreen="true" style="position: relative" title="Карта"></iframe>
            <?php endif; ?>
          </div>
        </div>

        <div class="contacts__info">
          <div class="contacts__phone">
            <a href="<?php echo esc_url( rec_studio_content( 'social_telegram' ) ); ?>" class="contacts__social contacts__social--telegram" aria-label="Telegram"></a>

            <a href="<?php echo esc_url( rec_studio_content( 'social_phone' ) ); ?>" class="contacts__social contacts__social--phone" aria-label="Phone"></a>

            <a href="<?php echo esc_url( rec_studio_content( 'social_play' ) ); ?>" class="contacts__social contacts__social--play" aria-label="Max"></a>

            <a class="contacts__phone-number" href="<?php echo esc_url( 'tel:' . preg_replace( '/[^+0-9]/', '', rec_studio_content( 'contact_phone' ) ) ); ?>"><?php rec_studio_text( 'contact_phone' ); ?></a>
          </div>

          <div class="contacts__subscribe">
            <span><?php rec_studio_text( 'contact_subscribe' ); ?></span>

            <div class="contacts__socials">
              <a href="<?php echo esc_url( rec_studio_content( 'social_telegram' ) ); ?>" class="contacts__social contacts__social--telegram" aria-label="Telegram"></a>

              <a href="<?php echo esc_url( rec_studio_content( 'social_dzen' ) ); ?>" class="contacts__social contacts__social--dzen" aria-label="Dzen"></a>

              <a href="<?php echo esc_url( rec_studio_content( 'social_vk' ) ); ?>" target="_blank" rel="noopener" class="contacts__social contacts__social--vk" aria-label="VK"></a>

              <a href="<?php echo esc_url( rec_studio_content( 'social_ok' ) ); ?>" class="contacts__social contacts__social--ok" aria-label="OK"></a>
            </div>
          </div>

          <div class="contacts__place">
            <div class="contacts__pin"></div>

            <div class="contacts__place-content">
              <h2 class="contacts__place-title"><?php rec_studio_text( 'contact_place' ); ?></h2>

              <p class="contacts__address"><?php rec_studio_text( 'contact_address' ); ?></p>
            </div>
          </div>
        </div>

        <h1 class="contacts__title"><?php rec_studio_text( 'contacts_title' ); ?></h1>

        <div class="contacts__copyright"><?php rec_studio_text( 'copyright' ); ?></div>
      </div>
    </section>
<?php get_footer(); ?>
