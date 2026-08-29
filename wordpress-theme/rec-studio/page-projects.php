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

    <section class="content content--page projects-content">
      <div class="projects-bg">
        <img
          src="<?php echo esc_url( rec_theme_asset( 'assets/b.jpg' ) ); ?>"
          class="projects-bg__img"
          alt="Наши проекты"
          decoding="async"
          fetchpriority="high"
        />
      </div>

      <div class="projects-stage">
        <section class="projects-hero">
          <div class="projects-paralax-text">
            <h1 class="projects__title mask">НАШИ ПРОЕКТЫ</h1>

            <p class="projects__subtitle">
              Мы готовы предложить<br />
              вашему вниманию
            </p>

            <div class="projects-services-viewport">
              <div class="projects-services">
                <div class="projects-service">
                  <span></span>
                  <p>свои<br />сценарии</p>
                </div>

                <div class="projects-service">
                  <span></span>
                  <p>осуществить<br />разработку<br />вашего проекта</p>
                </div>

                <div class="projects-service">
                  <span></span>
                  <p>участвовать<br />в совместном<br />производстве</p>
                </div>

                <div class="projects-service">
                  <span></span>
                  <p>кино, сериалы<br />и тв-проекты</p>
                </div>

                <div class="projects-service">
                  <span></span>
                  <p>док.фильмы</p>
                </div>

                <div class="projects-service" aria-hidden="true">
                  <span></span>
                  <p>свои<br />сценарии</p>
                </div>

                <div class="projects-service" aria-hidden="true">
                  <span></span>
                  <p>осуществить<br />разработку<br />вашего проекта</p>
                </div>

                <div class="projects-service" aria-hidden="true">
                  <span></span>
                  <p>участвовать<br />в совместном<br />производстве</p>
                </div>

                <div class="projects-service" aria-hidden="true">
                  <span></span>
                  <p>кино, сериалы<br />и тв-проекты</p>
                </div>

                <div class="projects-service" aria-hidden="true">
                  <span></span>
                  <p>док.фильмы</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="projects-section projects-section--series">
          <div class="projects-section__head">
            <h2>Сериалы</h2>
            <button type="button" class="projects-open-request">
              Оставить заявку
            </button>
          </div>

          <div class="projects-grid projects-grid--series">
            <article
              class="project-card"
              data-project-title="ВЕЩЕСТВЕННЫЕ ДОКАЗАТЕЛЬСТВА"
              data-project-genre="Ироничный детектив"
              data-project-note="основано на реальных событиях"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="32 серии"
              data-project-description="История о людях, для которых правда становится опаснее вымысла. Следы прошлого, улики и человеческие тайны постепенно складываются в цепь событий, где каждое доказательство может изменить судьбу героя."
            >
              <img
                src="<?php echo esc_url( rec_theme_asset( 'assets/veshchestvennye.jpg' ) ); ?>"
                alt="Вещественные доказательства"
              />
            </article>

            <article
              class="project-card"
              data-project-title="ГЕНЕЗИС"
              data-project-genre="Мягкая фантастика, киберпанк, триллер, драма"
              data-project-note="проект в разработке"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="В мире, где технологии меняют природу человека, герой сталкивается с системой, которая скрывает истинную цену прогресса. Чем ближе он к разгадке, тем опаснее становится каждый следующий шаг."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/genesis.jpg' ) ); ?>" alt="Генезис" />
            </article>

            <article
              class="project-card"
              data-project-title="ДИКАЯ ДИВИЗИЯ"
              data-project-genre="Шпионский детектив"
              data-project-note="основано на реальных событиях"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="4 серии"
              data-project-description="История людей, оказавшихся на переломе эпохи. Честь, долг, страх и личный выбор сталкиваются в событиях, где невозможно остаться в стороне."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/dikaya-diviziya.jpg' ) ); ?>" alt="Дикая дивизия" />
            </article>

            <article
              class="project-card"
              data-project-title="ДОРОГА В ПОДНЕБЕСНУЮ"
              data-project-genre="Историко-приключенческий детектив"
              data-project-note="основано на реальных событиях"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="Путь, который начинается как путешествие, превращается в испытание характера. Герои проходят через опасность, потери и открытия, чтобы понять, что на самом деле ведёт их вперёд."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/doroga-v.jpg' ) ); ?>" alt="Дорога в Поднебесную" />
            </article>

            <article
              class="project-card"
              data-project-title="ЗОЛОТО БЕЛОГОРСКОГО МОНАСТЫРЯ"
              data-project-genre="Исторический детектив"
              data-project-note="основано на реальных событиях"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="Легенда о пропавшем золоте становится началом опасного расследования. Старые тайны, человеческая жадность и память земли ведут героев к разгадке, которую многие хотели бы скрыть."
            >
              <img
                src="<?php echo esc_url( rec_theme_asset( 'assets/zoloto-belogorskogo-monastyrya.jpg' ) ); ?>"
                alt="Золото Белогорского монастыря"
              />
            </article>

            <article
              class="project-card"
              data-project-title="ИЗОЛЯЦИЯ"
              data-project-genre="Научно-фантастический триллер"
              data-project-note="проект в разработке"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="Замкнутое пространство становится испытанием для героев. Когда внешняя опасность отступает, главным врагом оказываются страх, память и невозможность доверять друг другу."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/izolyatsiya.jpg' ) ); ?>" alt="Изоляция" />
            </article>

            <article
              class="project-card"
              data-project-title="ЛЮБИТ НЕ ЛЮБИТ"
              data-project-genre="Комедия, драмеди"
              data-project-note="о любви — и в шутку, и всерьёз"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="20 серий"
              data-project-description="История отношений, в которых лёгкость и ирония соседствуют с настоящими чувствами. Героям предстоит понять, где заканчивается игра и начинается любовь."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/lyubit-ne-lyubit.jpg' ) ); ?>" alt="Любит не любит" />
            </article>

            <article
              class="project-card"
              data-project-title="НАШИ МАМАШИ"
              data-project-genre="Ситком"
              data-project-note="проект в разработке"
              data-project-age="6+"
              data-project-format="Сериал"
              data-project-duration="20 серий"
              data-project-description="Яркая семейная история о взрослых, детях и ежедневном хаосе, в котором любовь, забота и юмор помогают справляться даже с самыми неожиданными ситуациями."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/nashi-mamashi.jpg' ) ); ?>" alt="Наши мамаши" />
            </article>

            <article
              class="project-card"
              data-project-title="СПЕЦИАЛЬНОЕ НАЗНАЧЕНИЕ"
              data-project-genre="Политический триллер"
              data-project-note="основано на реальных событиях"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="10 серий"
              data-project-description="Когда приказ становится вопросом жизни и смерти, герои вынуждены действовать на пределе возможностей. Это история о долге, цене выбора и людях, которые не имеют права на ошибку."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/spetsnaz.jpg' ) ); ?>" alt="Специальное назначение" />
            </article>

            <article
              class="project-card"
              data-project-title="СТОРОЖ"
              data-project-genre="Фантастика, триллер"
              data-project-note="проект в разработке"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="Заброшенное место хранит больше, чем кажется. Герой сталкивается с тайной, которая постепенно стирает границу между реальностью, страхом и тем, что невозможно объяснить."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/storozh.jpg' ) ); ?>" alt="Сторож" />
            </article>

            <article
              class="project-card"
              data-project-title="СЫЩИК С МАЛОГО ГНЕЗДОВСКОГО"
              data-project-genre="Исторический детектив"
              data-project-note="проект в разработке"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="Расследование, начавшееся с одного странного дела, приводит героя к цепочке событий, где каждый свидетель что-то скрывает, а каждая версия оказывается опасной."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/syschik.jpg' ) ); ?>" alt="Сыщик с Малого Гнездовского" />
            </article>

            <article
              class="project-card"
              data-project-title="ТАЙНА МОЛЕБКИ"
              data-project-genre="Исторический детектив с элементами мистики"
              data-project-note="проект в разработке"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="Таинственная местность становится точкой притяжения для людей, связанных прошлым. Чем глубже расследование, тем сильнее ощущение, что сама земля хранит ответы."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/tayna-molebki.jpg' ) ); ?>" alt="Тайна Молебки" />
            </article>

            <article
              class="project-card"
              data-project-title="ТРИ В ОДНОМ"
              data-project-genre="Мистическая драма, комедия"
              data-project-note="проект в разработке"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="Три истории, три взгляда и одна общая тайна. Герои оказываются связаны событием, которое меняет их жизнь и заставляет пересмотреть всё, во что они верили."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/tri-v-odnom.jpg' ) ); ?>" alt="Три в одном" />
            </article>

            <article
              class="project-card"
              data-project-title="ШАПИРО"
              data-project-genre="Шпионский детектив"
              data-project-note="основано на реальных событиях"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="История человека, чья фамилия становится символом страха и власти. В мире, где каждый шаг имеет цену, герой пытается удержать контроль над собственной судьбой."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/shapiro.jpg' ) ); ?>" alt="Шапиро" />
            </article>

            <article
              class="project-card"
              data-project-title="АЛЧНОСТЬ"
              data-project-genre="Детектив, авантюрная мелодрама"
              data-project-note="основано на реальных событиях"
              data-project-age="18+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="Москва и Советский Союз готовятся к Олимпиаде. Мария и Игорь приезжают покорять Москву. Мария работает моделью, а Игорь в закрытом НИИ. Марию находят мёртвой. Игорь и Виктор, брат Марии, начинают поиски убийц.

