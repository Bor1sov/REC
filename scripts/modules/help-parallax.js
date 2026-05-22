import { state } from "./state.js";
import { updatePageScrollbar } from "./page-scrollbar.js";

const HELP_MAX_PROGRESS = 2;

const detailGroups = {
    support: {
        title: "Сопровождение проектов",
        items: [
            {
                title: "Разработка презентаций",
                description:
                    "Презентация проекта — это ключевой этап, который открывает его дальнейшую судьбу. Важно не только иметь сильную идею, но и уметь эффектно и убедительно её подать. Хорошая презентация не просто информирует, а заряжает идеей.\n\nВ работу включены разработка структуры, основные визуальные принципы, которые сделают отличие и уникальность концепции проекта. Составляем помощь в грамотной подготовке всех разделов с учётом требований индустрии, где необходимо привлечь участие в разработке креатива и презентационных проектов.",
                services: [
                    "Презентация проекта",
                    "Библия персонажей"
                ],
                image: "./assets/Разраб Презентации.jpg"
            },
            {
                title: "Ки-арт / дизайн",
                description:
                    "Мы поможем с визуальным оформлением картины: разработаем ки-арт, изображения и композиции на основе референсов, соберём единый постер, титры, логотипы, промо-материалы, социальные сети, айдентику и другие визуальные элементы.\n\nЗадача — создать цельную и выразительную визуальную персонажность проекта.",
                services: [
                    "Ки-арт для фильма",
                    "Разработка постера",
                    "Разработка логотипов",
                    "Титры к фильму",
                    "Фотосъёмка",
                    "Дизайн для социальных сетей",
                    "Разработка сайта"
                ],
                image: "./assets/Ки-арт.jpg"
            },
            {
                title: "Подготовка <br>заявки в: Минкульт,<br> Фонд кино, ИРИ, ПФКИ",
                description:
                    "Профессионально и быстро подготовим пакет документов для получения субсидий, которые выделяются теми или иными производственно-индустриальными фондами, финансовой поддержкой ведомств и организаций.\n\nДля подачи или участия важно пройти этап подготовки правильно и последовательно. Мы ежегодно готовим документы на получение субсидий и имеем большой опыт подачи.",
                services: [
                    "Оформление заявки на субсидию",
                    "Проверка уже подготовленного пакета документов",
                    "Консультации"
                ],
                image: "./assets/Подготовка заявки.jpg"
            },
            {
                title: "Прокатное удостоверение",
                description:
                    "Прокатное удостоверение — подтверждающий документ права владения на фильм. Наличие прокатного удостоверения обязательно для публичных показов фильмов.\n\nГрамотно подготовим пакет документов, отвезём его в Минкульт РФ, следим копию в архив, оплатим пошлины и отдадим вам готовое прокатное удостоверение. С 2024 прокатное удостоверение стало цифровым.",
                services: [
                    "Прокатное на игровой, анимацию, док, фильмы",
                    "Прокатное на сериал",
                    "Сдача исходных материалов в ГФФ",
                    "Монтажные и диалоговые листы",
                    "Запись жесткого диска с DCP и WAV",
                    "Запись кассет HDcam и DVD"
                ],
                image: "./assets/ПрокатУд.jpg"
            },
            {
                title: "Постпродакшн",
                description:
                    "Услуги режиссёрского монтажа с пониманием задачи и сроков. Смонтируем или сократим фильм, сделаем трейлер или фильм о фильме.\n\nПомогаем довести материал до финального состояния и подготовить его к презентации, передаче партнёрам или дальнейшему продвижению.",
                services: [
                    "Монтаж фильма",
                    "Монтаж трейлера",
                    "Фильм о фильме"
                ],
                image: "./assets/Постпродакшн.jpg"
            }
        ]
    },

    advertising: {
        title: "Рекламный департамент",
        items: [
            {
                title: "Креатив",
                description:
                    "Путь в тысячи миль начинается с первого шага, а создание качественного видео контента — с креативной и грамотно расписанной идеи.\n\nПрежде чем начать реализацию задумки, мы детально прорабатываем каждый будущий кадр и создаём надёжный фундамент для успешности проекта.",
                services: [
                    "Сториборд",
                    "Нейминг",
                    "Креативная концепция",
                    "Сценарии"
                ],
                image: "./assets/Креатив.jpg"
            },
            {
                title: "Дизайн",
                description:
                    "Наша команда специалистов по созданию креативной рекламы и созданию ярких впечатлений в цифровых формах ваших брендов.",
                services: [
                    "Разработка фирменного стиля",
                    "Дизайн упаковки",
                    "Адаптивный дизайн",
                    "Веб-дизайн",
                    "Проектирование интерфейсов",
                    "Юзабилити",
                    "Арт, иллюстрации",
                    "Инфографика",
                    "Проектирование и производство выставочных и торговых стендов",
                    "POS-материалы"
                ],
                image: "./assets/Дизайн.jpg"
            },
            {
                title: "Планирование",
                description:
                    "Работая со смыслами, мы делим на следующие этапы:\n\n1 — ПОИСК РАМОК\nЗа которые нам нужно выйти. Это поиск стереотипных действий, которые совершают наши конкуренты, и шаблоны мышления, в которых находятся потребители.\n\n2 — ПОИСК ТРЕНДОВ\nВ каком будущем предстоит жить бренду и на какие ценности важно отозваться и оказывать влияние.\n\n3 — СОЗДАНИЕ ИНСТРУМЕНТОВ\nКоторые разрушают стереотипы, которые позволяют легко донести ценности и обогнать конкурентов.",
                services: [
                    "Исследование и аналитика",
                    "Стратегии",
                    "Бренд-консалтинг"
                ],
                image: "./assets/Планирование.jpg"
            },
            {
                title: "Видеосъёмка",
                description:
                    "Наша команда осуществляет полный цикл производства коммерческого видео, ТВ-передач, фильмов, сериалов и диджитал проектов.\n\nМы вам готовы предложить как проекты «под ключ», так и совместное производство.",
                services: [
                    "Рекламные ролики",
                    "Вирусные ролики",
                    "Имиджевые ролики",
                    "Анимационные ролики",
                    "Разработка YouTube/SMM каналов",
                    "Корпоративные фильмы",
                    "Трансляции",
                    "Продающее видео",
                    "Видео-отзывы",
                    "Репортажная съёмка",
                    "Аэросъёмка"
                ],
                image: "./assets/Видеосъемка.png"
            },
            {
                title: "Фотосъёмка",
                description:
                    "Наши фотохудожники готовы передать качество и эстетику вашей продукции до мельчайших подробностей. Мы используем только современное оборудование, а среди наших фотографов есть победители международных конкурсов.",
                services: [
                    "Предметная фотосъёмка",
                    "Для маркетплейсов",
                    "Рекламная съёмка",
                    "Дополнительный сервис",
                    "Мероприятия"
                ],
                image: "./assets/Фотосъемка.jpg"
            },
            {
                title: "Организация мероприятий",
                description:
                    "Наши специалисты разработают креативную идею и реализуют её визуализацию. Мы изготовим элементы проекта, предоставляем мультимедийное оборудование и интерактивный контент, текстовые, фото, аудио и видеоматериалы.\n\nРазработаем, доставим и установим выставочные и торговые конструкции на объектах.",
                services: [
                    "Концерты",
                    "Спортивные мероприятия",
                    "Проведение презентаций, конференций и других мероприятий"
                ],
                image: "./assets/Организация мероприятий.jpg"
            },
            {
                title: "Интернет-маркетинг",
                description:
                    "Наше агентство работает с 95% площадок Рунета. Ваши рекламные объявления появляются в популярных системах Яндекс и Google, а также появляются на сайтах партнёров поисковых систем и социальных сетях.\n\nПодберём наиболее эффективные площадки для проведения рекламных кампаний.\n\nМЫ СЕРТИФИЦИРОВАННОЕ АГЕНТСТВО.",
                services: [
                    "Поисковое продвижение",
                    "SEO продвижение сайта",
                    "Разработка сайтов",
                    "Баинг"
                ],
                image: "./assets/Интернет-маркетинг.jpg"
            },
            {
                title: "СММ",
                description:
                    "Управление маркетингом и социальных сетях. Работаем над имиджем вашей компании и помогаем выстроить коммуникацию с аудиторией.",
                services: [
                    "Представительство бренда в социальных сетях",
                    "Таргетированная реклама",
                    "Работа с блогерами"
                ],
                image: "./assets/СММ.jpg"
            }
        ]
    }
};

