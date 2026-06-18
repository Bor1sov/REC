import { state } from "./state.js";

let scrollbar = null;
let scrollbarTrack = null;
let scrollbarFill = null;
let scrollbarSegments = null;

function getSectionsCount() {
    return Math.max(1, Number(state.pageSectionsCount || 1));
}

function getNormalizedProgress(progressValue) {
    const stops = state.pageProgressStops;

    if (!Array.isArray(stops) || stops.length < 2) {
        const maxProgress = Math.max(1, Number(state.pageProgressMax || 1));

        return Math.max(0, Math.min(1, progressValue / maxProgress));
    }

    const firstStop = Number(stops[0]);
    const lastStop = Number(stops[stops.length - 1]);
    const progress = Math.max(firstStop, Math.min(lastStop, progressValue));
    const instantSegments = Array.isArray(state.pageProgressInstantSegments)
        ? state.pageProgressInstantSegments
        : [];

    if (progress <= firstStop) return 0;
    if (progress >= lastStop) return 1;

    for (let index = stops.length - 2; index >= 0; index -= 1) {
        if (
            instantSegments.includes(index) &&
            progress >= Number(stops[index])
        ) {
            return (index + 1) / (stops.length - 1);
        }
    }

    for (let index = 0; index < stops.length - 1; index += 1) {
        const start = Number(stops[index]);
        const end = Number(stops[index + 1]);

        if (progress > end) continue;

        const localProgress = end > start
            ? (progress - start) / (end - start)
            : 0;

        return (index + localProgress) / (stops.length - 1);
    }

    return 1;
}

function getScrollbarElements() {
    scrollbar =
        document.querySelector(".page-scrollbar") ||
        document.querySelector(".scrollbar") ||
        document.querySelector(".menu-scrollbar");

    if (!scrollbar) return;

    scrollbarTrack =
        scrollbar.querySelector(".page-scrollbar__track") ||
        scrollbar.querySelector(".scrollbar__track") ||
        scrollbar;

    scrollbarFill =
        scrollbar.querySelector(".page-scrollbar__fill") ||
        scrollbar.querySelector(".scrollbar__fill") ||
        scrollbar.querySelector(".scrollbar-fill");

    scrollbarSegments = scrollbar.querySelector(".page-scrollbar__segments");

    if (!scrollbarSegments) {
        scrollbarSegments = document.createElement("div");
        scrollbarSegments.className = "page-scrollbar__segments";
        scrollbar.appendChild(scrollbarSegments);
    }
}

function createScrollbarIfMissing() {
    const menu = document.querySelector(".menu");

    if (!menu) return;

    getScrollbarElements();

    if (scrollbar) return;

    scrollbar = document.createElement("div");
    scrollbar.className = "page-scrollbar";

    scrollbarTrack = document.createElement("div");
    scrollbarTrack.className = "page-scrollbar__track";

    scrollbarFill = document.createElement("div");
    scrollbarFill.className = "page-scrollbar__fill";

    scrollbarSegments = document.createElement("div");
    scrollbarSegments.className = "page-scrollbar__segments";

    scrollbarTrack.appendChild(scrollbarFill);
    scrollbar.appendChild(scrollbarTrack);
    scrollbar.appendChild(scrollbarSegments);

    menu.appendChild(scrollbar);
}

function renderSegments() {
    if (!scrollbarSegments) return;

    const sectionsCount = getSectionsCount();

    scrollbarSegments.innerHTML = "";

    if (sectionsCount <= 1) return;

    for (let i = 1; i < sectionsCount; i += 1) {
        const segment = document.createElement("span");

        segment.className = "page-scrollbar__segment";
        segment.style.top = `${(i / sectionsCount) * 100}%`;

        scrollbarSegments.appendChild(segment);
    }
}

export function initPageScrollbar() {
    createScrollbarIfMissing();
    getScrollbarElements();
    renderSegments();
    updatePageScrollbar(state.progress || 0);
}

export function updatePageScrollbar(progressValue = 0) {
    if (!scrollbar || !scrollbarFill || !scrollbarSegments) {
        createScrollbarIfMissing();
        getScrollbarElements();
        renderSegments();
    }

    if (!scrollbarFill) return;

    const progress = getNormalizedProgress(progressValue);

    scrollbarFill.style.height = `${progress * 100}%`;

    const sectionsCount = getSectionsCount();
    const currentSegment = Math.min(
        sectionsCount - 1,
        Math.floor(progress * sectionsCount)
    );

    scrollbarSegments
        ?.querySelectorAll(".page-scrollbar__segment")
        .forEach((segment, index) => {
            segment.classList.toggle("is-passed", index < currentSegment);
        });
}

export function setScrollbarScrollingState(isScrolling = false) {
    if (!scrollbar) {
        createScrollbarIfMissing();
        getScrollbarElements();
        renderSegments();
    }

    if (!scrollbar) return;

    scrollbar.classList.toggle("is-scrolling", Boolean(isScrolling));
}
