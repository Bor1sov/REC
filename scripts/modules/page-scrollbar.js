import { state } from "./state.js";
import { dom, isContactsPage } from "./dom.js";

export function initPageScrollbar() {
    if (!dom.contentPage) return;

    state.pageScrollbar = document.createElement("div");
    state.pageScrollbar.className = "page-scrollbar";

    state.pageScrollbarThumb = document.createElement("div");
    state.pageScrollbarThumb.className = "page-scrollbar__thumb";

    state.pageScrollbar.appendChild(state.pageScrollbarThumb);
    document.body.appendChild(state.pageScrollbar);

    updatePageScrollbar(state.progress);
}

export function updatePageScrollbar(p) {
    if (!state.pageScrollbar || !state.pageScrollbarThumb) return;

    if (isContactsPage) {
        state.pageScrollbarThumb.style.height = "0%";
        return;
    }

    const maxProgress = state.pageProgressMax || 1;
    const normalizedProgress = p / maxProgress;
    const fill = Math.max(0, Math.min(100, normalizedProgress * 100));

    state.pageScrollbarThumb.style.height = `${fill}%`;
}

export function setScrollbarScrollingState() {
    if (!state.pageScrollbar) return;

    if (isContactsPage) {
        state.pageScrollbar.classList.remove("is-scrolling");
        return;
    }

    state.pageScrollbar.classList.add("is-scrolling");

    clearTimeout(state.scrollbarTimer);

    state.scrollbarTimer = setTimeout(() => {
        state.pageScrollbar.classList.remove("is-scrolling");
    }, 350);
}