<?php
/**
 * Template Name: REC Help
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
    <section class="content content--page help-content">
      <div class="help-bg">
        <img src="<?php echo esc_url( rec_theme_asset( 'assets/a.jpg' ) ); ?>" class="help-bg__img" alt="Услуги REC Studio" decoding="async" fetchpriority="high">
      </div>

      <div class="help-stage">
        <section class="help-hero">
          <div class="help-paralax-text">
            <h1 class="help__title mask"><?php rec_studio_text( 'help_title' ); ?></h1>

            <p class="help__subtitle"><?php rec_studio_text( 'help_subtitle' ); ?></p>

            <div class="help-services-viewport">
              <div class="help-services"><?php rec_studio_render_ticker( 'help' ); ?></div>
            </div>
          </div>
        </section>

        <section class="help-cards-section"><?php rec_studio_render_service_cards(); ?></section>
      </div>

      <div class="help-detail" aria-hidden="true">
        <div class="help-detail__nav">
          <div class="help-detail__breadcrumbs">
            <button class="help-detail__breadcrumbs-home" type="button" aria-label="Перейти на страницу услуг"><?php rec_studio_text( 'help_breadcrumb' ); ?></button>
            <span class="help-detail__breadcrumbs-separator">&gt;</span>
            <button class="help-detail__breadcrumbs-current" type="button" aria-label="Переключить набор услуг"></button>
          </div>

          <div class="help-detail__nav-list"></div>

          <div class="help-detail__downloads">
            <button class="help-detail__back" type="button" aria-label="Вернуться к списку услуг"></button>

            <a href="#" class="help-detail__download-link"><?php rec_studio_text( 'presentation_label' ); ?></a>

            <a href="#" class="help-detail__download-price"><?php rec_studio_text( 'price_label' ); ?></a>
            <button type="button" class="help-open-request"><?php rec_studio_text( 'request_button' ); ?></button>
          </div>
        </div>

        <div class="help-detail__info">
          <div class="help-detail__text">
            <div class="help-detail__description"></div>

            <div class="help-detail__services">
              <h3><?php rec_studio_text( 'service_list_label' ); ?></h3>
              <ul class="help-detail__services-list"></ul>
            </div>
          </div>

          <button class="help-detail__arrow" type="button" aria-label="Следующий раздел"></button>
        </div>

        <div class="help-detail__media">
          <img class="help-detail__img" src="" alt="">
        </div>
      </div>

      <div class="help-price-popup" aria-hidden="true">
        <div class="help-price-popup__container">
          <div class="help-price-popup__dialog" role="dialog" aria-modal="true">
            <button type="button" class="help-price-popup__close" aria-label="Закрыть">
              ×
            </button>

            <div class="help-price-popup__title"><?php rec_studio_text( 'price_form_title' ); ?></div>

            <form class="help-price-form" method="post">
              <?php rec_studio_form_fields( 'price' ); ?>
              <div class="help-price-form__row">
                <div class="help-price-form__label"><?php rec_studio_text( 'field_email' ); ?></div>
                <div class="help-price-form__field">
                  <input type="email" name="email" autocomplete="email" maxlength="254" aria-label="Email">
                </div>
              </div>

              <div class="help-price-form__row">
                <div class="help-price-form__label"><?php rec_studio_text( 'field_phone' ); ?></div>
                <div class="help-price-form__field">
                  <input type="tel" name="phone" required autocomplete="tel" maxlength="80" aria-label="Телефон">
                </div>
              </div>

              <button type="submit" class="help-price-form__submit"><?php rec_studio_text( 'price_submit' ); ?></button>
            </form>
          </div>
        </div>
      </div>

      <div class="help-request-popup" aria-hidden="true">
        <div class="help-request-popup__container">
          <div class="help-request-popup__dialog" role="dialog" aria-modal="true">
            <button type="button" class="help-request-popup__close" aria-label="Закрыть">
              ×
            </button>

            <div class="help-request-popup__title"><?php rec_studio_text( 'service_form_title' ); ?></div>

            <form class="help-request-form" method="post">
              <?php rec_studio_form_fields( 'service' ); ?>
              <input type="hidden" name="service" class="help-request-form__service">

              <div class="help-request-form__row">
                <div class="help-request-form__label"><?php rec_studio_text( 'field_service' ); ?></div>
                <div class="help-request-form__field">
                  <input type="text" name="service_visible" class="help-request-form__service-visible" readonly="">
                </div>
              </div>

              <div class="help-request-form__row">
                <div class="help-request-form__label"><?php rec_studio_text( 'field_email' ); ?></div>
                <div class="help-request-form__field">
                  <input type="email" name="email" autocomplete="email" maxlength="254" aria-label="Email">
                </div>
              </div>

              <div class="help-request-form__row">
                <div class="help-request-form__label"><?php rec_studio_text( 'field_phone' ); ?></div>
                <div class="help-request-form__field">
                  <input type="tel" name="phone" required autocomplete="tel" maxlength="80" aria-label="Телефон">
                </div>
              </div>

              <div class="help-request-form__row">
                <div class="help-request-form__label"><?php rec_studio_text( 'field_name' ); ?></div>
                <div class="help-request-form__field">
                  <input type="text" name="name" autocomplete="name" maxlength="120" aria-label="Имя">
                </div>
              </div>

              <div class="help-request-form__row help-request-form__row--textarea">
                <div class="help-request-form__label"><?php rec_studio_text( 'field_message' ); ?></div>
                <div class="help-request-form__field">
                  <textarea name="message" maxlength="5000" aria-label="Сообщение"></textarea>
                </div>
              </div>

              <button type="submit" class="help-request-form__submit"><?php rec_studio_text( 'form_submit' ); ?></button>
            </form>
          </div>
        </div>
      </div>

      <button class="help-arrow" type="button" aria-label="Листать ниже"></button>
    </section>
<?php get_footer(); ?>
