import { updatePageScrollbar } from "./page-scrollbar.js";
import { getAssetUrl, getPageUrl } from "./runtime.js";
import { normalizeMojibake } from "./text-normalize.js";
import {
    ABOUT_HELP_MAX,
    ABOUT_HELP_REVEAL_START,
    ABOUT_HELP_START
} from "./about-timeline.js";

const ABOUT_HELP_CARDS_IDLE_START = 1.18;
const ABOUT_HELP_CARDS_OVERLAP_START = 1.26;
const ABOUT_HELP_CARDS_OVERLAP_END = 1.78;

let isReady = false;
let isLoading = false;
let currentDetailGroupKey = "support";
let detailWheelLocked = false;

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
                image: "./assets/Услуги Текстура/Разраб Презентации.jpg"
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
                image: "./assets/Услуги Текстура/Ки-арт.jpg"
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
                image: "./assets/Услуги Текстура/Подготовка заявки.jpg"
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
                image: "./assets/Услуги Текстура/ПрокатУд.jpg"
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
                image: "./assets/Услуги Текстура/Постпродакшн.jpg"
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
                image: "./assets/Услуги Текстура/Креатив.jpg"
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
                image: "./assets/Услуги Текстура/Дизайн.jpg"
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
                image: "./assets/Услуги Текстура/Планирование.jpg"
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
                image: "./assets/Услуги Текстура/Видеосъемка.jpg"
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
                image: "./assets/Услуги Текстура/Фотосъемка.jpg"
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
                image: "./assets/Услуги Текстура/Организация мероприятий.jpg"
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
                image: "./assets/Услуги Текстура/Интернет-маркетинг.jpg"
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
                image: "./assets/Услуги Текстура/СММ.jpg"
            }
        ]
    }
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}
function smoothstep(value) {
    const x = clamp(value, 0, 1);
    return x * x * (3 - 2 * x);
}

function mapRangeSmooth(value, inMin, inMax, outMin, outMax) {
    const progress = smoothstep((value - inMin) / (inMax - inMin));
    return outMin + (outMax - outMin) * progress;
}

function remapClassName(className) {
    if (className === "help-bg") return "about-help-bg";
    if (className === "help-bg__img") return "about-help-bg__img";
    if (className === "help-stage") return "about-help-stage";
    if (className === "help-hero") return "about-help-hero";
    if (className === "help-paralax-text") return "about-help-paralax-text";
    if (className === "help-parallax-text") return "about-help-parallax-text";
    if (className === "help__title") return "about-help__title";
    if (className === "help__subtitle") return "about-help__subtitle";
    if (className === "help-arrow") return "about-help-arrow";

    if (className.startsWith("help-")) {
        return className.replace("help-", "about-help-");
    }

    if (className.startsWith("help__")) {
        return className.replace("help__", "about-help__");
    }

    return className;
}

function remapElementClasses(root) {
    root.querySelectorAll(".menu, .settings, script, link, style").forEach((node) => {
        node.remove();
    });

    const allElements = [root, ...root.querySelectorAll("*")];

    allElements.forEach((element) => {
        const newClasses = Array.from(element.classList).map(remapClassName);
        element.className = newClasses.join(" ");
    });
}

