import { updatePageScrollbar } from "./page-scrollbar.js";

const ABOUT_PROJECTS_REVEAL_START = 1.28;
const ABOUT_PROJECTS_START = 1.48;
const ABOUT_PROJECTS_MAX = 3;

let isReady = false;
let isLoading = false;

const PREVIEW_LIMIT = 10;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}

function getElements() {
    return {
        section: document.querySelector(".about-projects-section"),
        bgImg: document.querySelector(".about-projects-bg__img"),
        stage: document.querySelector(".about-projects-stage"),
        titleLayer: document.querySelector(".about-projects-paralax-text"),
        title: document.querySelector(".about-projects__title"),
        preview: document.querySelector(".about-projects-preview"),

        detail: document.querySelector(".about-projects-detail"),
        detailImg: document.querySelector(".about-projects-detail__img"),
        detailTitle: document.querySelector(".about-projects-detail__title"),
        detailGenre: document.querySelector(".about-projects-detail__genre"),
        detailNote: document.querySelector(".about-projects-detail__note"),
        detailDescription: document.querySelector(".about-projects-detail__description"),
        detailText: document.querySelector(".about-projects-detail__text"),
        detailScrollbarFill: document.querySelector(".about-projects-detail__scrollbar-fill"),
        detailAge: document.querySelector(".about-projects-detail__age"),
        detailFormat: document.querySelector(".about-projects-detail__format"),
        detailDuration: document.querySelector(".about-projects-detail__duration"),
        detailClose: document.querySelector(".about-projects-detail__close"),
        detailBackButtons: document.querySelectorAll(".about-projects-detail__nav"),

        requestPopup: document.querySelector(".about-projects-request-popup"),
        requestPopupClose: document.querySelector(".about-projects-request-popup__close"),
        requestForm: document.querySelector(".about-projects-request-form"),
        requestProjectInput: document.querySelector(".about-projects-request-form__project")
    };
}

const CLASS_MAP = {
    "project-detail": "about-projects-detail",
    "project-detail__media": "about-projects-detail__media",
    "project-detail__img": "about-projects-detail__img",
    "project-detail__content": "about-projects-detail__content",
    "project-detail__close": "about-projects-detail__close",
    "project-detail__top": "about-projects-detail__top",
    "project-detail__title": "about-projects-detail__title",
    "project-detail__genre": "about-projects-detail__genre",
    "project-detail__note": "about-projects-detail__note",
    "project-detail__text-wrap": "about-projects-detail__text-wrap",
    "project-detail__text": "about-projects-detail__text",
    "project-detail__scrollbar": "about-projects-detail__scrollbar",
    "project-detail__scrollbar-fill": "about-projects-detail__scrollbar-fill",
    "project-detail__description": "about-projects-detail__description",
    "project-detail__meta": "about-projects-detail__meta",
    "project-detail__age": "about-projects-detail__age",
    "project-detail__divider": "about-projects-detail__divider",
    "project-detail__format": "about-projects-detail__format",
    "project-detail__duration": "about-projects-detail__duration",
    "project-detail__status": "about-projects-detail__status",
    "project-detail__bottom": "about-projects-detail__bottom",
    "project-detail__teaser": "about-projects-detail__teaser",
    "project-detail__nav": "about-projects-detail__nav",
    "project-detail__request": "about-projects-detail__request",

    "projects-request-popup": "about-projects-request-popup",
    "projects-request-popup__container": "about-projects-request-popup__container",
    "projects-request-popup__dialog": "about-projects-request-popup__dialog",
    "projects-request-popup__close": "about-projects-request-popup__close",
    "projects-request-popup__title": "about-projects-request-popup__title",
    "projects-request-form": "about-projects-request-form",
    "projects-request-form__project": "about-projects-request-form__project",
    "projects-request-form__row": "about-projects-request-form__row",
    "projects-request-form__row--options": "about-projects-request-form__row--options",
    "projects-request-form__row--textarea": "about-projects-request-form__row--textarea",
    "projects-request-form__label": "about-projects-request-form__label",
    "projects-request-form__field": "about-projects-request-form__field",
    "projects-request-form__field--checks": "about-projects-request-form__field--checks",
    "projects-request-form__check": "about-projects-request-form__check",
    "projects-request-form__submit": "about-projects-request-form__submit",
    "projects-open-request": "about-projects-open-request"
};

