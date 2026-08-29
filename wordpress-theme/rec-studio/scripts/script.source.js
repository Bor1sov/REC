import { state } from "./modules/state.js";
import { dom } from "./modules/dom.js";
import { initSound, playSound } from "./modules/sound.js?v=20260619-6";
import { initMenuLogoVisibility } from "./modules/menu-logo.js";
import { initIntroLogo } from "./modules/intro-logo.js?v=20260619-1";
import { initPageScrollbar, updatePageScrollbar } from "./modules/page-scrollbar.js";
import { initScroll, setAboutTextScrollbarHandlers } from "./modules/scroll.js?v=20260619-3";
import { initContentLinksImages } from "./modules/links.js";
import { initPageTransitions, initMenuReturnToIndex } from "./modules/transitions.js";
import { normalizeMojibake } from "./modules/text-normalize.js";
import {
    ABOUT_TITLE_STAGE_END,
    ABOUT_PAGE_MAX_PROGRESS,
    ABOUT_PAGE_SCROLL_STOPS
} from "./modules/about-timeline.js";

const navigationEntry = performance.getEntriesByType("navigation")[0];
const isPageReload = navigationEntry && navigationEntry.type === "reload";
const body = document.body;
const isProjectsPage = body.classList.contains("projects-page");
const isHelpPage = body.classList.contains("help-page");
const isAboutPage = body.classList.contains("about-page");
const ABOUT_TITLE_INTRO_COMPLETE_CLASS = "about-title-intro-complete";
const shouldSkipAboutTitleIntro =
    isAboutPage &&
    sessionStorage.getItem("recStudioAboutTitleIntroComplete") === "true" &&
    !isPageReload;
const ABOUT_TITLE_SCROLL_INTRO_DURATION = 6400;
const ABOUT_DESCRIPTION_AUTO_SCROLL_DURATION = 4300;
const ABOUT_PARALAX_TEXT_MOVE_PERCENT = 285;
const ABOUT_PARALAX_REFERENCE_HEIGHT = 1200;
const PAGE_SCROLL_EASE = 0.045;

let setInitialImagePosition = () => {};
let updateScene = () => {};
let updateProjectsScene = () => {};
let updateHelpScene = () => {};
let updateAboutProjectsSection = () => {};
let updateAboutHelpSection = () => {};
let updateAboutNewsSection = () => {};
let updateAboutContactsSection = () => {};
let lastRenderedProgress = Number.NaN;
let pageDownArrow = null;

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

function easeIntroExit(progress) {
    const x = Math.max(0, Math.min(1, progress));

    return x * (0.62 + 0.38 * x);
}

function smoothstep(progress) {
    const x = Math.max(0, Math.min(1, progress));

    return x * x * (3 - 2 * x);
}

function getAboutDescriptionAutoTargetProgress() {
    const paralaxText = document.querySelector(".paralax-text");
    const textHeight = Math.max(
        1,
        paralaxText?.offsetHeight ||
            paralaxText?.getBoundingClientRect().height ||
            window.innerHeight
    );
    const untransformedTop = window.innerHeight - textHeight;
    const targetTranslatePercent = (-untransformedTop / textHeight) * 100;
    const textMovePercent = 100 - targetTranslatePercent;
    const paralaxTextTopProgress = Math.max(
        0,
        Math.min(1, textMovePercent / getAboutParalaxTextMovePercent())
    );

    return ABOUT_TITLE_STAGE_END +
        (1 - ABOUT_TITLE_STAGE_END) * paralaxTextTopProgress;
}

function startAboutDescriptionAutoScroll() {
    if (
        !isAboutPage ||
        state.aboutDescriptionAutoScrollStarted ||
        state.aboutDescriptionAutoScrollComplete
    ) {
        return;
    }

    state.aboutDescriptionAutoScrollStarted = true;
    state.aboutDescriptionAutoScrollStartTime = performance.now();
    state.aboutDescriptionAutoScrollStartProgress = Math.max(
        state.progress,
        ABOUT_TITLE_STAGE_END
    );
    state.targetProgress = getAboutDescriptionAutoTargetProgress();
}

state.shouldSkipIntro =
    sessionStorage.getItem("recStudioSkipIntro") === "true" && !isPageReload;

state.pageProgressStops = null;
state.pageProgressInstantSegments = null;

body.classList.toggle(ABOUT_TITLE_INTRO_COMPLETE_CLASS, isAboutPage && shouldSkipAboutTitleIntro);