Герои погружаются в закрытые круги советского общества. Месть — как двигатель открывает им новые горизонты, но превращает их в хищников.

Москва и Советский Союз готовятся к Олимпиаде. Мария и Игорь приезжают покорять Москву. Мария работает моделью, а Игорь в закрытом НИИ. Марию находят мёртвой. Игорь и Виктор, брат Марии, начинают поиски убийц."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/alchnost.jpg' ) ); ?>" alt="Алчность" />
            </article>

            <article
              class="project-card"
              data-project-title="АТАМАНКА ИЗ АДАМОВКИ"
              data-project-genre="Комедия, драмеди"
              data-project-note="проект в разработке"
              data-project-age="12+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="История сильной героини, которая оказывается в центре событий, где личная смелость становится единственным способом защитить себя, близких и своё право на будущее."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/atamanka.jpg' ) ); ?>" alt="Атаманка из Адамовки" />
            </article>

            <article
              class="project-card"
              data-project-title="ПРИЕМНАЯ АДВОКАТА"
              data-project-genre="Документальный сериал"
              data-project-note="проект в разработке"
              data-project-age="16+"
              data-project-format="Сериал"
              data-project-duration="8 серий"
              data-project-description="Документальный сериал о людях, для которых профессия становится ежедневным выбором между законом, ответственностью и человеческими историями."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/Док/Адвокат.jpg' ) ); ?>" alt="Приемная адвоката" />
            </article>
          </div>
        </section>

        <section class="projects-section projects-section--cinema">
          <div class="projects-section__head">
            <h2>Кино</h2>
            <button type="button" class="projects-open-request">
              Оставить заявку
            </button>
          </div>

          <div class="projects-grid projects-grid--cinema">
            <article
              class="project-card"
              data-project-title="КАК Я ВАС ВСЕХ"
              data-project-genre="Художественный фильм"
              data-project-note="проект в разработке"
              data-project-age="16+"
              data-project-format="Кино"
              data-project-duration="Полный метр"
              data-project-description="Кинопроект находится в разработке. Сценарий, визуальное решение и производственный пакет готовятся к следующему этапу."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/Кино/Как я вас всех.jpg' ) ); ?>" alt="Как я вас всех" />
            </article>

            <article
              class="project-card"
              data-project-title="ТРОЕ В БЕНТЛИ"
              data-project-genre="Художественный фильм"
              data-project-note="проект в разработке"
              data-project-age="16+"
              data-project-format="Кино"
              data-project-duration="Полный метр"
              data-project-description="Кинопроект находится в разработке. Сценарий, визуальное решение и производственный пакет готовятся к следующему этапу."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/Кино/Трое в бентли.jpg' ) ); ?>" alt="Трое в Бентли" />
            </article>
          </div>
        </section>

        <section class="projects-section projects-section--documentary">
          <div class="projects-section__head">
            <h2>док. фильмы</h2>
            <button type="button" class="projects-open-request">
              Оставить заявку
            </button>
          </div>

          <div class="projects-grid projects-grid--documentary">
            <article
              class="project-card"
              data-project-title="ВЕЛИКИЕ ЭМКИЗЫ"
              data-project-genre="Документальный фильм"
              data-project-note="проект в разработке"
              data-project-age="12+"
              data-project-format="Документальный фильм"
              data-project-duration="Полный метр"
              data-project-description="Документальный проект находится в разработке. Материалы, герои и визуальное решение уточняются на стадии подготовки."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/Док/Великие эмкизы.jpg' ) ); ?>" alt="Великие эмкизы" />
            </article>

            <article
              class="project-card"
              data-project-title="ВЕТЕР И СКАТ"
              data-project-genre="Документальный фильм"
              data-project-note="проект в разработке"
              data-project-age="12+"
              data-project-format="Документальный фильм"
              data-project-duration="Полный метр"
              data-project-description="Документальный проект находится в разработке. Материалы, герои и визуальное решение уточняются на стадии подготовки."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/Док/Ветер и скат.jpg' ) ); ?>" alt="Ветер и скат" />
            </article>

            <article
              class="project-card"
              data-project-title="ГРОМКОЕ ДЕЛО"
              data-project-genre="Документальный фильм"
              data-project-note="проект в разработке"
              data-project-age="12+"
              data-project-format="Документальный фильм"
              data-project-duration="Полный метр"
              data-project-description="Документальный проект находится в разработке. Материалы, герои и визуальное решение уточняются на стадии подготовки."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/Док/Громкое дело.jpg' ) ); ?>" alt="Громкое дело" />
            </article>

            <article
              class="project-card"
              data-project-title="ДВИЖНИЕ ФОРМЫ"
              data-project-genre="Документальный фильм"
              data-project-note="проект в разработке"
              data-project-age="12+"
              data-project-format="Документальный фильм"
              data-project-duration="Полный метр"
              data-project-description="Документальный проект находится в разработке. Материалы, герои и визуальное решение уточняются на стадии подготовки."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/Док/Движние формы.jpg' ) ); ?>" alt="Движние формы" />
            </article>

            <article
              class="project-card"
              data-project-title="ЖАЖДА ТВОРИТЬ"
              data-project-genre="Документальный фильм"
              data-project-note="проект в разработке"
              data-project-age="12+"
              data-project-format="Документальный фильм"
              data-project-duration="Полный метр"
              data-project-description="Документальный проект находится в разработке. Материалы, герои и визуальное решение уточняются на стадии подготовки."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/Док/Жажда творить.jpg' ) ); ?>" alt="Жажда творить" />
            </article>

            <article
              class="project-card"
              data-project-title="РУБЕЖИ"
              data-project-genre="Документальный фильм"
              data-project-note="проект в разработке"
              data-project-age="12+"
              data-project-format="Документальный фильм"
              data-project-duration="Полный метр"
              data-project-description="Документальный проект находится в разработке. Материалы, герои и визуальное решение уточняются на стадии подготовки."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/Док/Рубежи.jpg' ) ); ?>" alt="Рубежи" />
            </article>
          </div>
        </section>

        <section class="projects-section projects-section--tv">
          <div class="projects-section__head">
            <h2>ТВ-проекты</h2>
            <button type="button" class="projects-open-request">
              Оставить заявку
            </button>
          </div>

          <div class="projects-grid projects-grid--tv">
            <article
              class="project-card"
              data-project-title="УЗНАВАЙ-КА"
              data-project-genre="Познавательная детская передача"
              data-project-note="проект в разработке"
              data-project-age="6+"
              data-project-format="ТВ-проект"
              data-project-duration="56 выпусков"
              data-project-description="Познавательный проект для детей, где сложные вопросы объясняются легко, ярко и с юмором. Каждый выпуск помогает юным зрителям узнавать новое и смотреть на мир шире."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/ТВ/Узнавайка.jpg' ) ); ?>" alt="Узнавай-Ка" />
            </article>

            <article
              class="project-card"
              data-project-title="СЕМЕЙНЫЙ ПАТРУЛЬ"
              data-project-genre="Семейное ток-шоу"
              data-project-note="проект в разработке"
              data-project-age="16+"
              data-project-format="ТВ-проект"
              data-project-duration="56 выпусков"
              data-project-description="Тёплый и важный проект о семье, поддержке и ответственности. В центре внимания — истории, которые помогают увидеть ценность заботы, доверия и участия."
            >
              <img src="<?php echo esc_url( rec_theme_asset( 'assets/ТВ/Семейный патруль.jpg' ) ); ?>" alt="Семейный патруль" />
            </article>
          </div>
        </section>
      </div>

      <div class="project-detail" aria-hidden="true">
        <div class="project-detail__media">
          <img class="project-detail__img" src="" alt="" />
        </div>

        <div class="project-detail__content">
          <div class="project-detail__top">
            <h2 class="project-detail__title"></h2>

            <p class="project-detail__genre"></p>
            <p class="project-detail__note"></p>
          </div>

          <div class="project-detail__text-wrap">
            <div class="project-detail__text">
              <p class="project-detail__description"></p>
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

          <div class="project-detail__status">
            <span>Стадия готовности:</span>
            <span>1. Заявка</span>
            <span>2. Библия проекта</span>
            <span>3. Пилотная серия</span>
            <span>4. Посерийный план</span>
            <span>5. Тизер</span>
          </div>

          <div class="project-detail__bottom">
            <button type="button" class="project-detail__teaser">Тизер</button>
            <button type="button" class="project-detail__nav project-detail__nav--prev" aria-label="Предыдущий проект"></button>
            <button
              type="button"
              class="project-detail__nav project-detail__nav--close"
              aria-label="Закрыть карточку проекта"
            ></button>
            <button type="button" class="project-detail__nav project-detail__nav--next" aria-label="Следующий проект"></button>
            <button
              type="button"
              class="project-detail__request projects-open-request"
            >
              Оставить заявку
            </button>
          </div>
        </div>
      </div>

      <div class="projects-request-popup" aria-hidden="true">
        <div class="projects-request-popup__container">
          <div
            class="projects-request-popup__dialog"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              class="projects-request-popup__close"
              aria-label="Закрыть"
            >
              ×
            </button>

            <div class="projects-request-popup__title">
              ЗАЯВКА НА СЦЕНАРИЙ
            </div>

            <form class="projects-request-form">
              <input
                type="hidden"
                name="project"
                class="projects-request-form__project"
              />

              <div class="projects-request-form__row projects-request-form__row--options">
                <div class="projects-request-form__label">Выбрать*</div>

                <div class="projects-request-form__field projects-request-form__field--checks">
                  <label class="projects-request-form__check">
                    <input
                      type="checkbox"
                      name="request_type"
                      value="Покупка сценария"
                    />
                    <span>покупка сценария</span>
                  </label>

                  <label class="projects-request-form__check">
                    <input
                      type="checkbox"
                      name="request_type"
                      value="Разработать сценарий"
                    />
                    <span>разработать сценарий</span>
                  </label>

                  <label class="projects-request-form__check">
                    <input
                      type="checkbox"
                      name="request_type"
                      value="Совместное производство фильма"
                    />
                    <span>совместное производство фильма</span>
                  </label>
                </div>
              </div>

              <div class="projects-request-form__row">
                <div class="projects-request-form__label">E-mail</div>
                <div class="projects-request-form__field">
                  <input type="email" name="email" placeholder="youremail@yandex.ru"/>
                </div>
              </div>

              <div class="projects-request-form__row">
                <div class="projects-request-form__label">Телефон*</div>
                <div class="projects-request-form__field">
                  <input type="text" name="phone" placeholder="8-800-555-35-35"/>
                </div>
              </div>

              <div class="projects-request-form__row">
                <div class="projects-request-form__label">Имя</div>
                <div class="projects-request-form__field">
                  <input type="text" name="name" placeholder="Филлип Бедросович"/>
                </div>
              </div>

              <div class="projects-request-form__row projects-request-form__row--textarea">
                <div class="projects-request-form__label">Запрос</div>
                <div class="projects-request-form__field">
                  <textarea name="message"></textarea>
                </div>
              </div>

              <button type="submit" class="projects-request-form__submit">
                Отправить заявку
              </button>
            </form>
          </div>
        </div>
      </div>

      <button
        class="projects-arrow"
        type="button"
        aria-label="Листать ниже"
      ></button>
    </section>
<?php
get_footer();