let currentDetailGroupKey = "support";

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}

function getHelpElements() {
    return {
        bgImg: document.querySelector(".help-bg__img"),
        stage: document.querySelector(".help-stage"),
        paralaxText: document.querySelector(".help-paralax-text, .help-parallax-text"),
        title: document.querySelector(".help__title"),
        arrow: document.querySelector(".help-arrow"),

        detail: document.querySelector(".help-detail"),
        detailClose: document.querySelector(".help-detail__close"),
        detailBreadcrumbCurrent: document.querySelector(".help-detail__breadcrumbs-current"),
        detailNavList: document.querySelector(".help-detail__nav-list"),
        detailDescription: document.querySelector(".help-detail__description"),
        detailServicesList: document.querySelector(".help-detail__services-list"),
        detailImg: document.querySelector(".help-detail__img"),
        detailArrow: document.querySelector(".help-detail__arrow"),

        requestPopup: document.querySelector(".help-request-popup"),
        requestPopupDialog: document.querySelector(".help-request-popup__dialog"),
        requestPopupClose: document.querySelector(".help-request-popup__close"),
        requestForm: document.querySelector(".help-request-form"),
        requestServiceInput: document.querySelector(".help-request-form__service"),
        requestServiceVisibleInput: document.querySelector(".help-request-form__service-visible"),

        pricePopup: document.querySelector(".help-price-popup"),
        pricePopupDialog: document.querySelector(".help-price-popup__dialog"),
        pricePopupClose: document.querySelector(".help-price-popup__close"),
        priceForm: document.querySelector(".help-price-form"),
        priceButtons: document.querySelectorAll(".help-detail__download-price")
    };
}