function getElements() {
    return {
        section: document.querySelector(".about-help-section"),
        bgImg: document.querySelector(".about-help-bg__img"),
        stage: document.querySelector(".about-help-stage"),
        cardsSection: document.querySelector(".about-help-cards-section"),
        paralaxText: document.querySelector(".about-help-paralax-text, .about-help-parallax-text"),
        title: document.querySelector(".about-help__title"),
        arrow: document.querySelector(".about-help-arrow"),

        detail: document.querySelector(".about-help-detail"),
        detailClose: document.querySelector(".about-help-detail__back"),
        detailBreadcrumbHome: document.querySelector(".about-help-detail__breadcrumbs-home"),
        detailBreadcrumbCurrent: document.querySelector(".about-help-detail__breadcrumbs-current"),
        detailNavList: document.querySelector(".about-help-detail__nav-list"),
        detailText: document.querySelector(".about-help-detail__text"),
        detailDescription: document.querySelector(".about-help-detail__description"),
        detailServicesList: document.querySelector(".about-help-detail__services-list"),
        detailImg: document.querySelector(".about-help-detail__img"),
        detailArrow: document.querySelector(".about-help-detail__arrow"),

        requestPopup: document.querySelector(".about-help-request-popup"),
        requestPopupDialog: document.querySelector(".about-help-request-popup__dialog"),
        requestPopupClose: document.querySelector(".about-help-request-popup__close"),
        requestForm: document.querySelector(".about-help-request-form"),
        requestServiceInput: document.querySelector(".about-help-request-form__service"),
        requestServiceVisibleInput: document.querySelector(".about-help-request-form__service-visible"),

        pricePopup: document.querySelector(".about-help-price-popup"),
        pricePopupDialog: document.querySelector(".about-help-price-popup__dialog"),
        pricePopupClose: document.querySelector(".about-help-price-popup__close"),
        priceForm: document.querySelector(".about-help-price-form"),
        priceButtons: document.querySelectorAll(".about-help-detail__download-price")
    };
}

function getCurrentGroup() {
    return detailGroups[currentDetailGroupKey] || detailGroups.support;
}

function getCurrentDetailIndex() {
    const activeButton = document.querySelector(
        ".about-help-detail__nav-item.is-active"
    );

    return Number(activeButton?.dataset.aboutHelpDetailIndex || 0);
}

function switchDetailGroup(direction = 1, targetIndex = 0) {
    const groupKeys = Object.keys(detailGroups);
    const currentGroupIndex = Math.max(
        0,
        groupKeys.indexOf(currentDetailGroupKey)
    );
    const nextGroupIndex =
        (currentGroupIndex + direction + groupKeys.length) % groupKeys.length;

    currentDetailGroupKey = groupKeys[nextGroupIndex];

    const group = getCurrentGroup();
    const nextIndex = targetIndex < 0
        ? group.items.length - 1
        : Math.min(targetIndex, group.items.length - 1);

    renderDetailNav(nextIndex);
    renderDetail(nextIndex);
}

function stepDetail(direction = 1) {
    const group = getCurrentGroup();
    const currentIndex = getCurrentDetailIndex();
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < group.items.length) {
        renderDetail(nextIndex);
        return;
    }

    switchDetailGroup(direction, direction > 0 ? 0 : -1);
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

    const cardsSection = document.querySelector(".about-help-cards-section");

    if (!cardsSection) return 0;

    const sectionTopInsideStage = getOffsetTopInside(stage, cardsSection);
    const rawShift = window.getComputedStyle(cardsSection)
        .getPropertyValue("--about-help-cards-parallax-shift")
        .trim();
    const parallaxShift = rawShift.endsWith("vh")
        ? (parseFloat(rawShift) / 100) * window.innerHeight
        : parseFloat(rawShift) || 0;
    const sectionBottomInsideStage = sectionTopInsideStage +
        cardsSection.offsetHeight -
        parallaxShift;

    return Math.max(0, sectionBottomInsideStage - window.innerHeight - 10);
}

function syncAboutHelpTitleBackground(bgImg, title) {
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
    const { detailBreadcrumbCurrent, detailNavList } = getElements();
    const group = getCurrentGroup();

    if (detailBreadcrumbCurrent) {
        detailBreadcrumbCurrent.textContent = group.title;
        detailBreadcrumbCurrent.title = "Переключить набор услуг";
    }

    if (!detailNavList) return;

    detailNavList.innerHTML = group.items
        .map((item, index) => {
            const activeClass = index === activeIndex ? " is-active" : "";

            return `
                <button
                    class="about-help-detail__nav-item${activeClass}"
                    type="button"
                    data-about-help-detail-index="${index}"
                >
                    ${item.title}
                </button>
            `;
        })
        .join("");

    detailNavList.querySelectorAll(".about-help-detail__nav-item").forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.aboutHelpDetailIndex || 0);
            renderDetail(index);
        });
    });
}