if (isProjectsPage) {
    state.pageProgressMax = 5;
    state.pageSectionsCount = 1;
} else if (isHelpPage) {
    state.pageProgressMax = 2;
    state.pageSectionsCount = 1;
} else if (isAboutPage) {
    state.pageProgressMax = ABOUT_PAGE_MAX_PROGRESS;
    state.pageProgressStops = ABOUT_PAGE_SCROLL_STOPS;
    state.pageProgressInstantSegments = null;
    state.pageSectionsCount = ABOUT_PAGE_SCROLL_STOPS.length - 1;

    if (shouldSkipAboutTitleIntro) {
        const aboutReturnProgress = getAboutDescriptionAutoTargetProgress();

        state.progress = aboutReturnProgress;
        state.targetProgress = aboutReturnProgress;
        state.aboutTitleEntryProgress = 1;
        state.aboutTitleEntryDone = true;
        state.aboutTitleScrollIntroStarted = true;
        state.aboutTitleScrollIntroStartTime = 0;
        state.aboutTitleScrollIntroComplete = true;
        state.aboutDescriptionAutoScrollStarted = true;
        state.aboutDescriptionAutoScrollComplete = true;
    }
} else {
    state.pageProgressMax = 1;
    state.pageSectionsCount = 1;
}

if (isPageReload) {
    sessionStorage.removeItem("recStudioSkipIntro");
}

if (dom.main) {
    dom.main.classList.add("show");
    dom.main.classList.remove("hidden");

    if (state.shouldSkipIntro && dom.hasContentLinks) {
        dom.main.classList.remove("ui-hidden");
        dom.main.classList.add("ui-visible");
        dom.main.classList.add("menu-logo-ready");

        if (dom.logoWrapper) {
            dom.logoWrapper.style.display = "none";
        }

        state.isUIVisible = true;
        state.isLogoInMenu = true;
        state.isLogoMovingToMenu = false;

        initMenuLogoVisibility();
        sessionStorage.removeItem("recStudioSkipIntro");
    } else {
        dom.main.classList.add("ui-hidden");
        dom.main.classList.remove("ui-visible");
        dom.main.classList.remove("menu-logo-ready");

        if (dom.logoWrapper) {
            dom.logoWrapper.style.display = "";
            dom.logoWrapper.classList.remove("active", "logo-shifted", "text-visible");
        }

        if (dom.logo) {
            dom.logo.classList.add("is-red");
        }

        state.isUIVisible = false;
        state.isLogoInMenu = false;
        state.isLogoMovingToMenu = false;
    }
}

function isScrollableVirtualPage() {
    return isAboutPage || isProjectsPage || isHelpPage || body.classList.contains("news-page");
}

function getExistingDownArrow() {
    return document.querySelector(
        ".projects-arrow, .help-arrow, .news-arrow, .about-page-arrow"
    );
}

function initPageDownArrow() {
    pageDownArrow = null;
}

function updatePageDownArrow() {}
function initLanguageToggle() {
    const langButtons = document.querySelectorAll(".settings__lang-btn");

    langButtons.forEach((button) => {
        if (button.dataset.langReady === "true") return;

        button.addEventListener("click", () => {
            const currentLang = button.textContent.trim().toUpperCase();

            button.textContent = currentLang === "RU" ? "EN" : "RU";
        });

        button.dataset.langReady = "true";
    });
}

async function initPageModules() {
    if (isAboutPage) {
        const [
            aboutTextScrollbar,
            aboutParallax,
            aboutProjects,
            aboutHelp,
            aboutNews,
            aboutContacts
        ] = await Promise.all([
            import("./modules/about-text-scrollbar.js"),
            import("./modules/about-parallax.js?v=20260619-3"),
            import("./modules/about-projects-section.js"),
            import("./modules/about-help-section.js?v=20260620-17"),
            import("./modules/about-news-section.js"),
            import("./modules/about-contacts-section.js")
        ]);

        setInitialImagePosition = aboutParallax.setInitialImagePosition;
        updateScene = aboutParallax.updateScene;
        setAboutTextScrollbarHandlers({
            positionAboutTextScrollbar: aboutTextScrollbar.positionAboutTextScrollbar,
            updateAboutTextScrollbar: aboutTextScrollbar.updateAboutTextScrollbar
        });
        updateAboutProjectsSection = aboutProjects.updateAboutProjectsSection;
        updateAboutHelpSection = aboutHelp.updateAboutHelpSection;
        updateAboutNewsSection = aboutNews.updateAboutNewsSection;
        updateAboutContactsSection = aboutContacts.updateAboutContactsSection;

        aboutTextScrollbar.initAboutTextScrollbar();
        aboutParallax.initAboutParallax();
        aboutProjects.initAboutProjectsSection();
        aboutHelp.initAboutHelpSection();
        aboutNews.initAboutNewsSection();
        aboutContacts.initAboutContactsSection();
        initPageDownArrow();
        setInitialImagePosition();
        return;
    }

    if (isProjectsPage) {
        const [projectsParallax, projectCardHover] = await Promise.all([
            import("./modules/projects-parallax.js"),
            import("./modules/project-card-hover.js")
        ]);

        updateProjectsScene = projectsParallax.updateProjectsScene;
        projectsParallax.initProjectsParallax();
        projectCardHover.initProjectCardHover();
        initPageDownArrow();
        return;
    }

    if (isHelpPage) {
        const helpParallax = await import("./modules/help-parallax.js");

        updateHelpScene = helpParallax.updateHelpScene;
        helpParallax.initHelpParallax();
        initPageDownArrow();
    }
}