function getCurrentGroup() {
    return detailGroups[currentDetailGroupKey] || detailGroups.support;
}

function getOffsetTopInside(parent, child) {
    let offset = 0;
    let element = child;

    while (element && element !== parent) {
        offset += element.offsetTop;
        element = element.offsetParent;
    }

    return offset;
}

function getStageBottomShift(stage) {
    if (!stage) return 0;

    const cardsSection = document.querySelector(".help-cards-section");

    if (!cardsSection) return 0;

    const sectionTopInsideStage = getOffsetTopInside(stage, cardsSection);
    const sectionBottomInsideStage =
        sectionTopInsideStage + cardsSection.offsetHeight;

    const endOffsetFix = 10;

    return Math.max(
        0,
        sectionBottomInsideStage - window.innerHeight - endOffsetFix
    );
}

function syncHelpTitleBackground(bgImg, title) {
    if (!bgImg || !title) return;

    const imgRect = bgImg.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    const naturalWidth = bgImg.naturalWidth || imgRect.width;
    const naturalHeight = bgImg.naturalHeight || imgRect.height;

    const imageRatio = naturalWidth / naturalHeight;
    const rectRatio = imgRect.width / imgRect.height;

    let renderedWidth;
    let renderedHeight;

    if (imageRatio > rectRatio) {
        renderedHeight = imgRect.height;
        renderedWidth = renderedHeight * imageRatio;
    } else {
        renderedWidth = imgRect.width;
        renderedHeight = renderedWidth / imageRatio;
    }

    const offsetX = (imgRect.width - renderedWidth) / 2;
    const offsetY = (imgRect.height - renderedHeight) / 2;

    const bgX = imgRect.left + offsetX - titleRect.left;
    const bgY = imgRect.top + offsetY - titleRect.top;

    title.style.backgroundSize = `${renderedWidth}px ${renderedHeight}px`;
    title.style.backgroundPosition = `${bgX}px ${bgY}px`;
    title.style.backgroundRepeat = "no-repeat";
}

function renderDetailNav(activeIndex = 0) {
    const {
        detailBreadcrumbCurrent,
        detailNavList
    } = getHelpElements();

    const group = getCurrentGroup();

    if (detailBreadcrumbCurrent) {
        detailBreadcrumbCurrent.textContent = group.title;
    }

    if (!detailNavList) return;

    detailNavList.innerHTML = group.items
        .map((item, index) => {
            const activeClass = index === activeIndex ? " is-active" : "";

            return `
                <button
                    class="help-detail__nav-item${activeClass}"
                    type="button"
                    data-help-detail-index="${index}"
                >
                    ${item.title}
                </button>
            `;
        })
        .join("");

    detailNavList.querySelectorAll(".help-detail__nav-item").forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.helpDetailIndex || 0);
            renderDetail(index);
        });
    });
}

function renderDetail(index) {
    const {
        detailDescription,
        detailServicesList,
        detailImg,
        detailNavList
    } = getHelpElements();

    const group = getCurrentGroup();
    const item = group.items[index];

    if (!item) return;

    if (detailNavList) {
        detailNavList.querySelectorAll(".help-detail__nav-item").forEach((button, buttonIndex) => {
            button.classList.toggle("is-active", buttonIndex === index);
        });
    }

    if (detailDescription) {
        detailDescription.textContent = item.description;
    }

    if (detailServicesList) {
        detailServicesList.innerHTML = item.services
            .map((service) => `<li>${service}</li>`)
            .join("");
    }

    if (detailImg) {
        detailImg.src = item.image;
        detailImg.alt = item.title;
    }
}