function renderDetail(index) {
    const {
        detailDescription,
        detailServicesList,
        detailImg,
        detailNavList,
        detailText
    } = getElements();
    const group = getCurrentGroup();
    const item = group.items[index];

    if (!item) return;

    if (detailNavList) {
        detailNavList.querySelectorAll(".about-help-detail__nav-item").forEach((button, buttonIndex) => {
            button.classList.toggle("is-active", buttonIndex === index);
        });
    }

    if (detailDescription) {
        detailDescription.textContent = item.description;
    }

    if (detailText) {
        detailText.scrollTop = 0;
    }

    if (detailServicesList) {
        detailServicesList.innerHTML = item.services
            .map((service) => `<li>${service}</li>`)
            .join("");
    }

    if (detailImg) {
        detailImg.src = getAssetUrl(item.image);
        detailImg.alt = item.title.replace(/<br\s*\/?>/gi, " ");
    }
}

function openDetail(card) {
    const { detail } = getElements();

    if (!detail || !card) return;

    const kind = card.dataset.helpKind || card.dataset.aboutHelpKind || "support";

    currentDetailGroupKey = kind === "advertising" ? "advertising" : "support";

    renderDetailNav(0);
    renderDetail(0);

    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-help-detail-open");
}

function ensureCardDetailButtons(root = document) {
    root.querySelectorAll(".about-help-large-card").forEach((card) => {
        if (card.querySelector(".about-help-card-button")) return;

        const button = document.createElement("button");

        button.className = "about-help-card-button";
        button.type = "button";
        button.textContent = "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435";

        card.appendChild(button);
    });
}

function closeDetail() {
    const { detail } = getElements();

    if (!detail) return;

    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-help-detail-open");
}

function getCurrentDetailServiceTitle() {
    const activeButton = document.querySelector(".about-help-detail__nav-item.is-active");

    if (!activeButton) return getCurrentGroup().title;

    return activeButton.textContent.trim();
}

function openRequest(serviceTitle = "") {
    const { requestPopup, requestServiceInput, requestServiceVisibleInput } = getElements();

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
    document.body.classList.add("about-help-request-open");
}

function closeRequest(resetForm = false) {
    const { requestPopup, requestForm } = getElements();

    if (!requestPopup) return;

    requestPopup.classList.remove("is-open");
    requestPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-help-request-open");

    if (resetForm && requestForm) {
        requestForm.reset();
    }
}

function openPricePopup() {
    const { pricePopup } = getElements();

    if (!pricePopup) return;

    pricePopup.classList.add("is-open");
    pricePopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-help-price-open");
}

function closePricePopup(resetForm = false) {
    const { pricePopup, priceForm } = getElements();

    if (!pricePopup) return;

    pricePopup.classList.remove("is-open");
    pricePopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-help-price-open");

    if (resetForm && priceForm) {
        priceForm.reset();
    }
}

