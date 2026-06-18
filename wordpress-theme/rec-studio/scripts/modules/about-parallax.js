import { state } from "./state.js";
import { getSceneElements } from "./dom.js";
import { updatePageScrollbar } from "./page-scrollbar.js";
import {
    positionAboutTextScrollbar,
    updateAboutTextScrollbar
} from "./about-text-scrollbar.js";
import { ABOUT_TITLE_STAGE_END } from "./about-timeline.js";

const ABOUT_INTRO_TITLE_START_SIZE = 0.1;
const ABOUT_INTRO_TITLE_ENTRY_SIZE = 15;
const ABOUT_INTRO_TITLE_MAX_SIZE = 625;
const ABOUT_INTRO_SWITCH_SIZE = 620;
const ABOUT_TITLE_ENTRY_DURATION = 3200;

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

function easeOutCubic(value) {
    const x = clamp(value, 0, 1);
    return 1 - Math.pow(1 - x, 3);
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

function getIntroProgressByTitleSize(targetSize) {
    const linearProgress =
        (targetSize - ABOUT_INTRO_TITLE_ENTRY_SIZE) /
        (ABOUT_INTRO_TITLE_MAX_SIZE - ABOUT_INTRO_TITLE_ENTRY_SIZE);

    return clamp(linearProgress, 0, 1);
}

const ABOUT_INTRO_SWITCH_PROGRESS = getIntroProgressByTitleSize(
    ABOUT_INTRO_SWITCH_SIZE
);

let titleEntryAnimationFrame = null;

function getEntryTitleSize() {
    return mapRange(
        easeOutCubic(state.aboutTitleEntryProgress || 0),
        0,
        1,
        ABOUT_INTRO_TITLE_START_SIZE,
        ABOUT_INTRO_TITLE_ENTRY_SIZE
    );
}

function setIntroTitleSize(size) {
    document.documentElement.style.setProperty(
        "--about-title-intro-size",
        `${size}vw`
    );
}

function setEntryFlickerState(isEnabled) {
    document.body.classList.toggle("about-title-entry-flicker", isEnabled);
}

function stopEntryAnimation() {
    if (titleEntryAnimationFrame) {
        cancelAnimationFrame(titleEntryAnimationFrame);
        titleEntryAnimationFrame = null;
    }
}

function startTitleEntryAnimation() {
    if (
        state.aboutTitleEntryDone ||
        state.aboutTitleScrollIntroComplete ||
        titleEntryAnimationFrame
    ) {
        return;
    }

    const startedAt = performance.now();

    const tick = (now) => {
        const progress = clamp((now - startedAt) / ABOUT_TITLE_ENTRY_DURATION, 0, 1);

        state.aboutTitleEntryProgress = progress;
        setIntroTitleSize(getEntryTitleSize());

        if (progress < 1) {
            titleEntryAnimationFrame = requestAnimationFrame(tick);
            return;
        }

        titleEntryAnimationFrame = null;
        state.aboutTitleEntryDone = true;
        state.aboutTitleEntryProgress = 1;
        setIntroTitleSize(ABOUT_INTRO_TITLE_ENTRY_SIZE);
        setEntryFlickerState(true);
    };

    state.aboutTitleEntryProgress = 0;
    setEntryFlickerState(false);
    setIntroTitleSize(ABOUT_INTRO_TITLE_START_SIZE);
    titleEntryAnimationFrame = requestAnimationFrame(tick);
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
    const isEntryIdle = progressValue <= 0.001 && !state.aboutTitleEntryDone;

    if (!isEntryIdle && !state.aboutTitleEntryDone) {
        stopEntryAnimation();
        state.aboutTitleEntryDone = true;
        state.aboutTitleEntryProgress = 1;
    }

    const titleFontSize = isEntryIdle
        ? getEntryTitleSize()
        : mapRange(
            introProgress,
            0,
            1,
            ABOUT_INTRO_TITLE_ENTRY_SIZE,
            ABOUT_INTRO_TITLE_MAX_SIZE
        );

    const switchProgress = mapRange(
        introProgress,
        ABOUT_INTRO_SWITCH_PROGRESS,
        1,
        0,
        1
    );

    const titleOpacity = mapRange(
        switchProgress,
        0,
        1,
        1,
        0
    );

    const imageOpacity = mapRange(
        switchProgress,
        0,
        1,
        0,
        1
    );

    document.body.classList.add("about-title-stage");
    setEntryFlickerState(progressValue <= 0.001 && state.aboutTitleEntryDone);

    setIntroTitleSize(titleFontSize);

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
        paralaxText.style.transformOrigin = "";
        paralaxText.style.transform = "translateY(0)";
        paralaxText.style.willChange = "";
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
    setEntryFlickerState(false);
    stopEntryAnimation();

    state.aboutTitleEntryDone = true;
    state.aboutTitleEntryProgress = 1;
    state.aboutTitleScrollIntroComplete = true;

    setIntroTitleSize(ABOUT_INTRO_TITLE_ENTRY_SIZE);
    document.documentElement.style.setProperty("--about-title-intro-opacity", 1);
    document.documentElement.style.setProperty("--about-image-opacity", 1);

    syncAboutImageAndTitle(sceneProgress);

    if (paralaxText) {
        const textMove = sceneProgress * 115;
        paralaxText.style.transformOrigin = "";
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
        paralaxText.style.willChange = "transform";
    }

    if (baseImg && title) {
        syncTitleBackgroundWithImage(baseImg, title);
    }

}

export function setInitialImagePosition() {
    if (state.aboutTitleScrollIntroComplete) {
        updateAboutMainScene(Math.max(state.progress, ABOUT_TITLE_STAGE_END));
        return;
    }

    const { baseImg, title, paralaxText } = getSceneElements();

    document.body.classList.add("about-title-stage");
    setEntryFlickerState(false);

    setIntroTitleSize(
        state.aboutTitleEntryDone
            ? ABOUT_INTRO_TITLE_ENTRY_SIZE
            : getEntryTitleSize()
    );
    document.documentElement.style.setProperty("--about-title-intro-opacity", 1);
    document.documentElement.style.setProperty("--about-image-opacity", 0);

    resetIntroTitleBackground(title);

    if (baseImg) {
        baseImg.style.transformOrigin = "center center";
        baseImg.style.transform = "translateY(0px) scale(1)";
    }

    if (paralaxText) {
        paralaxText.style.transformOrigin = "";
        paralaxText.style.transform = "translateY(0)";
        paralaxText.style.willChange = "";
    }

    updatePageScrollbar(state.progress);
    positionAboutTextScrollbar();
    updateAboutTextScrollbar();
}

export function updateScene(p) {
    const progress = state.aboutTitleScrollIntroComplete
        ? clamp(p, ABOUT_TITLE_STAGE_END, 1)
        : clamp(p, 0, 1);

    if (
        state.aboutTitleScrollIntroComplete &&
        (state.progress < ABOUT_TITLE_STAGE_END || state.targetProgress < ABOUT_TITLE_STAGE_END)
    ) {
        state.progress = Math.max(state.progress, ABOUT_TITLE_STAGE_END);
        state.targetProgress = Math.max(state.targetProgress, ABOUT_TITLE_STAGE_END);
    }

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
    startTitleEntryAnimation();

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
