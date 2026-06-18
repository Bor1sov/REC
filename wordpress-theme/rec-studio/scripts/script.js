import { state } from "./modules/state.js";
import { dom } from "./modules/dom.js";
import { initSound, playSound } from "./modules/sound.js";
import { initMenuLogoVisibility } from "./modules/menu-logo.js";
import { initIntroLogo } from "./modules/intro-logo.js";
import { initPageScrollbar, updatePageScrollbar } from "./modules/page-scrollbar.js";
import { initScroll, setAboutTextScrollbarHandlers } from "./modules/scroll.js";
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
const shouldSkipAboutTitleIntro =
    isAboutPage &&
    sessionStorage.getItem("recStudioAboutTitleIntroComplete") === "true" &&
    !isPageReload;

let setInitialImagePosition = () => {};
let updateScene = () => {};
let updateProjectsScene = () => {};
let updateHelpScene = () => {};
let updateAboutProjectsSection = () => {};
let updateAboutHelpSection = () => {};
let updateAboutNewsSection = () => {};
let updateAboutContactsSection = () => {};
let lastRenderedProgress = Number.NaN;

state.shouldSkipIntro =
    sessionStorage.getItem("recStudioSkipIntro") === "true" && !isPageReload;

state.pageProgressStops = null;
state.pageProgressInstantSegments = null;

if (isProjectsPage) {
    state.pageProgressMax = 4;
    state.pageSectionsCount = 1;
} else if (isHelpPage) {
    state.pageProgressMax = 2;
    state.pageSectionsCount = 1;
} else if (isAboutPage) {
    state.pageProgressMax = ABOUT_PAGE_MAX_PROGRESS;
    state.pageProgressStops = ABOUT_PAGE_SCROLL_STOPS;
    state.pageProgressInstantSegments = [3, 4];
    state.pageSectionsCount = ABOUT_PAGE_SCROLL_STOPS.length - 1;

    if (shouldSkipAboutTitleIntro) {
        state.progress = ABOUT_TITLE_STAGE_END;
        state.targetProgress = ABOUT_TITLE_STAGE_END;
        state.aboutTitleEntryProgress = 1;
        state.aboutTitleEntryDone = true;
        state.aboutTitleScrollIntroComplete = true;
        sessionStorage.removeItem("recStudioAboutTitleIntroComplete");
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
            import("./modules/about-parallax.js"),
            import("./modules/about-projects-section.js"),
            import("./modules/about-help-section.js"),
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
        return;
    }

    if (isHelpPage) {
        const helpParallax = await import("./modules/help-parallax.js");

        updateHelpScene = helpParallax.updateHelpScene;
        helpParallax.initHelpParallax();
    }
}

function renderPage(force = false) {
    if (!force && Math.abs(state.progress - lastRenderedProgress) < 0.0005) {
        return;
    }

    lastRenderedProgress = state.progress;

    if (isProjectsPage) {
        updateProjectsScene(state.progress);
    } else if (isHelpPage) {
        updateHelpScene(state.progress);
    } else if (isAboutPage) {
        updateScene(state.progress);
        updateAboutProjectsSection(state.progress);
        updateAboutHelpSection(state.progress);
        updateAboutNewsSection(state.progress);
        updateAboutContactsSection(state.progress);
    } else {
        updatePageScrollbar(state.progress);
    }
}

function animate() {
    const delta = state.targetProgress - state.progress;

    if (Math.abs(delta) > 0.0005) {
        state.progress += delta * 0.08;

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
});