function initInteractions() {
    const {
        detail,
        detailClose,
        detailArrow,
        detailBreadcrumbHome,
        detailBreadcrumbCurrent,
        requestPopup,
        requestPopupDialog,
        requestPopupClose,
        requestForm,
        pricePopup,
        pricePopupDialog,
        pricePopupClose,
        priceForm,
        priceButtons
    } = getElements();

    ensureCardDetailButtons();

    document.querySelectorAll(".about-help-card-button").forEach((button) => {
        if (button.dataset.aboutHelpDetailReady === "true") return;

        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            openDetail(button.closest(".about-help-large-card"));
        });

        button.dataset.aboutHelpDetailReady = "true";
    });

    if (detailArrow && detailArrow.dataset.aboutHelpArrowReady !== "true") {
        detailArrow.addEventListener("click", () => {
            stepDetail(1);
        });

        detailArrow.dataset.aboutHelpArrowReady = "true";
    }

    if (
        detailBreadcrumbHome &&
        detailBreadcrumbHome.dataset.aboutHelpHomeReady !== "true"
    ) {
        detailBreadcrumbHome.addEventListener("click", () => {
            window.location.href = getPageUrl("help");
        });

        detailBreadcrumbHome.dataset.aboutHelpHomeReady = "true";
    }

    if (
        detailBreadcrumbCurrent &&
        detailBreadcrumbCurrent.dataset.aboutHelpGroupSwitchReady !== "true"
    ) {
        detailBreadcrumbCurrent.addEventListener("click", () => {
            switchDetailGroup(1, 0);
        });

        detailBreadcrumbCurrent.dataset.aboutHelpGroupSwitchReady = "true";
    }

    if (detailClose && detailClose.dataset.aboutHelpCloseReady !== "true") {
        detailClose.addEventListener("click", closeDetail);
        detailClose.dataset.aboutHelpCloseReady = "true";
    }

    if (detail && detail.dataset.aboutHelpOverlayReady !== "true") {
        detail.addEventListener("wheel", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (detailWheelLocked || Math.abs(e.deltaY) < 4) return;

            detailWheelLocked = true;
            stepDetail(e.deltaY > 0 ? 1 : -1);

            window.setTimeout(() => {
                detailWheelLocked = false;
            }, 320);
        });

        detail.dataset.aboutHelpOverlayReady = "true";
    }

    priceButtons.forEach((button) => {
        if (button.dataset.aboutHelpPriceReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPricePopup();
        });

        button.dataset.aboutHelpPriceReady = "true";
    });

    if (pricePopupClose && pricePopupClose.dataset.aboutHelpPriceCloseReady !== "true") {
        pricePopupClose.addEventListener("click", () => {
            closePricePopup();
        });

        pricePopupClose.dataset.aboutHelpPriceCloseReady = "true";
    }

    if (priceForm && priceForm.dataset.aboutHelpPriceFormReady !== "true") {
        priceForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closePricePopup(true);
        });

        priceForm.dataset.aboutHelpPriceFormReady = "true";
    }

    if (pricePopup && pricePopup.dataset.aboutHelpPricePopupReady !== "true") {
        pricePopup.addEventListener("click", (e) => {
            if (e.target === pricePopup) closePricePopup();
        });

        pricePopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        pricePopup.dataset.aboutHelpPricePopupReady = "true";
    }

    if (pricePopupDialog && pricePopupDialog.dataset.aboutHelpPriceDialogReady !== "true") {
        pricePopupDialog.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        pricePopupDialog.dataset.aboutHelpPriceDialogReady = "true";
    }

    document.querySelectorAll(".about-help-open-request").forEach((button) => {
        if (button.dataset.aboutHelpRequestReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openRequest(getCurrentDetailServiceTitle());
        });

        button.dataset.aboutHelpRequestReady = "true";
    });

    if (requestPopupClose && requestPopupClose.dataset.aboutHelpPopupCloseReady !== "true") {
        requestPopupClose.addEventListener("click", () => {
            closeRequest();
        });

        requestPopupClose.dataset.aboutHelpPopupCloseReady = "true";
    }

    if (requestForm && requestForm.dataset.aboutHelpFormReady !== "true") {
        requestForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeRequest(true);
        });

        requestForm.dataset.aboutHelpFormReady = "true";
    }

    if (requestPopup && requestPopup.dataset.aboutHelpPopupReady !== "true") {
        requestPopup.addEventListener("click", (e) => {
            if (e.target === requestPopup) closeRequest();
        });

        requestPopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        requestPopup.dataset.aboutHelpPopupReady = "true";
    }

    if (requestPopupDialog && requestPopupDialog.dataset.aboutHelpDialogReady !== "true") {
        requestPopupDialog.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        requestPopupDialog.dataset.aboutHelpDialogReady = "true";
    }

    if (document.body.dataset.aboutHelpEscapeReady !== "true") {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;

            const {
                requestPopup: popup,
                pricePopup: currentPricePopup,
                detail: currentDetail
            } = getElements();

            if (currentPricePopup && currentPricePopup.classList.contains("is-open")) {
                closePricePopup();
                return;
            }

            if (popup && popup.classList.contains("is-open")) {
                closeRequest();
                return;
            }

            if (currentDetail && currentDetail.classList.contains("is-open")) {
                closeDetail();
            }
        });

        document.body.dataset.aboutHelpEscapeReady = "true";
    }
}