function openHelpDetail(card) {
    const { detail } = getHelpElements();

    if (!detail || !card) return;

    const kind = card.dataset.helpKind || "support";

    currentDetailGroupKey = kind === "advertising" ? "advertising" : "support";

    renderDetailNav(0);
    renderDetail(0);

    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.classList.add("help-detail-open");
}

function closeHelpDetail() {
    const { detail } = getHelpElements();

    if (!detail) return;

    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    document.body.classList.remove("help-detail-open");
}

function getCurrentDetailServiceTitle() {
    const activeButton = document.querySelector(".help-detail__nav-item.is-active");

    if (!activeButton) return getCurrentGroup().title;

    return activeButton.textContent.trim();
}

function openHelpRequest(serviceTitle = "") {
    const {
        requestPopup,
        requestServiceInput,
        requestServiceVisibleInput
    } = getHelpElements();

    if (!requestPopup) return;

    const currentTitle = serviceTitle || getCurrentDetailServiceTitle();

    if (requestServiceInput) {
        requestServiceInput.value = currentTitle;
    }

    if (requestServiceVisibleInput) {
        requestServiceVisibleInput.value = currentTitle;
    }

    requestPopup.classList.add("is-open");
    requestPopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("help-request-open");
}

function closeHelpRequest(resetForm = false) {
    const {
        requestPopup,
        requestForm
    } = getHelpElements();

    if (!requestPopup) return;

    requestPopup.classList.remove("is-open");
    requestPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("help-request-open");

    if (resetForm && requestForm) {
        requestForm.reset();
    }
}

function openHelpPricePopup() {
    const { pricePopup } = getHelpElements();

    if (!pricePopup) return;

    pricePopup.classList.add("is-open");
    pricePopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("help-price-open");
}

function closeHelpPricePopup(resetForm = false) {
    const {
        pricePopup,
        priceForm
    } = getHelpElements();

    if (!pricePopup) return;

    pricePopup.classList.remove("is-open");
    pricePopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("help-price-open");

    if (resetForm && priceForm) {
        priceForm.reset();
    }
}

function initHelpDetailCards() {
    const { detail, detailClose, detailArrow } = getHelpElements();
    const cards = document.querySelectorAll(".help-large-card");

    cards.forEach((card) => {
        if (card.dataset.detailReady === "true") return;

        card.addEventListener("click", () => {
            openHelpDetail(card);
        });

        card.dataset.detailReady = "true";
    });

    if (detailArrow && detailArrow.dataset.arrowReady !== "true") {
        detailArrow.addEventListener("click", () => {
            const activeButton = document.querySelector(".help-detail__nav-item.is-active");
            const currentIndex = Number(activeButton?.dataset.helpDetailIndex || 0);
            const group = getCurrentGroup();
            const nextIndex = (currentIndex + 1) % group.items.length;

            renderDetail(nextIndex);
        });

        detailArrow.dataset.arrowReady = "true";
    }

    if (detailClose && detailClose.dataset.closeReady !== "true") {
        detailClose.addEventListener("click", closeHelpDetail);
        detailClose.dataset.closeReady = "true";
    }

    if (detail && detail.dataset.overlayReady !== "true") {
        detail.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        detail.dataset.overlayReady = "true";
    }
}

function initHelpPricePopup() {
    const {
        pricePopup,
        pricePopupDialog,
        pricePopupClose,
        priceForm,
        priceButtons
    } = getHelpElements();

    priceButtons.forEach((button) => {
        if (button.dataset.priceReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            openHelpPricePopup();
        });

        button.dataset.priceReady = "true";
    });

    if (pricePopupClose && pricePopupClose.dataset.priceCloseReady !== "true") {
        pricePopupClose.addEventListener("click", () => {
            closeHelpPricePopup();
        });

        pricePopupClose.dataset.priceCloseReady = "true";
    }

    if (priceForm && priceForm.dataset.priceFormReady !== "true") {
        priceForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeHelpPricePopup(true);
        });

        priceForm.dataset.priceFormReady = "true";
    }

    if (pricePopup && pricePopup.dataset.pricePopupReady !== "true") {
        pricePopup.addEventListener("click", (e) => {
            if (e.target === pricePopup) {
                closeHelpPricePopup();
            }
        });

        pricePopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        pricePopup.dataset.pricePopupReady = "true";
    }

    if (
        pricePopupDialog &&
        pricePopupDialog.dataset.priceDialogReady !== "true"
    ) {
        pricePopupDialog.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        pricePopupDialog.dataset.priceDialogReady = "true";
    }
}

