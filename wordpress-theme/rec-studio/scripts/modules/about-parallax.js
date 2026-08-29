import { state } from "./state.js";
import { dom, getSceneElements } from "./dom.js";
import { updatePageScrollbar } from "./page-scrollbar.js";
import {
    positionAboutTextScrollbar,
    updateAboutTextScrollbar
} from "./about-text-scrollbar.js";
import { ABOUT_TITLE_STAGE_END } from "./about-timeline.js";
import { getAssetUrl } from "./runtime.js";

const ABOUT_INTRO_TITLE_START_SIZE = 0.1;
const ABOUT_INTRO_TITLE_ENTRY_SIZE = 15;
const ABOUT_INTRO_TITLE_MAX_SIZE = 625;

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

const ABOUT_PARALAX_TEXT_MOVE_PERCENT = 285;
const ABOUT_PARALAX_REFERENCE_HEIGHT = 1200;
const ABOUT_INTRO_AMBIENT_SRC = "assets/small-group-of-people-in-the-hospital-talking.wav";
const ABOUT_INTRO_AMBIENT_VOLUME = 0.45;
const ABOUT_INTRO_AMBIENT_FADE_DISTANCE = 220;
const ABOUT_INTRO_AMBIENT_START_DELAY = 1000;

let aboutIntroAmbientAudio = null;
let aboutIntroAmbientStopped = false;
let aboutIntroAmbientRetryBound = false;
let aboutIntroAmbientUnlockBound = false;
let aboutIntroAmbientSoundListenerBound = false;
let aboutIntroAmbientStartAllowedAt = 0;
let aboutIntroAmbientStartTimer = null;
let aboutIntroAmbientPageShowBound = false;
let aboutIntroAmbientRevealed = false;
let aboutIntroAmbientRevealRequested = false;
let aboutIntroAmbientRevealRetryTimer = null;
let aboutIntroAmbientRevealRetryCount = 0;

function getAboutParalaxTextMovePercent() {
    if (window.innerWidth < 1600 || window.innerHeight >= ABOUT_PARALAX_REFERENCE_HEIGHT) {
        return ABOUT_PARALAX_TEXT_MOVE_PERCENT;
    }

    return ABOUT_PARALAX_TEXT_MOVE_PERCENT *
        (ABOUT_PARALAX_REFERENCE_HEIGHT / Math.max(window.innerHeight, 1));
}

function getAboutTitleTopOffset() {
    return window.innerHeight < 1150 ? -window.innerHeight * 0.08 : 0;
}

function getAboutTextReachTopProgress() {
    const { paralaxText } = getSceneElements();
    const textHeight = Math.max(
        1,
        paralaxText?.offsetHeight ||
            paralaxText?.getBoundingClientRect().height ||
            window.innerHeight
    );
    const untransformedTop = window.innerHeight - textHeight;
    const targetTranslatePercent = (-untransformedTop / textHeight) * 100;
    const textMovePercent = 100 - targetTranslatePercent;

    return clamp(textMovePercent / getAboutParalaxTextMovePercent(), 0, 1);
}

function getAboutIntroAmbientAudio() {
    if (aboutIntroAmbientAudio) return aboutIntroAmbientAudio;
    if (!document.body) return null;

    aboutIntroAmbientAudio = document.createElement("audio");
    aboutIntroAmbientAudio.src = getAssetUrl(ABOUT_INTRO_AMBIENT_SRC);
    aboutIntroAmbientAudio.preload = "auto";
    aboutIntroAmbientAudio.loop = true;
    aboutIntroAmbientAudio.volume = ABOUT_INTRO_AMBIENT_VOLUME;
    aboutIntroAmbientAudio.muted = true;
    aboutIntroAmbientAudio.dataset.recStudioOriginalMuted = "false";
    aboutIntroAmbientAudio.dataset.recStudioSoundManaged = "false";
    aboutIntroAmbientAudio.setAttribute("aria-hidden", "true");
    aboutIntroAmbientAudio.autoplay = true;
    aboutIntroAmbientAudio.playsInline = true;
    aboutIntroAmbientAudio.style.position = "fixed";
    aboutIntroAmbientAudio.style.left = "-9999px";
    aboutIntroAmbientAudio.style.width = "1px";
    aboutIntroAmbientAudio.style.height = "1px";
    aboutIntroAmbientAudio.style.opacity = "0";
    aboutIntroAmbientAudio.style.pointerEvents = "none";

    document.body.appendChild(aboutIntroAmbientAudio);

    return aboutIntroAmbientAudio;
}