async function loadHelpContent() {
    const { section } = getElements();

    if (!section || isLoading || isReady) return;

    isLoading = true;

    try {
        const response = await fetch(getPageUrl("help"));
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        doc.querySelectorAll(".menu, .settings, script, link, style").forEach((node) => {
            node.remove();
        });

        const sourceNodes = [
            doc.querySelector(".help-bg"),
            doc.querySelector(".help-stage"),
            doc.querySelector(".help-detail"),
            doc.querySelector(".help-price-popup"),
            doc.querySelector(".help-request-popup"),
            doc.querySelector(".help-arrow")
        ].filter(Boolean);

        section.innerHTML = "";

        sourceNodes.forEach((node) => {
            const clone = node.cloneNode(true);
            remapElementClasses(clone);
            section.appendChild(clone);
        });


        const cardImages = {
            support: "assets/Услуги Текстура/сопровождение проектов.jpg",
            advertising: "assets/Услуги Текстура/рекламный департамент.jpg"
        };

        section.querySelectorAll(".about-help-large-card").forEach((card) => {
            const image = card.querySelector("img");
            const imagePath = cardImages[card.dataset.helpKind];

            if (!image || !imagePath) return;

            image.removeAttribute("srcset");
            image.loading = "eager";
            image.decoding = "async";
            image.src = getAssetUrl(imagePath);
        });
        normalizeMojibake(section);
        ensureCardDetailButtons(section);
        initInteractions();

        isReady = true;
        isLoading = false;

        updateAboutHelpSection(0);
    } catch (error) {
        console.error("About help load error:", error);

        section.innerHTML = `
            <div class="about-help-section__loader">
                Не удалось загрузить услуги
            </div>
        `;

        isLoading = false;
    }
}

export function initAboutHelpSection() {
    if (!document.body.classList.contains("about-page")) return;

    loadHelpContent();
}

export function updateAboutHelpSection(globalProgress) {
    if (!document.body.classList.contains("about-page")) return;

    const { section, bgImg, stage, cardsSection, paralaxText, title, arrow } = getElements();

    if (!section) return;

    const revealY = mapRangeSmooth(
        globalProgress,
        ABOUT_HELP_REVEAL_START,
        ABOUT_HELP_START,
        100,
        0
    );

    const localProgress = clamp(
        globalProgress - ABOUT_HELP_START,
        0,
        ABOUT_HELP_MAX
    );

    const heroProgress = clamp(localProgress, 0, 1);

    section.style.transform = `translateY(${revealY}vh)`;

    if (!isReady) {
        updatePageScrollbar(globalProgress);
        return;
    }

    if (stage) {
        const maxStageShift = getStageBottomShift(stage);

        const stageY = mapRangeSmooth(
            localProgress,
            1,
            ABOUT_HELP_MAX,
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

    if (cardsSection) {
        const cardsOverlapProgress = smoothstep(
            mapRange(
                localProgress,
                ABOUT_HELP_CARDS_OVERLAP_START,
                ABOUT_HELP_CARDS_OVERLAP_END,
                0,
                1
            )
        );

        cardsSection.style.setProperty(
            "--about-help-cards-overlap-progress",
            cardsOverlapProgress
        );
    }

    if (bgImg && title) {
        syncAboutHelpTitleBackground(bgImg, title);
    }

    if (arrow) {
        arrow.style.opacity = localProgress >= ABOUT_HELP_MAX - 0.05 ? "0" : "1";
    }

    updatePageScrollbar(globalProgress);
}
