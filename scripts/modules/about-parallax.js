import { state } from "./state.js";
import { getSceneElements } from "./dom.js";
import { updatePageScrollbar } from "./page-scrollbar.js";
import {
    positionAboutTextScrollbar,
    updateAboutTextScrollbar
} from "./about-text-scrollbar.js";

const ABOUT_TITLE_STAGE_END = 0.42;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}

function smoothstep(value) {
    const x = clamp(value, 0, 1);
    return x * x * (3 - 2 * x);
}

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

function resetIntroTitleBackground(title) {
    if (!title) return;

    title.style.backgroundSize = "";
    title.style.backgroundPosition = "";
    title.style.backgroundRepeat = "";
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

function updateAboutTitleIntro(progressValue) {
    const { baseImg, title, paralaxText } = getSceneElements();

    const introProgress = smoothstep(progressValue / ABOUT_TITLE_STAGE_END);

    /*
        Буквы приближаются через font-size.
        Изображение внутри букв не трогаем вообще:
        не пересчитываем background-position/background-size в JS.
    */
    const titleFontSize = mapRange(introProgress, 0, 1, 18, 105);
    const titleOpacity = mapRange(introProgress, 0.72, 0.96, 1, 0);
    const imageOpacity = mapRange(introProgress, 0.72, 1, 0, 1);

    document.body.classList.add("about-title-stage");

    document.documentElement.style.setProperty(
        "--about-title-intro-size",
        `${titleFontSize}vw`
    );

    document.documentElement.style.setProperty(
        "--about-title-intro-opacity",
        titleOpacity
    );

    document.documentElement.style.setProperty(
        "--about-image-opacity",
        imageOpacity
    );

    resetIntroTitleBackground(title);

    if (paralaxText) {
        paralaxText.style.transform = "translateY(0)";
    }

    if (baseImg) {
        baseImg.style.transformOrigin = "center center";
        baseImg.style.transform = "translateY(0px) scale(1)";
    }
}

function updateAboutMainScene(progressValue) {
    const { baseImg, title, paralaxText } = getSceneElements();

    const sceneProgress = mapRange(
        progressValue,
        ABOUT_TITLE_STAGE_END,
        1,
        0,
        1
    );

    document.body.classList.remove("about-title-stage");

    document.documentElement.style.setProperty("--about-title-intro-size", "18vw");
    document.documentElement.style.setProperty("--about-title-intro-opacity", 1);
    document.documentElement.style.setProperty("--about-image-opacity", 1);

    syncAboutImageAndTitle(sceneProgress);

    if (paralaxText) {
        const textMove = sceneProgress * 115;
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
    }

    if (baseImg && title) {
        syncTitleBackgroundWithImage(baseImg, title);
    }

    const aboutText = document.querySelector(".about-info-text");

    if (aboutText) {
        const textScrollStart = 0.48;
        const textScrollEnd = 1;
        const maxTextScroll = aboutText.scrollHeight - aboutText.clientHeight;

        if (maxTextScroll > 0) {
            const textProgress = smoothstep(
                (sceneProgress - textScrollStart) /
                    (textScrollEnd - textScrollStart)
            );

            aboutText.scrollTop = maxTextScroll * textProgress;
        }
    }
}

export function setInitialImagePosition() {
    const { baseImg, title, paralaxText } = getSceneElements();

    document.body.classList.add("about-title-stage");

    document.documentElement.style.setProperty("--about-title-intro-size", "18vw");
    document.documentElement.style.setProperty("--about-title-intro-opacity", 1);
    document.documentElement.style.setProperty("--about-image-opacity", 0);

    resetIntroTitleBackground(title);

    if (baseImg) {
        baseImg.style.transformOrigin = "center center";
        baseImg.style.transform = "translateY(0px) scale(1)";
    }

    if (paralaxText) {
        paralaxText.style.transform = "translateY(0)";
    }

    updatePageScrollbar(state.progress);
    positionAboutTextScrollbar();
    updateAboutTextScrollbar();
}

export function updateScene(p) {
    const progress = clamp(p, 0, 1);

    if (document.body.classList.contains("about-page")) {
        if (progress < ABOUT_TITLE_STAGE_END) {
            updateAboutTitleIntro(progress);
        } else {
            updateAboutMainScene(progress);
        }
    } else {
        syncAboutImageAndTitle(progress);

        const { paralaxText } = getSceneElements();

        if (paralaxText) {
            const textMove = progress * 115;
            paralaxText.style.transform = `translateY(${100 - textMove}%)`;
        }
    }

    updatePageScrollbar(progress);
    positionAboutTextScrollbar();
    updateAboutTextScrollbar();
}

export function initAboutParallax() {
    if (!document.body.classList.contains("about-page")) return;

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