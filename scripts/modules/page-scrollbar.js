import { state } from "./state.js";

let scrollbar = null;
let scrollbarTrack = null;
let scrollbarFill = null;
let scrollbarSegments = null;

function getSectionsCount() {
    return Math.max(1, Number(state.pageSectionsCount || 1));
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

    const maxProgress = Math.max(1, Number(state.pageProgressMax || 1));
    const progress = Math.max(0, Math.min(1, progressValue / maxProgress));

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