function initHelpRequestPopup() {
    const {
        requestPopup,
        requestPopupDialog,
        requestPopupClose,
        requestForm
    } = getHelpElements();

    const requestButtons = document.querySelectorAll(".help-open-request");

    requestButtons.forEach((button) => {
        if (button.dataset.requestReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            openHelpRequest(getCurrentDetailServiceTitle());
        });

        button.dataset.requestReady = "true";
    });

    if (requestPopupClose && requestPopupClose.dataset.popupCloseReady !== "true") {
        requestPopupClose.addEventListener("click", () => {
            closeHelpRequest();
        });

        requestPopupClose.dataset.popupCloseReady = "true";
    }

    if (requestForm && requestForm.dataset.formReady !== "true") {
        requestForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeHelpRequest(true);
        });

        requestForm.dataset.formReady = "true";
    }

    if (requestPopup && requestPopup.dataset.popupReady !== "true") {
        requestPopup.addEventListener("click", (e) => {
            if (e.target === requestPopup) {
                closeHelpRequest();
            }
        });

        requestPopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        requestPopup.dataset.popupReady = "true";
    }

    if (
        requestPopupDialog &&
        requestPopupDialog.dataset.dialogReady !== "true"
    ) {
        requestPopupDialog.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        requestPopupDialog.dataset.dialogReady = "true";
    }

    if (document.body.dataset.helpEscapeReady !== "true") {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;

            const {
                requestPopup: popup,
                pricePopup,
                detail
            } = getHelpElements();

            if (pricePopup && pricePopup.classList.contains("is-open")) {
                closeHelpPricePopup();
                return;
            }

            if (popup && popup.classList.contains("is-open")) {
                closeHelpRequest();
                return;
            }

            if (detail && detail.classList.contains("is-open")) {
                closeHelpDetail();
            }
        });

        document.body.dataset.helpEscapeReady = "true";
    }
}

export function initHelpParallax() {
    if (!document.body.classList.contains("help-page")) return;

    state.pageProgressMax = HELP_MAX_PROGRESS;

    const { bgImg, arrow } = getHelpElements();

    initHelpDetailCards();
    initHelpRequestPopup();
    initHelpPricePopup();

    if (bgImg) {
        bgImg.style.transformOrigin = "center center";

        if (bgImg.complete) {
            updateHelpScene(state.progress);
        } else {
            bgImg.addEventListener("load", () => {
                updateHelpScene(state.progress);
            });
        }
    }

    if (arrow) {
        arrow.addEventListener("click", () => {
            state.targetProgress = clamp(
                Math.ceil(state.targetProgress + 0.1),
                0,
                HELP_MAX_PROGRESS
            );
        });
    }

    updateHelpScene(state.progress);
}

export function updateHelpScene(progressValue) {
    if (!document.body.classList.contains("help-page")) return;

    const p = clamp(progressValue, 0, HELP_MAX_PROGRESS);
    const heroProgress = clamp(p, 0, 1);

    const {
        bgImg,
        stage,
        paralaxText,
        title,
        arrow
    } = getHelpElements();

    if (stage) {
        const maxStageShift = getStageBottomShift(stage);

        const stageY = mapRange(
            p,
            1,
            HELP_MAX_PROGRESS,
            0,
            -maxStageShift
        );

        stage.style.transform = `translateY(${stageY}px)`;
    }

    if (bgImg) {
        const bgZoom = 1 + heroProgress * 0.4;
        const bgMove = heroProgress * 80;

        bgImg.style.transformOrigin = "center center";
        bgImg.style.transform = `translateY(${bgMove}px) scale(${bgZoom})`;
    }

    if (paralaxText) {
        const textMove = heroProgress * 115;
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
    }

    if (bgImg && title) {
        syncHelpTitleBackground(bgImg, title);
    }

    if (arrow) {
        arrow.style.opacity = p >= HELP_MAX_PROGRESS - 0.05 ? "0" : "1";
    }

    updatePageScrollbar(p);
}

export function resetHelpScene() {
    if (!document.body.classList.contains("help-page")) return;

    state.progress = 0;
    state.targetProgress = 0;

    updateHelpScene(0);
}