function clearAboutIntroAmbientUnlock() {
    if (!aboutIntroAmbientUnlockBound) return;

    window.removeEventListener("pointerdown", handleAboutIntroAmbientUnlock, true);
    window.removeEventListener("mousedown", handleAboutIntroAmbientUnlock, true);
    window.removeEventListener("click", handleAboutIntroAmbientUnlock, true);
    window.removeEventListener("touchstart", handleAboutIntroAmbientUnlock, true);
    window.removeEventListener("touchend", handleAboutIntroAmbientUnlock, true);
    window.removeEventListener("keydown", handleAboutIntroAmbientUnlock, true);
    window.removeEventListener("wheel", handleAboutIntroAmbientUnlock, true);
    aboutIntroAmbientUnlockBound = false;
}

function isAboutIntroAmbientVolumeButtonEvent(event) {
    const target = event?.target;

    return target instanceof Element && Boolean(
        target.closest(".settings__valume-btn")
    );
}

function holdVolumeButtonForAmbientUnlock(event) {
    if (!isAboutIntroAmbientVolumeButtonEvent(event) || !state.isSoundEnabled) return;

    event.preventDefault();
    event.stopImmediatePropagation();
}
function handleAboutIntroAmbientUnlock(event) {
    if (
        aboutIntroAmbientStopped ||
        !state.isSoundEnabled ||
        !document.body.classList.contains("about-page")
    ) {
        clearAboutIntroAmbientUnlock();
        return;
    }

    const audio = getAboutIntroAmbientAudio();
    if (!audio) return;

    holdVolumeButtonForAmbientUnlock(event);
    audio.muted = false;
    audio.play()
        .then(() => {
            clearAboutIntroAmbientUnlock();
            clearAboutIntroAmbientRetry();
        })
        .catch(queueAboutIntroAmbientRetry);
}

function bindAboutIntroAmbientUnlock() { }

function clearAboutIntroAmbientRetry() {
    if (!aboutIntroAmbientRetryBound) return;

    window.removeEventListener("pointerdown", retryAboutIntroAmbient, true);
    window.removeEventListener("click", retryAboutIntroAmbient, true);
    window.removeEventListener("touchstart", retryAboutIntroAmbient, true);
    window.removeEventListener("wheel", retryAboutIntroAmbient, true);
    window.removeEventListener("keydown", retryAboutIntroAmbient, true);
    aboutIntroAmbientRetryBound = false;
}

function clearAboutIntroAmbientStartTimer() {
    if (!aboutIntroAmbientStartTimer) return;

    window.clearTimeout(aboutIntroAmbientStartTimer);
    aboutIntroAmbientStartTimer = null;
}

function clearAboutIntroAmbientRevealRetry() {
    if (!aboutIntroAmbientRevealRetryTimer) return;

    window.clearTimeout(aboutIntroAmbientRevealRetryTimer);
    aboutIntroAmbientRevealRetryTimer = null;
}

function scheduleAboutIntroAmbientRevealRetry() {
    if (aboutIntroAmbientRevealed || aboutIntroAmbientRevealRetryCount >= 20) return;

    clearAboutIntroAmbientRevealRetry();
    aboutIntroAmbientRevealRetryCount += 1;
    aboutIntroAmbientRevealRetryTimer = window.setTimeout(
        revealAboutIntroAmbientAudio,
        250
    );
}

function revealAboutIntroAmbientAudio() {
    aboutIntroAmbientRevealRequested = true;

    if (
        aboutIntroAmbientStopped ||
        !state.isSoundEnabled ||
        !document.body.classList.contains("about-page")
    ) {
        return;
    }

    const audio = getAboutIntroAmbientAudio();
    if (!audio) {
        scheduleAboutIntroAmbientRevealRetry();
        return;
    }

    audio.volume = ABOUT_INTRO_AMBIENT_VOLUME;

    if (audio.paused) {
        audio.muted = true;
        audio.play()
            .then(() => {
                audio.muted = false;
                aboutIntroAmbientRevealed = true;
                clearAboutIntroAmbientRevealRetry();
                completeAboutIntroAmbientPlay();
            })
            .catch(scheduleAboutIntroAmbientRevealRetry);
        return;
    }

    audio.muted = false;
    aboutIntroAmbientRevealed = true;
    clearAboutIntroAmbientRevealRetry();
    completeAboutIntroAmbientPlay();
}

