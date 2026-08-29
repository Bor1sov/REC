import { getPageUrl } from "./runtime.js";

const ENTRY_DURATION = 4500;
const ENTRY_SCALE = 1.6;
const MAX_SCALE = 8.4;
const SCROLL_SPEED = 0.0011;

let target = null;
let entryFrame = null;
let entryDone = false;
let scrollProgress = 0;
let isActive = false;
let isComplete = false;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function easeOutCubic(value) {
    const x = clamp(value, 0, 1);
    return 1 - Math.pow(1 - x, 3);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}

function setScale(scale) {
    if (!target) return;

    target.style.setProperty("--home-about-scale", scale.toFixed(4));
}

function setScrollProgress(progress) {
    document.documentElement.style.setProperty(
        "--home-about-scroll-progress",
        progress.toFixed(4)
    );
    document.documentElement.style.setProperty(
        "--home-about-other-opacity",
        Math.max(0, 1 - progress * 2).toFixed(4)
    );
}

function finishEntry() {
    if (entryFrame) {
        cancelAnimationFrame(entryFrame);
        entryFrame = null;
    }

    entryDone = true;
    setScale(ENTRY_SCALE);
    document.body.classList.add("home-about-intro-flicker");
}

function completeIntro() {
    if (isComplete) return;

    isComplete = true;
    sessionStorage.setItem("recStudioAboutTitleIntroComplete", "true");
    window.location.href = getPageUrl("home");
}

function updateScrollIntro(deltaY) {
    if (!entryDone) {
        finishEntry();
    }

    scrollProgress = clamp(scrollProgress + deltaY * SCROLL_SPEED, 0, 1);

    if (scrollProgress > 0.01) {
        document.body.classList.remove("home-about-intro-flicker");
        document.body.classList.add("home-about-intro-scroll");
    } else {
        document.body.classList.add("home-about-intro-flicker");
        document.body.classList.remove("home-about-intro-scroll");
    }

    const easedProgress = easeOutCubic(scrollProgress);
    const scale = mapRange(easedProgress, 0, 1, ENTRY_SCALE, MAX_SCALE);

    setScale(scale);
    setScrollProgress(scrollProgress);

    if (scrollProgress >= 1) {
        completeIntro();
    }
}

function handleWheel(event) {
    if (!isActive || isComplete) return;

    event.preventDefault();
    event.stopPropagation();

    updateScrollIntro(event.deltaY);
}

function startEntryAnimation() {
    if (!target || isActive || isComplete) return;

    isActive = true;
    entryDone = false;
    scrollProgress = 0;

    document.body.classList.add("home-about-intro-active");
    document.body.classList.remove("home-about-intro-scroll", "home-about-intro-flicker");
    target.classList.add("home-about-intro__target");

    setScale(1);
    setScrollProgress(0);

    const startedAt = performance.now();

    const tick = (now) => {
        const progress = clamp((now - startedAt) / ENTRY_DURATION, 0, 1);
        const scale = mapRange(easeOutCubic(progress), 0, 1, 1, ENTRY_SCALE);

        setScale(scale);

        if (progress < 1) {
            entryFrame = requestAnimationFrame(tick);
            return;
        }

        entryFrame = null;
        finishEntry();
    };

    entryFrame = requestAnimationFrame(tick);
}

export function initHomeAboutIntro() {
    if (!document.body.classList.contains("home-page")) return;
    if (sessionStorage.getItem("recStudioAboutTitleIntroComplete") === "true") return;

    target = document.querySelector(".content__links__item.faq");

    if (!target) return;

    window.addEventListener("wheel", handleWheel, {
        passive: false,
        capture: true
    });

    document.addEventListener("recStudioLogoIntroComplete", startEntryAnimation);
}