function renderPage(force = false) {
    if (!force && Math.abs(state.progress - lastRenderedProgress) < 0.0005) {
        return;
    }

    lastRenderedProgress = state.progress;

    if (isProjectsPage) {
        updateProjectsScene(state.progress);
        updatePageDownArrow(state.progress);
    } else if (isHelpPage) {
        updateHelpScene(state.progress);
        updatePageDownArrow(state.progress);
    } else if (isAboutPage) {
        updateScene(state.progress);
        updateAboutProjectsSection(state.progress);
        updateAboutHelpSection(state.progress);
        updateAboutNewsSection(state.progress);
        updateAboutContactsSection(state.progress);
        updatePageDownArrow(state.progress);
    } else {
        updatePageScrollbar(state.progress);
        updatePageDownArrow(state.progress);
    }
}

function animate() {
    if (
        isAboutPage &&
        state.aboutTitleScrollIntroStarted &&
        !state.aboutTitleScrollIntroComplete
    ) {
        const elapsed = performance.now() - state.aboutTitleScrollIntroStartTime;
        const progress = Math.min(
            1,
            elapsed / ABOUT_TITLE_SCROLL_INTRO_DURATION
        );
        const easedProgress = easeIntroExit(progress);

        state.progress = easedProgress * ABOUT_TITLE_STAGE_END;
        state.targetProgress = state.progress;
        renderPage(true);

        if (progress >= 1) {
            state.progress = ABOUT_TITLE_STAGE_END;
            state.targetProgress = ABOUT_TITLE_STAGE_END;
            state.aboutTitleScrollIntroComplete = true;
            body.classList.add(ABOUT_TITLE_INTRO_COMPLETE_CLASS);
            sessionStorage.setItem("recStudioAboutTitleIntroComplete", "true");
            renderPage(true);
            startAboutDescriptionAutoScroll();
        }

        requestAnimationFrame(animate);
        return;
    }

    if (
        isAboutPage &&
        state.aboutTitleScrollIntroComplete &&
        !state.aboutDescriptionAutoScrollComplete
    ) {
        startAboutDescriptionAutoScroll();

        if (state.aboutDescriptionAutoScrollStarted) {
            const elapsed = performance.now() - state.aboutDescriptionAutoScrollStartTime;
            const progress = Math.min(
                1,
                elapsed / ABOUT_DESCRIPTION_AUTO_SCROLL_DURATION
            );
            const targetProgress = getAboutDescriptionAutoTargetProgress();
            const startProgress = Math.max(
                state.aboutDescriptionAutoScrollStartProgress,
                ABOUT_TITLE_STAGE_END
            );

            const easedProgress = smoothstep(progress);
            state.progress = startProgress + (targetProgress - startProgress) * easedProgress;
            state.targetProgress = state.progress;
            renderPage(true);

            if (progress >= 1) {
                state.progress = targetProgress;
                state.targetProgress = targetProgress;
                state.aboutDescriptionAutoScrollComplete = true;
                renderPage(true);
            }

            requestAnimationFrame(animate);
            return;
        }
    }

    const delta = state.targetProgress - state.progress;

    if (Math.abs(delta) > 0.0005) {
        state.progress += delta * PAGE_SCROLL_EASE;

        if (Math.abs(state.targetProgress - state.progress) < 0.0005) {
            state.progress = state.targetProgress;
        }

        renderPage();
    }

    requestAnimationFrame(animate);
}

function initDebugControlsIfRequested() {
    const params = new URLSearchParams(window.location.search);

    if (!params.has("debug")) return;

    import("./modules/debug.js")
        .then(({ initDebugControls }) => initDebugControls())
        .catch((error) => console.warn("Debug controls failed to load:", error));
}

initSound();
normalizeMojibake();
initLanguageToggle();
initMenuLogoVisibility();
initPageScrollbar();
initScroll();
initIntroLogo(playSound);
initContentLinksImages();
initPageTransitions();
initMenuReturnToIndex();
initDebugControlsIfRequested();
renderPage(true);
animate();

initPageModules()
    .then(() => renderPage(true))
    .catch((error) => console.error("Page modules failed to load:", error));

window.addEventListener("resize", () => {
    if (isAboutPage) {
        setInitialImagePosition();
    }

    renderPage(true);
    updatePageScrollbar(state.progress);
    updatePageDownArrow(state.progress);
});
