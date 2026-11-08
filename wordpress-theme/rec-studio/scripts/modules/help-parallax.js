import { state } from "./state.js";
import { updatePageScrollbar } from "./page-scrollbar.js";
import { getAssetUrl, getPageUrl, getLabel, escapeHtml, setDownloadLink } from "./runtime.js";
import { bindEnquiryForm, clearEnquiryFeedback } from "./forms.js";

const HELP_MAX_PROGRESS = 2.25;
const HELP_CARDS_IDLE_START = 1.18;

const detailGroups = window.recTheme?.serviceGroups || {};

let currentDetailGroupKey = "support";
let detailWheelLocked = false;

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
        detailClose: document.querySelector(".help-detail__back"),
        detailBreadcrumbHome: document.querySelector(".help-detail__breadcrumbs-home"),
        detailBreadcrumbCurrent: document.querySelector(".help-detail__breadcrumbs-current"),
        detailNavList: document.querySelector(".help-detail__nav-list"),
        detailText: document.querySelector(".help-detail__text"),
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
    return detailGroups[currentDetailGroupKey] || Object.values(detailGroups)[0] || { title: "", items: [] };
}

function getCurrentDetailIndex() {
    const activeButton = document.querySelector(".help-detail__nav-item.is-active");

    return Number(activeButton?.dataset.helpDetailIndex || 0);
}

function switchDetailGroup(direction = 1, targetIndex = 0) {
    const groupKeys = Object.keys(detailGroups);
    if (!groupKeys.length) return;
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

    if (!group.items.length) return;

    const nextIndex = (currentIndex + direction + group.items.length) % group.items.length;
    renderDetail(nextIndex);
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
    return Math.max(
        0,
        sectionBottomInsideStage - window.innerHeight
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
        detailBreadcrumbCurrent.title = "Переключить набор услуг";
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
                    ${escapeHtml(item.title)}
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
        detailNavList,
        detailText
    } = getHelpElements();

    const group = getCurrentGroup();
    const item = group.items[index];

    if (!item) return;
    setDownloadLink(".help-detail__download-link", item.presentation);

    if (detailNavList) {
        detailNavList.querySelectorAll(".help-detail__nav-item").forEach((button, buttonIndex) => {
            button.classList.toggle("is-active", buttonIndex === index);
        });
    }

    if (detailDescription) {
        detailDescription.innerHTML = item.descriptionHtml || "";
    }

    if (detailText) {
        detailText.scrollTop = 0;
    }

    if (detailServicesList) {
        detailServicesList.innerHTML = item.services
            .map((service) => `<li>${escapeHtml(service)}</li>`)
            .join("");
    }

    if (detailImg) {
        detailImg.src = getAssetUrl(item.image);
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

function goToHelpPage() {
    const helpUrl = getPageUrl("help");

    if (new URL(helpUrl, window.location.href).href === window.location.href) {
        closeHelpDetail();
        return;
    }

    window.location.href = helpUrl;
}

function getCurrentDetailServiceTitle() {
    const activeButton = document.querySelector(".help-detail__nav-item.is-active");

    if (!activeButton) return getCurrentGroup().title;

    return activeButton.textContent.trim();
}

function openHelpRequest(serviceTitle = "") {
    clearEnquiryFeedback(document.querySelector(".help-request-popup"));
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
    clearEnquiryFeedback(document.querySelector(".help-price-popup"));
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

function ensureHelpCardDetailButtons(root = document) {
    root.querySelectorAll(".help-large-card").forEach((card) => {
        if (card.querySelector(".help-card-button")) return;

        const button = document.createElement("button");

        button.className = "help-card-button";
        button.type = "button";
        button.textContent = getLabel("more", "Подробнее");

        card.appendChild(button);
    });
}
function initHelpDetailCards() {
    const {
        detail,
        detailClose,
        detailArrow,
        detailBreadcrumbHome,
        detailBreadcrumbCurrent
    } = getHelpElements();
    ensureHelpCardDetailButtons();

    document.querySelectorAll(".help-card-button").forEach((button) => {
        if (button.dataset.helpDetailReady === "true") return;

        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            openHelpDetail(button.closest(".help-large-card"));
        });

        button.dataset.helpDetailReady = "true";
    });

    if (detailArrow && detailArrow.dataset.arrowReady !== "true") {
        detailArrow.addEventListener("click", () => {
            stepDetail(1);
        });

        detailArrow.dataset.arrowReady = "true";
    }

    if (
        detailBreadcrumbHome &&
        detailBreadcrumbHome.dataset.homeReady !== "true"
    ) {
        detailBreadcrumbHome.addEventListener("click", () => {
            goToHelpPage();
        });

        detailBreadcrumbHome.dataset.homeReady = "true";
    }

    if (
        detailBreadcrumbCurrent &&
        detailBreadcrumbCurrent.dataset.groupSwitchReady !== "true"
    ) {
        detailBreadcrumbCurrent.addEventListener("click", () => {
            switchDetailGroup(1, 0);
        });

        detailBreadcrumbCurrent.dataset.groupSwitchReady = "true";
    }

    if (detailClose && detailClose.dataset.closeReady !== "true") {
        detailClose.addEventListener("click", closeHelpDetail);
        detailClose.dataset.closeReady = "true";
    }

    if (detail && detail.dataset.overlayReady !== "true") {
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
        bindEnquiryForm(priceForm, () => ({ service_key: getCurrentGroup().items[getCurrentDetailIndex()]?.key }));

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
        bindEnquiryForm(requestForm, () => ({ service_key: getCurrentGroup().items[getCurrentDetailIndex()]?.key }));

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
            HELP_CARDS_IDLE_START,
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
