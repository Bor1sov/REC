import { state } from "./state.js";
import { getSceneElements } from "./dom.js";
import { updatePageScrollbar } from "./page-scrollbar.js";
import { positionAboutTextScrollbar, updateAboutTextScrollbar } from "./about-text-scrollbar.js";

export function syncTitleBackgroundWithImage(baseImg, title) {
    if (!baseImg || !title) return;

    const imgRect = baseImg.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    const naturalWidth = baseImg.naturalWidth || imgRect.width;
    const naturalHeight = baseImg.naturalHeight || imgRect.height;

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

export function syncAboutImageAndTitle(progressValue) {
    const { baseImg, title } = getSceneElements();

    const zoom = 1 + progressValue * 0.4;
    const move = progressValue * 80;

    if (baseImg) {
        baseImg.style.transformOrigin = "center center";
        baseImg.style.transform = `translateY(${move}px) scale(${zoom})`;
    }

    if (baseImg && title) {
        syncTitleBackgroundWithImage(baseImg, title);
    }
}

export function setInitialImagePosition() {
    const { baseImg, title } = getSceneElements();

    if (baseImg) {
        baseImg.style.transformOrigin = "center center";
        baseImg.style.transform = "translateY(0px) scale(1)";
    }

    if (baseImg && title) {
        syncTitleBackgroundWithImage(baseImg, title);
    }

    updatePageScrollbar(state.progress);
    positionAboutTextScrollbar();
    updateAboutTextScrollbar();
}

export function updateScene(p) {
    const { paralaxText } = getSceneElements();

    syncAboutImageAndTitle(p);

    if (paralaxText) {
        const textMove = p * 115;
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
    }

    updatePageScrollbar(p);
    positionAboutTextScrollbar();
    updateAboutTextScrollbar();
}

export function initAboutParallax() {
    setInitialImagePosition();

    const aboutImage = document.querySelector(".about__img");

    if (aboutImage) {
        if (aboutImage.complete) {
            setInitialImagePosition();
        } else {
            aboutImage.addEventListener("load", () => {
                setInitialImagePosition();
                updateScene(state.progress);
            });
        }
    }
}