function finishAboutIntroAmbientStartDelay() {
    aboutIntroAmbientStartTimer = null;
    aboutIntroAmbientStartAllowedAt = 0;
    revealAboutIntroAmbientAudio();
}

function startAboutIntroAmbientStartTimer(delay = ABOUT_INTRO_AMBIENT_START_DELAY) {
    clearAboutIntroAmbientStartTimer();

    aboutIntroAmbientStartAllowedAt = performance.now() + delay;
    primeAboutIntroAmbientAutoplay();
    aboutIntroAmbientStartTimer = window.setTimeout(
        finishAboutIntroAmbientStartDelay,
        delay
    );
}

function scheduleAboutIntroAmbientStart(delay = ABOUT_INTRO_AMBIENT_START_DELAY) {
    clearAboutIntroAmbientStartTimer();
    aboutIntroAmbientStartAllowedAt = Number.POSITIVE_INFINITY;

    if (document.readyState === "complete") {
        startAboutIntroAmbientStartTimer(delay);
        return;
    }

    window.addEventListener(
        "load",
        () => startAboutIntroAmbientStartTimer(delay),
        { once: true }
    );
}

function shouldDelayAboutIntroAmbientStart() {
    if (!aboutIntroAmbientStartAllowedAt) return false;
    if (!Number.isFinite(aboutIntroAmbientStartAllowedAt)) return true;

    const delay = aboutIntroAmbientStartAllowedAt - performance.now();

    if (delay <= 0) {
        aboutIntroAmbientStartAllowedAt = 0;
        clearAboutIntroAmbientStartTimer();
        return false;
    }

    if (!aboutIntroAmbientStartTimer) {
        aboutIntroAmbientStartTimer = window.setTimeout(
            finishAboutIntroAmbientStartDelay,
            delay
        );
    }

    return true;
}
function retryAboutIntroAmbient() { }

function queueAboutIntroAmbientRetry() { }

function setAboutIntroAmbientVolume(volume = ABOUT_INTRO_AMBIENT_VOLUME) {
    const audio = getAboutIntroAmbientAudio();
    if (!audio) return;

    audio.volume = clamp(volume, 0, ABOUT_INTRO_AMBIENT_VOLUME);
}

function primeAboutIntroAmbientAutoplay() {
    if (
        aboutIntroAmbientStopped ||
        !state.isSoundEnabled ||
        !document.body.classList.contains("about-page")
    ) {
        return;
    }

    const audio = getAboutIntroAmbientAudio();
    if (!audio || !audio.paused) return;

    audio.muted = true;
    audio.play().catch(() => {});
}
function completeAboutIntroAmbientPlay() {
    clearAboutIntroAmbientUnlock();
    clearAboutIntroAmbientRetry();
}

function playAboutIntroAmbientMutedFallback() {
    if (
        aboutIntroAmbientStopped ||
        !state.isSoundEnabled ||
        !document.body.classList.contains("about-page")
    ) {
        return;
    }

    const audio = getAboutIntroAmbientAudio();
    if (!audio) return;

    audio.muted = true;
    audio.play()
        .then(() => {
            if (
                aboutIntroAmbientStopped ||
                !state.isSoundEnabled ||
                !document.body.classList.contains("about-page")
            ) {
                audio.pause();
                return;
            }

            audio.muted = false;
            completeAboutIntroAmbientPlay();
        })
        .catch(queueAboutIntroAmbientRetry);
}
function playAboutIntroAmbient() {
    if (
        aboutIntroAmbientStopped ||
        !state.isSoundEnabled ||
        !document.body.classList.contains("about-page")
    ) {
        return;
    }

    if (!aboutIntroAmbientRevealed) {
        if (aboutIntroAmbientRevealRequested) {
            revealAboutIntroAmbientAudio();
        }
        return;
    }

    if (shouldDelayAboutIntroAmbientStart()) return;

    const audio = getAboutIntroAmbientAudio();
    if (!audio) return;

    if (!audio.paused) {
        audio.muted = false;
        return;
    }

    audio.muted = false;
    audio.play()
        .then(completeAboutIntroAmbientPlay)
        .catch(() => {});
}

function pauseAboutIntroAmbient() {
    clearAboutIntroAmbientStartTimer();
    clearAboutIntroAmbientRevealRetry();
    clearAboutIntroAmbientUnlock();
    clearAboutIntroAmbientRetry();

    if (!aboutIntroAmbientAudio) return;

    aboutIntroAmbientAudio.pause();
}

