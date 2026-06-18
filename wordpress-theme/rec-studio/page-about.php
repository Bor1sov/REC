<?php
/**
 * Template Name: REC About
 *
 * @package RecStudio
 */

get_header();
?>
<section class="menu">
      <a class="menu__logo-cont" href="<?php echo esc_url( home_url( '/' ) ); ?>"></a>

      <div class="menu-block" onclick="window.location.href='<?php echo esc_url( home_url( '/' ) ); ?>'">
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

    <section class="content content--page">
      <div class="about about--base">
        <img src="<?php echo esc_url( rec_theme_asset( 'assets/about-mobile.jpg' ) ); ?>" class="about__img" alt="О нас" decoding="async" fetchpriority="high" />
      </div>

      <div class="paralax-text">
        <h1 class="about__title mask">О НАС</h1>

        <div class="about-info">
          <div class="about-info-text">
            В команду РЕК СТУДИЯ входят продюсеры, режиссеры и сценаристы,
            которые преимущественно предпочитают работать в жанрах — детективы,
            триллеры, драмы и приключения. <br><br>Мы создаем нон-фикшн контент,
            основанный на реальных событиях, с напряженным и драматичным
            сюжетом. Герои наших историй – сильные и неординарные личности,
            которые вызывают большой зрительский интерес в любой точке Мира.
          </div>
        </div>
      </div>

      <section class="about-projects-section" aria-label="Наши проекты">
        <div class="about-projects-section__loader">Загрузка проектов</div>
      </section>

      <section class="about-help-section" aria-label="Услуги">
        <div class="about-help-section__loader">Загрузка услуг</div>
      </section>

      <section class="about-news-section" aria-label="Новости">
        <div class="about-news-section__loader">Загрузка новостей</div>
      </section>

      <section class="about-contacts-section" aria-label="Контакты">
        <div class="about-contacts-section__loader">Загрузка контактов</div>
      </section>
    </section>
<?php
get_footer();
