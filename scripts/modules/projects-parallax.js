import { state } from "./state.js";
import { updatePageScrollbar } from "./page-scrollbar.js";

const PROJECTS_MAX_PROGRESS = 3;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}

function getProjectsElements() {
    return {
        bgImg: document.querySelector(".projects-bg__img"),
        stage: document.querySelector(".projects-stage"),
        paralaxText: document.querySelector(".projects-paralax-text"),
        title: document.querySelector(".projects__title"),
        servicesViewport: document.querySelector(".projects-services-viewport"),
        arrow: document.querySelector(".projects-arrow"),

        detail: document.querySelector(".project-detail"),
        detailImg: document.querySelector(".project-detail__img"),
        detailTitle: document.querySelector(".project-detail__title"),
        detailGenre: document.querySelector(".project-detail__genre"),
        detailNote: document.querySelector(".project-detail__note"),
        detailDescription: document.querySelector(".project-detail__description"),
        detailText: document.querySelector(".project-detail__text"),
        detailScrollbarFill: document.querySelector(".project-detail__scrollbar-fill"),
        detailAge: document.querySelector(".project-detail__age"),
        detailFormat: document.querySelector(".project-detail__format"),
        detailDuration: document.querySelector(".project-detail__duration"),
        detailClose: document.querySelector(".project-detail__close"),

        requestPopup: document.querySelector(".projects-request-popup"),
        requestPopupDialog: document.querySelector(".projects-request-popup__dialog"),
        requestPopupClose: document.querySelector(".projects-request-popup__close"),
        requestForm: document.querySelector(".projects-request-form"),
        requestProjectInput: document.querySelector(".projects-request-form__project")
    };
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

function getTvCardsBottomShift(stage) {
    if (!stage) return 0;

    const tvGrid = document.querySelector(".projects-section--tv .projects-grid");

    if (!tvGrid) return 0;

    const tvGridTopInsideStage = getOffsetTopInside(stage, tvGrid);
    const tvGridBottomInsideStage = tvGridTopInsideStage + tvGrid.offsetHeight;

    const endOffsetFix = 10;

    return Math.max(
        0,
        tvGridBottomInsideStage - window.innerHeight - endOffsetFix
    );
}

function syncProjectsTitleBackground(bgImg, title) {
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

function updateProjectDetailTextScrollbar() {
    const {
        detailText,
        detailScrollbarFill
    } = getProjectsElements();

    if (!detailText || !detailScrollbarFill) return;

    const scrollableHeight = detailText.scrollHeight - detailText.clientHeight;

    if (scrollableHeight <= 0) {
        detailScrollbarFill.style.height = "0%";
        return;
    }

    const progress = detailText.scrollTop / scrollableHeight;
    const fill = Math.max(0, Math.min(100, progress * 100));

    detailScrollbarFill.style.height = `${fill}%`;
}

function initProjectDetailTextScrollbar() {
    const { detailText } = getProjectsElements();

    if (!detailText) return;
    if (detailText.dataset.scrollbarReady === "true") return;

    detailText.addEventListener("scroll", () => {
        updateProjectDetailTextScrollbar();
    });

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

                requestAnimationFrame(() => {
                    updateProjectDetailTextScrollbar();
                });
            }
        },
        { passive: false }
    );

    detailText.dataset.scrollbarReady = "true";
}

function initProjectsServicesHorizontalScroll() {
    const { servicesViewport } = getProjectsElements();

    if (!servicesViewport) return;
    if (servicesViewport.dataset.horizontalScrollReady === "true") return;

    servicesViewport.addEventListener(
        "wheel",
        (e) => {
            const horizontalDelta = Math.abs(e.deltaX);
            const verticalDelta = Math.abs(e.deltaY);

            const isHorizontalScroll = horizontalDelta > verticalDelta;

            if (!isHorizontalScroll) return;

            e.preventDefault();
            e.stopPropagation();

            servicesViewport.scrollLeft += e.deltaX;
        },
        { passive: false }
    );

    servicesViewport.dataset.horizontalScrollReady = "true";
}

function getCurrentDetailProjectTitle() {
    const { detail, detailTitle } = getProjectsElements();

    if (!detail || !detail.classList.contains("is-open") || !detailTitle) {
        return "";
    }

    return detailTitle.textContent.trim();
}

function openProjectDetail(card) {
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
    } = getProjectsElements();

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

    if (detailText) {
        detailText.scrollTop = 0;
    }

    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.classList.add("projects-detail-open");

    requestAnimationFrame(() => {
        updateProjectDetailTextScrollbar();
    });
}

function closeProjectDetail() {
    const { detail } = getProjectsElements();

    if (!detail) return;

    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    document.body.classList.remove("projects-detail-open");
}

function openProjectRequest(projectTitle = "") {
    const {
        requestPopup,
        requestProjectInput
    } = getProjectsElements();

    if (!requestPopup) return;

    const currentTitle = projectTitle || getCurrentDetailProjectTitle();

    if (requestProjectInput) {
        requestProjectInput.value = currentTitle;
    }

    requestPopup.classList.add("is-open");
    requestPopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("projects-request-open");
}

