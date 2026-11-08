<?php
/**
 * Template Name: REC Projects
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

    <section class="content content--page projects-content">
      <div class="projects-bg">
        <img src="<?php echo esc_url( rec_theme_asset( 'assets/b.jpg' ) ); ?>" class="projects-bg__img" alt="Наши проекты" decoding="async" fetchpriority="high">
      </div>

      <div class="projects-stage">
        <section class="projects-hero">
          <div class="projects-paralax-text">
            <h1 class="projects__title mask"><?php rec_studio_text( 'projects_title' ); ?></h1>

            <p class="projects__subtitle"><?php rec_studio_text( 'projects_subtitle' ); ?></p>

            <div class="projects-services-viewport">
              <div class="projects-services"><?php rec_studio_render_ticker( 'projects' ); ?></div>
            </div>
          </div>
        </section>

        <section class="projects-section projects-section--series">
          <div class="projects-section__head">
            <h2><?php rec_studio_text( 'projects_category_series' ); ?></h2>
            <button type="button" class="projects-open-request"><?php rec_studio_text( 'request_button' ); ?></button>
          </div>

          <div class="projects-grid projects-grid--series"><?php rec_studio_render_projects( 'series' ); ?></div>
        </section>

        <section class="projects-section projects-section--cinema">
          <div class="projects-section__head">
            <h2><?php rec_studio_text( 'projects_category_cinema' ); ?></h2>
            <button type="button" class="projects-open-request"><?php rec_studio_text( 'request_button' ); ?></button>
          </div>

          <div class="projects-grid projects-grid--cinema"><?php rec_studio_render_projects( 'cinema' ); ?></div>
        </section>

        <section class="projects-section projects-section--documentary">
          <div class="projects-section__head">
            <h2><?php rec_studio_text( 'projects_category_documentary' ); ?></h2>
            <button type="button" class="projects-open-request"><?php rec_studio_text( 'request_button' ); ?></button>
          </div>

          <div class="projects-grid projects-grid--documentary"><?php rec_studio_render_projects( 'documentary' ); ?></div>
        </section>

        <section class="projects-section projects-section--tv">
          <div class="projects-section__head">
            <h2><?php rec_studio_text( 'projects_category_tv' ); ?></h2>
            <button type="button" class="projects-open-request"><?php rec_studio_text( 'request_button' ); ?></button>
          </div>

          <div class="projects-grid projects-grid--tv"><?php rec_studio_render_projects( 'tv' ); ?></div>
        </section>
      </div>

      <div class="project-detail" aria-hidden="true">
        <div class="project-detail__media">
          <img class="project-detail__img" src="" alt="">
        </div>

        <div class="project-detail__content">
          <div class="project-detail__top">
            <h2 class="project-detail__title"></h2>

            <p class="project-detail__genre"></p>
            <p class="project-detail__note"></p>
          </div>

          <div class="project-detail__text-wrap">
            <div class="project-detail__text">
              <div class="project-detail__description"></div>
            </div>

            <div class="project-detail__scrollbar">
              <div class="project-detail__scrollbar-fill"></div>
            </div>
          </div>

          <div class="project-detail__meta">
            <span class="project-detail__age"></span>
            <span class="project-detail__divider"></span>
            <span class="project-detail__format"></span>
            <span class="project-detail__divider"></span>
            <span class="project-detail__duration"></span>
          </div>

          <div class="project-detail__status"><?php rec_studio_status( 'project_status' ); ?></div>

          <div class="project-detail__bottom">
            <button type="button" class="project-detail__teaser"><?php rec_studio_text( 'teaser_label' ); ?></button>
            <button type="button" class="project-detail__nav project-detail__nav--prev" aria-label="Предыдущий проект"></button>
            <button type="button" class="project-detail__nav project-detail__nav--close" aria-label="Закрыть карточку проекта"></button>
            <button type="button" class="project-detail__nav project-detail__nav--next" aria-label="Следующий проект"></button>
            <button type="button" class="project-detail__request projects-open-request"><?php rec_studio_text( 'request_button' ); ?></button>
          </div>
        </div>
      </div>

      <div class="projects-request-popup" aria-hidden="true">
        <div class="projects-request-popup__container">
          <div class="projects-request-popup__dialog" role="dialog" aria-modal="true">
            <button type="button" class="projects-request-popup__close" aria-label="Закрыть">
              ×
            </button>

            <div class="projects-request-popup__title"><?php rec_studio_text( 'project_form_title' ); ?></div>

            <form class="projects-request-form" method="post">
              <?php rec_studio_form_fields( 'project' ); ?>
              <input type="hidden" name="project" class="projects-request-form__project">

              <div class="projects-request-form__row projects-request-form__row--options">
                <div class="projects-request-form__label"><?php rec_studio_text( 'request_choose' ); ?></div>

                <div class="projects-request-form__field projects-request-form__field--checks">
                  <label class="projects-request-form__check">
                    <input type="checkbox" name="request_type[]" value="buy">
                    <span><?php rec_studio_text( 'request_buy' ); ?></span>
                  </label>

                  <label class="projects-request-form__check">
                    <input type="checkbox" name="request_type[]" value="develop">
                    <span><?php rec_studio_text( 'request_develop' ); ?></span>
                  </label>

                  <label class="projects-request-form__check">
                    <input type="checkbox" name="request_type[]" value="produce">
                    <span><?php rec_studio_text( 'request_produce' ); ?></span>
                  </label>
                </div>
              </div>

              <div class="projects-request-form__row">
                <div class="projects-request-form__label"><?php rec_studio_text( 'field_email' ); ?></div>
                <div class="projects-request-form__field">
                  <input type="email" name="email" autocomplete="email" maxlength="254" aria-label="Email" placeholder="<?php echo esc_attr( rec_studio_content( 'placeholder_email' ) ); ?>">
                </div>
              </div>

              <div class="projects-request-form__row">
                <div class="projects-request-form__label"><?php rec_studio_text( 'field_phone' ); ?></div>
                <div class="projects-request-form__field">
                  <input type="tel" name="phone" required autocomplete="tel" maxlength="80" aria-label="Телефон" placeholder="<?php echo esc_attr( rec_studio_content( 'placeholder_phone' ) ); ?>">
                </div>
              </div>

              <div class="projects-request-form__row">
                <div class="projects-request-form__label"><?php rec_studio_text( 'field_name' ); ?></div>
                <div class="projects-request-form__field">
                  <input type="text" name="name" autocomplete="name" maxlength="120" aria-label="Имя" placeholder="<?php echo esc_attr( rec_studio_content( 'placeholder_name' ) ); ?>">
                </div>
              </div>

              <div class="projects-request-form__row projects-request-form__row--textarea">
                <div class="projects-request-form__label"><?php rec_studio_text( 'field_message' ); ?></div>
                <div class="projects-request-form__field">
                  <textarea name="message" maxlength="5000" aria-label="Сообщение"></textarea>
                </div>
              </div>

              <button type="submit" class="projects-request-form__submit"><?php rec_studio_text( 'form_submit' ); ?></button>
            </form>
          </div>
        </div>
      </div>

      <button class="projects-arrow" type="button" aria-label="Листать ниже"></button>
    </section>
<?php get_footer(); ?>