function remapElementClasses(root) {
    root.querySelectorAll(".menu, .settings, script, link, style").forEach((node) => {
        node.remove();
    });

    root.querySelectorAll("*").forEach((element) => {
        const newClasses = Array.from(element.classList).map((className) => {
            return CLASS_MAP[className] || className;
        });

        element.className = newClasses.join(" ");
    });

    const rootClasses = Array.from(root.classList).map((className) => {
        return CLASS_MAP[className] || className;
    });

    root.className = rootClasses.join(" ");
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getEpisodesText(duration) {
    if (!duration) return "";

    const match = duration.match(/(\d+\s*сер(?:ия|ии|ий))/i);

    if (match) return match[1];

    return duration;
}

function getTitleSizeClass(title) {
    const cleanTitle = title.trim();
    const titleLength = cleanTitle.length;
    const wordsCount = cleanTitle.split(/\s+/).filter(Boolean).length;

    if (titleLength > 42 || wordsCount >= 5) return " is-ultra-long";
    if (titleLength > 30 || wordsCount >= 4) return " is-extra-long";
    if (titleLength > 18 || wordsCount >= 3) return " is-long";

    return "";
}

function createPreviewCard(sourceCard) {
    const img = sourceCard.querySelector("img");

    const title = sourceCard.dataset.projectTitle || img?.alt || "";
    const genre = sourceCard.dataset.projectGenre || "";
    const age = sourceCard.dataset.projectAge || "";
    const duration = sourceCard.dataset.projectDuration || "";
    const episodes = getEpisodesText(duration);
    const titleSizeClass = getTitleSizeClass(title);

    const card = document.createElement("article");

    card.className = "about-projects-card";

    Array.from(sourceCard.attributes).forEach((attribute) => {
        if (attribute.name.startsWith("data-")) {
            card.setAttribute(attribute.name, attribute.value);
        }
    });

    card.innerHTML = `
        <img src="${escapeHtml(img?.getAttribute("src") || "")}" alt="${escapeHtml(img?.getAttribute("alt") || title)}" />

        <div class="about-projects-card__hover">
            <div class="about-projects-card__hover-top">
                <span>${escapeHtml(episodes)}</span>
                <span>${escapeHtml(age)}</span>
            </div>

            <div class="about-projects-card__hover-bottom">
                <h3 class="about-projects-card__hover-title${titleSizeClass}">
                    ${escapeHtml(title)}
                </h3>

                <p class="about-projects-card__hover-genre">${escapeHtml(genre)}</p>
            </div>
        </div>
    `;

    return card;
}

function buildSection(cards, detailNode, requestNode) {
    const { section } = getElements();

    if (!section) return;

    section.innerHTML = `
        <div class="about-projects-bg">
            <img
                src="./assets/Наши проекты Моб.jpg"
                class="about-projects-bg__img"
                alt="Наши проекты"
            />
        </div>

        <div class="about-projects-stage">
            <section class="about-projects-hero">
                <div class="about-projects-paralax-text">
                    <h2 class="about-projects__title">НАШИ ПРОЕКТЫ</h2>

                    <p class="about-projects__subtitle">
                        Мы готовы предложить<br />
                        вашему вниманию
                    </p>

                    <div class="about-projects-services-viewport">
                        <div class="about-projects-services">
                            <div class="about-projects-service">
                                <span></span>
                                <p>ТВ, фильмы,<br />сериалы,<br />док. кино</p>
                            </div>

                            <div class="about-projects-service">
                                <span></span>
                                <p>Свои<br />сценарии</p>
                            </div>

                            <div class="about-projects-service">
                                <span></span>
                                <p>Осуществить<br />разработку<br />вашего проекта</p>
                            </div>

                            <div class="about-projects-service" aria-hidden="true">
                                <span></span>
                                <p>ТВ, фильмы,<br />сериалы,<br />док. кино</p>
                            </div>

                            <div class="about-projects-service" aria-hidden="true">
                                <span></span>
                                <p>Свои<br />сценарии</p>
                            </div>

                            <div class="about-projects-service" aria-hidden="true">
                                <span></span>
                                <p>Осуществить<br />разработку<br />вашего проекта</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="about-projects-preview">
                <div class="about-projects-grid"></div>

                <div class="about-projects-actions">
                    <a class="about-projects-all" href="./projects.html">Все проекты</a>

                    <button
                        class="about-projects-open-request about-projects-request-btn"
                        type="button"
                    >
                        Оставить заявку
                    </button>
                </div>
            </section>
        </div>
    `;

    const grid = section.querySelector(".about-projects-grid");

    cards.slice(0, PREVIEW_LIMIT).forEach((card) => {
        grid.appendChild(createPreviewCard(card));
    });

    if (detailNode) {
        const detailClone = detailNode.cloneNode(true);
        remapElementClasses(detailClone);
        section.appendChild(detailClone);
    }

    if (requestNode) {
        const requestClone = requestNode.cloneNode(true);
        remapElementClasses(requestClone);
        section.appendChild(requestClone);
    }
}

function updateDetailTextScrollbar() {
    const { detailText, detailScrollbarFill } = getElements();

    const textWrap = document.querySelector(".about-projects-detail__text-wrap");
    const scrollbar = document.querySelector(".about-projects-detail__scrollbar");

    if (!detailText || !detailScrollbarFill || !textWrap || !scrollbar) return;

    const scrollableHeight = detailText.scrollHeight - detailText.clientHeight;
    const hasScroll = scrollableHeight > 2;

    textWrap.classList.toggle("has-scroll", hasScroll);

    if (!hasScroll) {
        detailScrollbarFill.style.height = "0%";
        detailScrollbarFill.style.transform = "translateY(0)";
        return;
    }

    const progress = detailText.scrollTop / scrollableHeight;
    const visibleRatio = detailText.clientHeight / detailText.scrollHeight;

    const fillHeight = Math.max(14, visibleRatio * 100);
    const maxMove = 100 - fillHeight;

    detailScrollbarFill.style.height = `${fillHeight}%`;
    detailScrollbarFill.style.transform = `translateY(${progress * maxMove}%)`;
}

function fitDetailTextHeight() {
    const detail = document.querySelector(".about-projects-detail");
    const content = document.querySelector(".about-projects-detail__content");
    const top = document.querySelector(".about-projects-detail__top");
    const textWrap = document.querySelector(".about-projects-detail__text-wrap");
    const meta = document.querySelector(".about-projects-detail__meta");
    const status = document.querySelector(".about-projects-detail__status");
    const bottom = document.querySelector(".about-projects-detail__bottom");

    if (
        !detail ||
        !detail.classList.contains("is-open") ||
        !content ||
        !top ||
        !textWrap ||
        !meta ||
        !status ||
        !bottom
    ) {
        return;
    }

    textWrap.style.removeProperty("--about-projects-detail-text-height");

    const textWrapStyles = window.getComputedStyle(textWrap);
    const contentStyles = window.getComputedStyle(content);
    const defaultHeight = textWrap.getBoundingClientRect().height;
    const contentPaddingTop = Number.parseFloat(contentStyles.paddingTop) || 0;
    const textWrapMarginTop = Number.parseFloat(textWrapStyles.marginTop) || 0;
    const safetyGap = 18;

    const usedHeight =
        contentPaddingTop +
        top.getBoundingClientRect().height +
        textWrapMarginTop +
        meta.getBoundingClientRect().height +
        status.getBoundingClientRect().height +
        bottom.getBoundingClientRect().height +
        safetyGap;

    const availableHeight = content.clientHeight - usedHeight;
    const fittedHeight = Math.max(0, Math.min(defaultHeight, availableHeight));

    textWrap.style.setProperty(
        "--about-projects-detail-text-height",
        `${fittedHeight}px`
    );

    const bottomOverflow =
        bottom.getBoundingClientRect().bottom - detail.getBoundingClientRect().bottom;

    if (bottomOverflow > 0) {
        textWrap.style.setProperty(
            "--about-projects-detail-text-height",
            `${Math.max(0, fittedHeight - bottomOverflow - safetyGap)}px`
        );
    }
}

function updateDetailLayout() {
    fitDetailTextHeight();
    updateDetailTextScrollbar();
}

function getCurrentDetailProjectTitle() {
    const { detail, detailTitle } = getElements();

    if (!detail || !detail.classList.contains("is-open") || !detailTitle) {
        return "";
    }

    return detailTitle.textContent.trim();
}

function openDetail(card) {
    const {
        detail,
        detailImg,
        detailTitle,
        detailGenre,
        detailNote,
        detailDescription,
        detailText,
        detailAge,
        detailFormat,
        detailDuration
    } = getElements();

    if (!detail || !card) return;

    const img = card.querySelector("img");

    const title = card.dataset.projectTitle || img?.alt || "";
    const genre = card.dataset.projectGenre || "";
    const note = card.dataset.projectNote || "";
    const age = card.dataset.projectAge || "";
    const format = card.dataset.projectFormat || "";
    const duration = card.dataset.projectDuration || "";
    const description =
        card.dataset.projectDescription ||
        "Описание проекта находится в разработке.";

    if (detailImg && img) {
        detailImg.src = img.getAttribute("src");
        detailImg.alt = img.getAttribute("alt") || title;
    }

    if (detailTitle) detailTitle.textContent = title;
    if (detailGenre) detailGenre.textContent = genre;
    if (detailNote) detailNote.textContent = note ? `(${note})` : "";
    if (detailDescription) detailDescription.textContent = description;
    if (detailAge) detailAge.textContent = age;
    if (detailFormat) detailFormat.textContent = format;
    if (detailDuration) detailDuration.textContent = duration;

    if (detailText) detailText.scrollTop = 0;

    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-projects-detail-open");

    requestAnimationFrame(() => {
        updateDetailLayout();

        requestAnimationFrame(updateDetailLayout);
    });
}

function closeDetail() {
    const { detail } = getElements();

    if (!detail) return;

    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    detail.style.removeProperty("--about-projects-detail-text-height");
    document
        .querySelector(".about-projects-detail__text-wrap")
        ?.style.removeProperty("--about-projects-detail-text-height");
    document.body.classList.remove("about-projects-detail-open");
}

function openRequest(projectTitle = "") {
    const { requestPopup, requestProjectInput } = getElements();

    if (!requestPopup) return;

    if (requestProjectInput) {
        requestProjectInput.value = projectTitle || getCurrentDetailProjectTitle();
    }

    requestPopup.classList.add("is-open");
    requestPopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-projects-request-open");
}

function closeRequest(resetForm = false) {
    const { requestPopup, requestForm } = getElements();

    if (!requestPopup) return;

    requestPopup.classList.remove("is-open");
    requestPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-projects-request-open");

    if (resetForm && requestForm) {
        requestForm.reset();
    }
}

function initInteractions() {
    const {
        detail,
        detailClose,
        detailBackButtons,
        detailText,
        requestPopup,
        requestPopupClose,
        requestForm
    } = getElements();

    document.querySelectorAll(".about-projects-card").forEach((card) => {
        if (card.dataset.aboutProjectsDetailReady === "true") return;

        card.addEventListener("click", () => openDetail(card));
        card.dataset.aboutProjectsDetailReady = "true";
    });

    document.querySelectorAll(".about-projects-open-request").forEach((button) => {
        if (button.dataset.aboutProjectsRequestReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openRequest(getCurrentDetailProjectTitle());
        });

        button.dataset.aboutProjectsRequestReady = "true";
    });

    if (detailClose && detailClose.dataset.closeReady !== "true") {
        detailClose.addEventListener("click", closeDetail);
        detailClose.dataset.closeReady = "true";
    }

    detailBackButtons.forEach((button, index) => {
        if (button.dataset.backReady === "true") return;

        if (index === 1) {
            button.setAttribute("aria-label", "Вернуться к списку проектов");
            button.addEventListener("click", closeDetail);
        }

        button.dataset.backReady = "true";
    });

    if (detail && detail.dataset.overlayReady !== "true") {
        detail.addEventListener("click", (e) => {
            if (e.target === detail) closeDetail();
        });

        detail.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        detail.dataset.overlayReady = "true";
    }

    if (detail && detail.dataset.fitResizeReady !== "true") {
        window.addEventListener("resize", () => {
            if (!detail.classList.contains("is-open")) return;

            updateDetailLayout();
        });

        detail.dataset.fitResizeReady = "true";
    }

    if (detailText && detailText.dataset.scrollbarReady !== "true") {
        detailText.addEventListener("scroll", updateDetailTextScrollbar);

        detailText.addEventListener(
            "wheel",
            (e) => {
                const delta = e.deltaY;

                const atTop = detailText.scrollTop <= 0;
                const atBottom =
                    detailText.scrollTop + detailText.clientHeight >=
                    detailText.scrollHeight - 1;

                const canScrollUp = delta < 0 && !atTop;
                const canScrollDown = delta > 0 && !atBottom;

                if (canScrollUp || canScrollDown) {
                    e.stopPropagation();
                    e.preventDefault();

                    detailText.scrollTop += delta;
                    requestAnimationFrame(updateDetailTextScrollbar);
                }
            },
            { passive: false }
        );

        detailText.dataset.scrollbarReady = "true";
    }

    if (requestPopupClose && requestPopupClose.dataset.closeReady !== "true") {
        requestPopupClose.addEventListener("click", () => closeRequest());
        requestPopupClose.dataset.closeReady = "true";
    }

    if (requestForm && requestForm.dataset.formReady !== "true") {
        requestForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeRequest(true);
        });

        requestForm.dataset.formReady = "true";
    }

    if (requestPopup && requestPopup.dataset.overlayReady !== "true") {
        requestPopup.addEventListener("click", (e) => {
            if (e.target === requestPopup) closeRequest();
        });

        requestPopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        requestPopup.dataset.overlayReady = "true";
    }
}

