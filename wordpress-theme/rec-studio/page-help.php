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
        <div class="menu-text">МЕНЮ</div>

        <button class="burger" type="button" aria-label="Вернуться в меню">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </section>


    <section class="settings">
      <button class="settings__lang-btn">RU</button>
      <button class="settings__valume-btn">
        <img
          src="<?php echo esc_url( rec_theme_asset( 'assets/sound-on.png' ) ); ?>"
          class="settings__valume-btn__img"
          alt="volume"
        />
      </button>
    </section>
    <section class="content content--page help-content">
      <div class="help-bg">
        <img
          src="<?php echo esc_url( rec_theme_asset( 'assets/a.jpg' ) ); ?>"
          class="help-bg__img"
          alt="Услуги REC Studio"
          decoding="async"
          fetchpriority="high"
        />
      </div>

      <div class="help-stage">
        <section class="help-hero">
          <div class="help-paralax-text">
            <h1 class="help__title mask">УСЛУГИ</h1>

            <p class="help__subtitle">
              Помогаем создать проекты
            </p>

            <div class="help-services-viewport">
              <div class="help-services">
                <div class="help-service">
                  <span></span>
                  <p>продакшн<br />полного цикла</p>
                </div>

                <div class="help-service">
                  <span></span>
                  <p>производство:<br />фильмов, ТВ-передач,<br />коммерческого видео</p>
                </div>

                <div class="help-service">
                  <span></span>
                  <p>проекты<br />«под ключ»</p>
                </div>

                <div class="help-service">
                  <span></span>
                  <p>заявки<br />на субсидии</p>
                </div>

                <div class="help-service">
                  <span></span>
                  <p>разработка<br />презентаций</p>
                </div>

                <div class="help-service" aria-hidden="true">
                  <span></span>
                  <p>продакшн<br />полного цикла</p>
                </div>

                <div class="help-service" aria-hidden="true">
                  <span></span>
                  <p>производство:<br />фильмов, ТВ-передач,<br />коммерческого видео</p>
                </div>

                <div class="help-service" aria-hidden="true">
                  <span></span>
                  <p>проекты<br />«под ключ»</p>
                </div>

                <div class="help-service" aria-hidden="true">
                  <span></span>
                  <p>заявки<br />на субсидии</p>
                </div>

                <div class="help-service" aria-hidden="true">
                  <span></span>
                  <p>разработка<br />презентаций</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section class="help-cards-section">
          <article
            class="help-large-card"
            data-help-kind="support"
            data-help-title="СОПРОВОЖДЕНИЕ ПРОЕКТОВ"
          >
            <img
              src="<?php echo esc_url( rec_theme_asset( 'assets/Услуги Текстура/сопровождение проектов.jpg' ) ); ?>"
              alt="Сопровождение проектов"
            />

            <div class="help-large-card__overlay">
              <h2>СОПРОВОЖДЕНИЕ<br />ПРОЕКТОВ</h2>
            </div>
          </article>

          <article
            class="help-large-card"
            data-help-kind="advertising"
            data-help-title="РЕКЛАМНЫЙ ДЕПАРТАМЕНТ"
          >
            <img
              src="<?php echo esc_url( rec_theme_asset( 'assets/Услуги Текстура/рекламный департамент.jpg' ) ); ?>"
              alt="Рекламный департамент"
            />

            <div class="help-large-card__overlay">
              <h2>РЕКЛАМНЫЙ<br />ДЕПАРТАМЕНТ</h2>
            </div>
          </article>
        </section>
      </div>

      <div class="help-detail" aria-hidden="true">
        <div class="help-detail__nav">
          <div class="help-detail__breadcrumbs">
            <button
              class="help-detail__breadcrumbs-home"
              type="button"
              aria-label="Перейти на страницу услуг"
            >Услуги</button>
            <span class="help-detail__breadcrumbs-separator">&gt;</span>
            <button
              class="help-detail__breadcrumbs-current"
              type="button"
              aria-label="Переключить набор услуг"
            ></button>
          </div>

          <div class="help-detail__nav-list"></div>

          <div class="help-detail__downloads">
            <button
              class="help-detail__back"
              type="button"
              aria-label="Вернуться к списку услуг"
            ></button>

            <a href="#" class="help-detail__download-link">
              Презентация
            </a>

            <a href="#" class="help-detail__download-price">
              Прайс
            </a>
          </div>
        </div>

        <div class="help-detail__info">
          <div class="help-detail__text">
            <p class="help-detail__description"></p>

            <div class="help-detail__services">
              <h3>Виды услуг:</h3>
              <ul class="help-detail__services-list"></ul>
            </div>
          </div>

          <button
            class="help-detail__arrow"
            type="button"
            aria-label="Следующий раздел"
          ></button>
        </div>

        <div class="help-detail__media">
          <img class="help-detail__img" src="" alt="" />
        </div>
      </div>

      <div class="help-price-popup" aria-hidden="true">
        <div class="help-price-popup__container">
          <div
            class="help-price-popup__dialog"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              class="help-price-popup__close"
              aria-label="Закрыть"
            >
              ×
            </button>

            <div class="help-price-popup__title">
              ПРАЙС-ЛИСТ
            </div>

            <form class="help-price-form">
              <div class="help-price-form__row">
                <div class="help-price-form__label">E-mail</div>
                <div class="help-price-form__field">
                  <input type="email" name="email" />
                </div>
              </div>

              <div class="help-price-form__row">
                <div class="help-price-form__label">Телефон*</div>
                <div class="help-price-form__field">
                  <input type="text" name="phone" />
                </div>
              </div>

              <button type="submit" class="help-price-form__submit">
                Скачать прайс
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="help-request-popup" aria-hidden="true">
        <div class="help-request-popup__container">
          <div
            class="help-request-popup__dialog"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              class="help-request-popup__close"
              aria-label="Закрыть"
            >
              ×
            </button>

            <div class="help-request-popup__title">
              ЗАЯВКА НА УСЛУГУ
            </div>

            <form class="help-request-form">
              <input
                type="hidden"
                name="service"
                class="help-request-form__service"
              />

              <div class="help-request-form__row">
                <div class="help-request-form__label">Услуга</div>
                <div class="help-request-form__field">
                  <input
                    type="text"
                    name="service_visible"
                    class="help-request-form__service-visible"
                    readonly
                  />
                </div>
              </div>

              <div class="help-request-form__row">
                <div class="help-request-form__label">E-mail</div>
                <div class="help-request-form__field">
                  <input type="email" name="email" />
                </div>
              </div>

              <div class="help-request-form__row">
                <div class="help-request-form__label">Телефон*</div>
                <div class="help-request-form__field">
                  <input type="text" name="phone" />
                </div>
              </div>

              <div class="help-request-form__row">
                <div class="help-request-form__label">Имя</div>
                <div class="help-request-form__field">
                  <input type="text" name="name" />
                </div>
              </div>

              <div class="help-request-form__row help-request-form__row--textarea">
                <div class="help-request-form__label">Запрос</div>
                <div class="help-request-form__field">
                  <textarea name="message"></textarea>
                </div>
              </div>

              <button type="submit" class="help-request-form__submit">
                Отправить заявку
              </button>
            </form>
          </div>
        </div>
      </div>

      <button
        class="help-arrow"
        type="button"
        aria-label="Листать ниже"
      ></button>
    </section>
<?php
get_footer();
