import { state } from "./state.js";

let scrollbar = null;
let scrollbarTrack = null;
let scrollbarFill = null;
let scrollbarSegments = null;

function getSectionsCount() {
    return Math.max(1, Number(state.pageSectionsCount || 1));
}

function getProgressRange() {
    const stops = Array.isArray(state.pageProgressStops)
        ? state.pageProgressStops.map(Number).filter(Number.isFinite)
        : [];

    if (stops.length >= 2) {
        return {
            first: 0,
            last: Math.max(stops[stops.length - 1], 1),
            stops
        };
    }

    return {
        first: 0,
        last: Math.max(1, Number(state.pageProgressMax || 1)),
        stops: []
    };
}

function getNormalizedProgress(progressValue) {
    const { first, last } = getProgressRange();
    const distance = Math.max(last - first, 0.0001);
    const progress = Math.max(first, Math.min(last, progressValue));

    return Math.max(0, Math.min(1, (progress - first) / distance));
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
    const { first, last, stops } = getProgressRange();
    const distance = Math.max(last - first, 0.0001);

    scrollbarSegments.innerHTML = "";

    if (sectionsCount <= 1) return;

    const segmentPositions = stops.length >= 2
        ? stops.slice(1, -1).map((stop) => ((stop - first) / distance) * 100)
        : Array.from(
            { length: sectionsCount - 1 },
            (_, index) => ((index + 1) / sectionsCount) * 100
        );

    segmentPositions.forEach((position) => {
        const segment = document.createElement("span");

        segment.className = "page-scrollbar__segment";
        segment.style.top = `${Math.max(0, Math.min(100, position))}%`;

        scrollbarSegments.appendChild(segment);
    });
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

    scrollbarFill.style.transform = `translateZ(0) scaleY(${Math.min(1, Math.max(0, progress))})`;

    scrollbarSegments
        ?.querySelectorAll(".page-scrollbar__segment")
        .forEach((segment) => {
            const segmentProgress = (parseFloat(segment.style.top) || 0) / 100;

            segment.classList.toggle("is-passed", progress >= segmentProgress);
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