function stopAboutIntroAmbient() {
    aboutIntroAmbientStopped = true;
    aboutIntroAmbientRevealed = false;
    aboutIntroAmbientRevealRequested = false;
    aboutIntroAmbientRevealRetryCount = 0;
    clearAboutIntroAmbientRevealRetry();
    clearAboutIntroAmbientStartTimer();
    aboutIntroAmbientStartAllowedAt = 0;
    clearAboutIntroAmbientUnlock();
    clearAboutIntroAmbientRetry();

    if (!aboutIntroAmbientAudio) return;

    aboutIntroAmbientAudio.volume = 0;
    aboutIntroAmbientAudio.pause();
    aboutIntroAmbientAudio.currentTime = 0;
}

function resetAboutIntroAmbient() {
    aboutIntroAmbientStopped = false;
    aboutIntroAmbientRevealed = false;
    aboutIntroAmbientRevealRequested = false;
    aboutIntroAmbientRevealRetryCount = 0;
    clearAboutIntroAmbientRevealRetry();
    clearAboutIntroAmbientStartTimer();
    aboutIntroAmbientStartAllowedAt = 0;
    clearAboutIntroAmbientUnlock();
    clearAboutIntroAmbientRetry();

    if (!aboutIntroAmbientAudio) return;

    aboutIntroAmbientAudio.pause();
    aboutIntroAmbientAudio.currentTime = 0;
    aboutIntroAmbientAudio.volume = ABOUT_INTRO_AMBIENT_VOLUME;
    aboutIntroAmbientAudio.muted = true;
}

function updateAboutIntroAmbientForTitle(title) {
    if (aboutIntroAmbientStopped) return;

    if (!title) {
        setAboutIntroAmbientVolume(ABOUT_INTRO_AMBIENT_VOLUME);
        playAboutIntroAmbient();
        return;
    }

    const titleTop = title.getBoundingClientRect().top;

    if (titleTop <= 1) {
        stopAboutIntroAmbient();
        return;
    }

    const fadeRatio = clamp(
        titleTop / ABOUT_INTRO_AMBIENT_FADE_DISTANCE,
        0.06,
        1
    );

    setAboutIntroAmbientVolume(ABOUT_INTRO_AMBIENT_VOLUME * fadeRatio);
    playAboutIntroAmbient();
}

function handleAboutIntroAmbientSoundStateChange(event) {
    if (!document.body.classList.contains("about-page")) return;

    if (!event.detail?.isEnabled) {
        pauseAboutIntroAmbient();
        return;
    }

    updateAboutIntroAmbientForTitle(getSceneElements().title);
}

function bindAboutIntroAmbientSoundListener() {
    if (aboutIntroAmbientSoundListenerBound) return;

    window.addEventListener(
        "recStudioSoundStateChange",
        handleAboutIntroAmbientSoundStateChange
    );
    aboutIntroAmbientSoundListenerBound = true;
}

function setParalaxTextTransform(paralaxText, rawTextMove) {
    if (!paralaxText) return;

    const translatePercent = 100 - Math.max(rawTextMove, 0);

    paralaxText.style.transform = `translateY(${translatePercent}%)`;

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
    title.style.backgroundAttachment = "scroll";
}

