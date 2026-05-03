import { state } from "./state.js";
import { dom } from "./dom.js";

export function initAboutTextScrollbar() {
    if (!dom.aboutInfoText) return;

    const aboutInfo = dom.aboutInfoText.closest(".about-info");
    if (!aboutInfo) return;

    aboutInfo.style.position = "relative";

    state.aboutTextScrollbar = document.createElement("div");
    state.aboutTextScrollbar.className = "about-text-scrollbar";

    state.aboutTextScrollbarFill = document.createElement("div");
    state.aboutTextScrollbarFill.className = "about-text-scrollbar__fill";

    const arrow = document.createElement("div");
    arrow.className = "about-text-scrollbar__arrow";

    state.aboutTextScrollbar.appendChild(state.aboutTextScrollbarFill);
    state.aboutTextScrollbar.appendChild(arrow);

    aboutInfo.appendChild(state.aboutTextScrollbar);

    positionAboutTextScrollbar();
    updateAboutTextScrollbar();

    dom.aboutInfoText.addEventListener("scroll", updateAboutTextScrollbar);

    window.addEventListener("resize", () => {
        positionAboutTextScrollbar();
        updateAboutTextScrollbar();
    });
}

export function positionAboutTextScrollbar() {
    if (!dom.aboutInfoText || !state.aboutTextScrollbar) return;

    const aboutInfo = dom.aboutInfoText.closest(".about-info");
    if (!aboutInfo) return;

    const textRect = dom.aboutInfoText.getBoundingClientRect();
    const infoRect = aboutInfo.getBoundingClientRect();

    const scrollbarHeightRatio = 0.6;
    const scrollbarGap = 85;
    const scrollbarOffsetY = -60;

    const top =
        textRect.top -
        infoRect.top +
        textRect.height * ((1 - scrollbarHeightRatio) / 2) +
        scrollbarOffsetY;

    const left = textRect.right - infoRect.left + scrollbarGap;

    state.aboutTextScrollbar.style.top = `${top}px`;
    state.aboutTextScrollbar.style.left = `${left}px`;
    state.aboutTextScrollbar.style.height = `${textRect.height * scrollbarHeightRatio}px`;
}

export function updateAboutTextScrollbar() {
    if (!dom.aboutInfoText || !state.aboutTextScrollbarFill) return;

    const maxScroll = dom.aboutInfoText.scrollHeight - dom.aboutInfoText.clientHeight;

    if (maxScroll <= 0) {
        state.aboutTextScrollbarFill.style.height = "0%";
        return;
    }

    const textProgress = dom.aboutInfoText.scrollTop / maxScroll;
    const fill = Math.max(0, Math.min(100, textProgress * 100));

    state.aboutTextScrollbarFill.style.height = `${fill}%`;
}