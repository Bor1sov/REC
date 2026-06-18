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

    state.aboutTextScrollbar.appendChild(state.aboutTextScrollbarFill);

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

    const textStyles = window.getComputedStyle(dom.aboutInfoText);
    const scrollbarInset = Math.max(
        10,
        Math.min(44, Number.parseFloat(textStyles.paddingRight) / 2 || 0)
    );
    const textContainerHeight =
        Number.parseFloat(textStyles.height) || textRect.height;
    const scrollbarHeight = textContainerHeight / 2;

    const top = textRect.top - infoRect.top;

    const left = textRect.right - infoRect.left - scrollbarInset;

    state.aboutTextScrollbar.style.top = `${top}px`;
    state.aboutTextScrollbar.style.left = `${left}px`;
    state.aboutTextScrollbar.style.height = `${scrollbarHeight}px`;
}

export function updateAboutTextScrollbar() {
    if (!dom.aboutInfoText || !state.aboutTextScrollbarFill) return;

    const aboutInfo = dom.aboutInfoText.closest(".about-info");
    if (!aboutInfo) return;

    const scrollableHeight =
        dom.aboutInfoText.scrollHeight - dom.aboutInfoText.clientHeight;
    const hasScroll = scrollableHeight > 2;

    aboutInfo.classList.toggle("has-scroll", hasScroll);

    if (!hasScroll) {
        state.aboutTextScrollbarFill.style.height = "0%";
        state.aboutTextScrollbarFill.style.transform = "translateY(0)";
        return;
    }

    const progress = dom.aboutInfoText.scrollTop / scrollableHeight;
    const visibleRatio =
        dom.aboutInfoText.clientHeight / dom.aboutInfoText.scrollHeight;

    const fillHeight = Math.max(14, visibleRatio * 100);
    const maxMove = 100 - fillHeight;

    state.aboutTextScrollbarFill.style.height = `${fillHeight}%`;
    state.aboutTextScrollbarFill.style.transform =
        `translateY(${progress * maxMove}%)`;
}