function resetIntroTitleBackground(title) {
    if (!title) return;

    title.style.backgroundSize = "";
    title.style.backgroundPosition = "";
    title.style.backgroundRepeat = "";
    title.style.backgroundAttachment = "";
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

export function syncAboutImageAndTitle(progressValue) {
    const { baseImg, title } = getSceneElements();

    const imageStopProgress = getAboutTextReachTopProgress();
    const imageProgress = mapRange(progressValue, 0, imageStopProgress, 0, 1);
    const zoom = 1 + imageProgress * 0.4;
    const move = imageProgress * 80;

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

    document.body.classList.remove("about-title-intro-complete");

    const introProgress = clamp(progressValue / ABOUT_TITLE_STAGE_END, 0, 1);
    const titleFontSize = mapRange(
        introProgress,
        0,
        1,
        ABOUT_INTRO_TITLE_START_SIZE,
        ABOUT_INTRO_TITLE_MAX_SIZE
    );

    const backgroundTransitionProgress = smoothstep(
        mapRange(introProgress, 0.75, 1, 0, 1)
    );
    const titleTransitionProgress = smoothstep(
        mapRange(introProgress, 0.9, 1, 0, 1)
    );

    const titleOpacity = mapRange(
        titleTransitionProgress,
        0,
        1,
        1,
        0
    );

    const imageOpacity = mapRange(
        backgroundTransitionProgress,
        0,
        1,
        0,
        1
    );

    document.body.classList.add("about-title-stage");
    setEntryFlickerState(false);
    setAboutIntroAmbientVolume(ABOUT_INTRO_AMBIENT_VOLUME);
    playAboutIntroAmbient();

    setIntroTitleSize(titleFontSize);

    document.documentElement.style.setProperty(
        "--about-title-intro-opacity",
        titleOpacity
    );

    document.documentElement.style.setProperty(
        "--about-image-opacity",
        imageOpacity
    );
    document.documentElement.style.setProperty(
        "--about-intro-overlay-opacity",
        1 - backgroundTransitionProgress
    );

    if (baseImg && title) {
        syncTitleBackgroundWithImage(baseImg, title);
    } else {
        resetIntroTitleBackground(title);
    }

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
    document.body.classList.add("about-title-intro-complete");
    setEntryFlickerState(false);
    state.aboutTitleEntryDone = true;
    state.aboutTitleEntryProgress = 1;
    state.aboutTitleScrollIntroStarted = true;
    state.aboutTitleScrollIntroComplete = true;

    setIntroTitleSize(ABOUT_INTRO_TITLE_ENTRY_SIZE);
    document.documentElement.style.setProperty("--about-title-intro-opacity", 1);
    document.documentElement.style.setProperty("--about-image-opacity", 1);
    document.documentElement.style.setProperty("--about-intro-overlay-opacity", 0);

    syncAboutImageAndTitle(sceneProgress);
    if (paralaxText) {
        const textMove = sceneProgress * getAboutParalaxTextMovePercent();
        paralaxText.style.transformOrigin = "";
        setParalaxTextTransform(paralaxText, textMove);
        paralaxText.style.willChange = "transform";
    }

    updateAboutIntroAmbientForTitle(title);

    if (sceneProgress >= getAboutTextReachTopProgress()) {
        stopAboutIntroAmbient();
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
    if (!state.aboutTitleScrollIntroComplete) {
        document.body.classList.remove("about-title-intro-complete");
    }
    setEntryFlickerState(false);

    setIntroTitleSize(
        state.aboutTitleScrollIntroComplete
            ? ABOUT_INTRO_TITLE_ENTRY_SIZE
            : ABOUT_INTRO_TITLE_START_SIZE
    );
    document.documentElement.style.setProperty("--about-title-intro-opacity", 1);
    document.documentElement.style.setProperty("--about-image-opacity", 0);
    document.documentElement.style.setProperty("--about-intro-overlay-opacity", 1);

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
            const textMove = progress * getAboutParalaxTextMovePercent();
            setParalaxTextTransform(paralaxText, textMove);
        }
    }

    updatePageScrollbar(progress);
    positionAboutTextScrollbar();
    updateAboutTextScrollbar();
}

function restartAboutIntroAmbientAutoplay() {
    if (!document.body.classList.contains("about-page")) return;

    resetAboutIntroAmbient();
    primeAboutIntroAmbientAutoplay();
    scheduleAboutIntroAmbientStart();
}

function bindAboutIntroAmbientPageShow() {
    if (aboutIntroAmbientPageShowBound) return;

    window.addEventListener("pageshow", restartAboutIntroAmbientAutoplay);
    aboutIntroAmbientPageShowBound = true;
}
function startAboutTitleScrollIntro() {
    if (state.aboutTitleScrollIntroComplete || state.aboutTitleScrollIntroStarted) {
        return;
    }

    state.aboutTitleEntryDone = true;
    state.aboutTitleEntryProgress = 1;
    state.aboutTitleScrollIntroStarted = true;
    state.aboutTitleScrollIntroStartTime = performance.now();
}
export function initAboutParallax() {
    if (!document.body.classList.contains("about-page")) return;

    window.addEventListener("pagehide", pauseAboutIntroAmbient, { once: true });

    bindAboutIntroAmbientPageShow();
    restartAboutIntroAmbientAutoplay();
    setInitialImagePosition();

    if (!state.aboutTitleScrollIntroComplete) {
        const shouldWaitForLogoIntro =
            dom.logoWrapper && !state.isUIVisible && !state.isLogoInMenu;

        if (shouldWaitForLogoIntro) {
            document.addEventListener(
                "recStudioLogoIntroComplete",
                startAboutTitleScrollIntro,
                { once: true }
            );
        } else {
            startAboutTitleScrollIntro();
        }
    }

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