function closeProjectRequest(resetForm = false) {
    const {
        requestPopup,
        requestForm
    } = getProjectsElements();

    if (!requestPopup) return;

    requestPopup.classList.remove("is-open");
    requestPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("projects-request-open");

    if (resetForm && requestForm) {
        requestForm.reset();
    }
}

function initProjectDetailCards() {
    const { detail, detailClose } = getProjectsElements();
    const cards = document.querySelectorAll(".project-card");

    cards.forEach((card) => {
        if (card.dataset.detailReady === "true") return;

        card.addEventListener("click", () => {
            openProjectDetail(card);
        });

        card.dataset.detailReady = "true";
    });

    if (detailClose && detailClose.dataset.closeReady !== "true") {
        detailClose.addEventListener("click", closeProjectDetail);
        detailClose.dataset.closeReady = "true";
    }

    if (detail && detail.dataset.overlayReady !== "true") {
        detail.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        detail.addEventListener("click", (e) => {
            if (e.target === detail) {
                closeProjectDetail();
            }
        });

        detail.dataset.overlayReady = "true";
    }
}

function initProjectRequestPopup() {
    const {
        requestPopup,
        requestPopupDialog,
        requestPopupClose,
        requestForm
    } = getProjectsElements();

    const requestButtons = document.querySelectorAll(".projects-open-request");

    requestButtons.forEach((button) => {
        if (button.dataset.requestReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const projectTitle =
                button.dataset.projectTitle ||
                getCurrentDetailProjectTitle() ||
                "";

            openProjectRequest(projectTitle);
        });

        button.dataset.requestReady = "true";
    });

    if (requestPopupClose && requestPopupClose.dataset.popupCloseReady !== "true") {
        requestPopupClose.addEventListener("click", () => {
            closeProjectRequest();
        });

        requestPopupClose.dataset.popupCloseReady = "true";
    }

    if (requestForm && requestForm.dataset.formReady !== "true") {
        requestForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeProjectRequest(true);
        });

        requestForm.dataset.formReady = "true";
    }

    if (requestPopup && requestPopup.dataset.popupReady !== "true") {
        requestPopup.addEventListener("click", (e) => {
            if (e.target === requestPopup) {
                closeProjectRequest();
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

    if (document.body.dataset.projectEscapeReady !== "true") {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;

            const { requestPopup: popup, detail } = getProjectsElements();

            if (popup && popup.classList.contains("is-open")) {
                closeProjectRequest();
                return;
            }

            if (detail && detail.classList.contains("is-open")) {
                closeProjectDetail();
            }
        });

        document.body.dataset.projectEscapeReady = "true";
    }
}

export function initProjectsParallax() {
    if (!document.body.classList.contains("projects-page")) return;

    state.pageProgressMax = PROJECTS_MAX_PROGRESS;

    const { bgImg, arrow } = getProjectsElements();

    initProjectsServicesHorizontalScroll();
    initProjectDetailCards();
    initProjectRequestPopup();
    initProjectDetailTextScrollbar();

    if (bgImg) {
        if (bgImg.complete) {
            updateProjectsScene(state.progress);
        } else {
            bgImg.addEventListener("load", () => {
                updateProjectsScene(state.progress);
            });
        }
    }

    if (arrow) {
        arrow.addEventListener("click", () => {
            state.targetProgress = clamp(
                Math.ceil(state.targetProgress + 0.1),
                0,
                PROJECTS_MAX_PROGRESS
            );
        });
    }

    updateProjectsScene(state.progress);
}

export function updateProjectsScene(progressValue) {
    if (!document.body.classList.contains("projects-page")) return;

    const p = clamp(progressValue, 0, PROJECTS_MAX_PROGRESS);

    const {
        bgImg,
        stage,
        paralaxText,
        title,
        arrow
    } = getProjectsElements();

    if (stage) {
        const maxStageShift = getTvCardsBottomShift(stage);

        const stageY = mapRange(
            p,
            1,
            PROJECTS_MAX_PROGRESS,
            0,
            -maxStageShift
        );

        stage.style.transform = `translateY(${stageY}px)`;
    }

    if (bgImg) {
        const bgMove = mapRange(p, 0, PROJECTS_MAX_PROGRESS, 0, 120);
        const bgZoom = mapRange(p, 0, PROJECTS_MAX_PROGRESS, 1, 1.18);

        bgImg.style.transform = `translateY(${bgMove}px) scale(${bgZoom})`;
    }

    if (paralaxText) {
        const textMove = mapRange(p, 0, 1, 0, 100);
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
    }

    if (bgImg && title) {
        syncProjectsTitleBackground(bgImg, title);
    }

    if (arrow) {
        arrow.style.opacity = p >= PROJECTS_MAX_PROGRESS - 0.05 ? "0" : "1";
    }

    updatePageScrollbar(p);
}

export function resetProjectsScene() {
    if (!document.body.classList.contains("projects-page")) return;

    state.progress = 0;
    state.targetProgress = 0;

    updateProjectsScene(0);
}