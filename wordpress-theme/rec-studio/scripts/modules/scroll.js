import { state } from "./state.js";
import { dom, isContactsPage } from "./dom.js";
import { setScrollbarScrollingState, updatePageScrollbar } from "./page-scrollbar.js";
import { initMenuLogoVisibility } from "./menu-logo.js";
import { ABOUT_TITLE_STAGE_END } from "./about-timeline.js";

let positionAboutTextScrollbar = () => {};
let updateAboutTextScrollbar = () => {};

const WHEEL_MIN_DELTA = 4;
const WHEEL_SEGMENT_STEPS = 32;
const EPSILON = 0.0001;

export function setAboutTextScrollbarHandlers(handlers = {}) {
    positionAboutTextScrollbar = handlers.positionAboutTextScrollbar || positionAboutTextScrollbar;
    updateAboutTextScrollbar = handlers.updateAboutTextScrollbar || updateAboutTextScrollbar;
}

export function showUI() {
    if (!dom.main) return;

    if (!state.isUIVisible) {
        dom.main.classList.remove("ui-hidden");
        dom.main.classList.add("ui-visible");
        state.isUIVisible = true;
    }

    if (!state.isLogoMovingToMenu) {
        initMenuLogoVisibility();
    }
}

function getProgressStops(minProgress, maxProgress) {
    const sourceStops = Array.isArray(state.pageProgressStops)
        ? state.pageProgressStops
        : null;

    const stops = sourceStops && sourceStops.length > 1
        ? sourceStops
        : [minProgress, Math.min(1, maxProgress), maxProgress];

    return [...new Set(
        stops
            .map((value) => Math.max(minProgress, Math.min(maxProgress, value)))
            .sort((a, b) => a - b)
    )].filter((value, index, array) => {
        return index === 0 || Math.abs(value - array[index - 1]) > EPSILON;
    });
}

function getNextTargetProgress(direction, minProgress, maxProgress) {
    const stops = getProgressStops(minProgress, maxProgress);
    const current = Math.max(
        minProgress,
        Math.min(maxProgress, state.targetProgress)
    );

    if (stops.length < 2) {
        return direction > 0 ? maxProgress : minProgress;
    }

    if (direction > 0) {
        const nextStop = stops.find((stop) => stop > current + EPSILON) ?? maxProgress;
        const nextIndex = stops.indexOf(nextStop);
        const prevStop = nextIndex > 0 ? stops[nextIndex - 1] : minProgress;
        const step = (nextStop - prevStop) / WHEEL_SEGMENT_STEPS;

        return Math.min(nextStop, current + step);
    }

    const prevStop = [...stops]
        .reverse()
        .find((stop) => stop < current - EPSILON) ?? minProgress;
    const prevIndex = stops.indexOf(prevStop);
    const nextStop = prevIndex >= 0 && prevIndex < stops.length - 1
        ? stops[prevIndex + 1]
        : maxProgress;
    const step = (nextStop - prevStop) / WHEEL_SEGMENT_STEPS;

    return Math.max(prevStop, current - step);
}

function handleVirtualScroll(e) {
    if (isContactsPage) {
        e.preventDefault();
        updatePageScrollbar(0);
        return;
    }

    e.preventDefault();

    showUI();

    const isAboutTitleStage =
        document.body.classList.contains("about-page") &&
        !state.aboutTitleScrollIntroComplete;

    if (isAboutTitleStage) {
        return;
    }

    const maxProgress = state.pageProgressMax || 1;
    const minProgress =
        document.body.classList.contains("about-page") &&
        state.aboutTitleScrollIntroComplete
            ? ABOUT_TITLE_STAGE_END
            : 0;

    if (Math.abs(e.deltaY) < WHEEL_MIN_DELTA) {
        return;
    }

    state.targetProgress = getNextTargetProgress(
        Math.sign(e.deltaY),
        minProgress,
        maxProgress
    );

    setScrollbarScrollingState();
}

export function initScroll() {
    if (dom.aboutInfoText) {
        dom.aboutInfoText.addEventListener(
            "wheel",
            (e) => {
                const overflowY = window.getComputedStyle(dom.aboutInfoText).overflowY;
                const hasOwnScroll =
                    (overflowY === "auto" || overflowY === "scroll") &&
                    dom.aboutInfoText.scrollHeight > dom.aboutInfoText.clientHeight + 1;

                if (!hasOwnScroll) {
                    return;
                }

                const delta = e.deltaY;

                const atTop = dom.aboutInfoText.scrollTop <= 0;
                const atBottom =
                    dom.aboutInfoText.scrollTop + dom.aboutInfoText.clientHeight >=
                    dom.aboutInfoText.scrollHeight - 1;

                const canScrollUp = delta < 0 && !atTop;
                const canScrollDown = delta > 0 && !atBottom;

                if (canScrollUp || canScrollDown) {
                    e.stopPropagation();
                    e.preventDefault();

                    dom.aboutInfoText.scrollTop += delta;

                    requestAnimationFrame(() => {
                        positionAboutTextScrollbar();
                        updateAboutTextScrollbar();
                    });
                }
            },
            { passive: false }
        );
    }

    if (dom.contentPage) {
        dom.contentPage.addEventListener("wheel", handleVirtualScroll, {
            passive: false
        });
    } else {
        window.addEventListener("wheel", handleVirtualScroll, {
            passive: false
        });
    }
}