async function loadProjectsContent() {
    const { section } = getElements();

    if (!section || isLoading || isReady) return;

    isLoading = true;

    try {
        const response = await fetch("./projects.html");
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        doc.querySelectorAll(".menu, .settings, script, link, style").forEach((node) => {
            node.remove();
        });

        const cards = Array.from(doc.querySelectorAll(".project-card"));
        const detailNode = doc.querySelector(".project-detail");
        const requestNode = doc.querySelector(".projects-request-popup");

        buildSection(cards, detailNode, requestNode);
        initInteractions();

        isReady = true;
        isLoading = false;

        updateAboutProjectsSection(0);
    } catch (error) {
        console.error("About projects load error:", error);

        section.innerHTML = `
            <div class="about-projects-section__loader">
                Не удалось загрузить проекты
            </div>
        `;

        isLoading = false;
    }
}

function getPreviewBottomShift(stage) {
    if (!stage) return 0;

    const preview = document.querySelector(".about-projects-preview");

    if (!preview) return 0;

    const previewBottomInsideStage = preview.offsetTop + preview.offsetHeight;

    return Math.max(
        0,
        previewBottomInsideStage - window.innerHeight
    );
}

function syncAboutProjectsTitleBackground(bgImg, title) {
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

export function initAboutProjectsSection() {
    if (!document.body.classList.contains("about-page")) return;

    loadProjectsContent();
}

export function updateAboutProjectsSection(globalProgress) {
    if (!document.body.classList.contains("about-page")) return;

    const {
        section,
        bgImg,
        stage,
        titleLayer,
        title
    } = getElements();

    if (!section) return;

    const revealY = mapRange(
        globalProgress,
        ABOUT_PROJECTS_REVEAL_START,
        ABOUT_PROJECTS_START,
        100,
        0
    );

    const localProgress = clamp(
        globalProgress - ABOUT_PROJECTS_START,
        0,
        ABOUT_PROJECTS_MAX
    );

    section.style.transform = `translateY(${revealY}vh)`;

    if (!isReady) {
        updatePageScrollbar(globalProgress);
        return;
    }

    if (stage) {
        const maxStageShift = getPreviewBottomShift(stage);

        const stageY = mapRange(
            localProgress,
            1,
            ABOUT_PROJECTS_MAX,
            0,
            -maxStageShift
        );

        stage.style.transform = `translateY(${stageY}px)`;
    }

    if (bgImg) {
        const bgMove = mapRange(localProgress, 0, ABOUT_PROJECTS_MAX, 0, 120);
        const bgZoom = mapRange(localProgress, 0, ABOUT_PROJECTS_MAX, 1, 1.18);

        bgImg.style.transform = `translateY(${bgMove}px) scale(${bgZoom})`;
    }

    if (titleLayer) {
        const textMove = mapRange(localProgress, 0, 1, 0, 100);
        titleLayer.style.transform = `translateY(${100 - textMove}%)`;
    }

    if (bgImg && title) {
        syncAboutProjectsTitleBackground(bgImg, title);
    }

    updatePageScrollbar(globalProgress);
}
