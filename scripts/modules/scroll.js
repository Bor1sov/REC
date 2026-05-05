import { state } from "./state.js";
import { dom, isContactsPage } from "./dom.js";
import { setScrollbarScrollingState, updatePageScrollbar } from "./page-scrollbar.js";
import { positionAboutTextScrollbar, updateAboutTextScrollbar } from "./about-text-scrollbar.js";
import { initMenuLogoVisibility } from "./menu-logo.js";

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

function handleVirtualScroll(e) {
    if (isContactsPage) {
        e.preventDefault();
        updatePageScrollbar(0);
        return;
    }

    e.preventDefault();

    showUI();

    const maxProgress = state.pageProgressMax || 1;

    state.targetProgress += e.deltaY * 0.002;
    state.targetProgress = Math.max(
        0,
        Math.min(maxProgress, state.targetProgress)
    );

    setScrollbarScrollingState();
}

export function initScroll() {
    if (dom.aboutInfoText) {
        dom.aboutInfoText.addEventListener(
            "wheel",
            (e) => {
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