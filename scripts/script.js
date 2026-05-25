import { state } from "./modules/state.js";
import { dom, isContactsPage } from "./modules/dom.js";
import { initSound, playSound } from "./modules/sound.js";
import { initMenuLogoVisibility } from "./modules/menu-logo.js";
import { initIntroLogo } from "./modules/intro-logo.js";
import { initPageScrollbar, updatePageScrollbar } from "./modules/page-scrollbar.js";
import { initAboutTextScrollbar } from "./modules/about-text-scrollbar.js";
import { initProjectCardHover } from "./modules/project-card-hover.js";
import {
    initAboutParallax,
    setInitialImagePosition,
    updateScene
} from "./modules/about-parallax.js";
import {
    initProjectsParallax,
    updateProjectsScene
} from "./modules/projects-parallax.js";
import {
    initHelpParallax,
    updateHelpScene
} from "./modules/help-parallax.js";
import { initScroll } from "./modules/scroll.js";
import { initContentLinksImages } from "./modules/links.js";
import { initPageTransitions, initMenuReturnToIndex } from "./modules/transitions.js";
import { initDebugControls } from "./modules/debug.js";

const navigationEntry = performance.getEntriesByType("navigation")[0];
const isPageReload = navigationEntry && navigationEntry.type === "reload";

state.shouldSkipIntro =
    sessionStorage.getItem("recStudioSkipIntro") === "true" && !isPageReload;

if (document.body.classList.contains("projects-page")) {
    state.pageProgressMax = 4;
} else if (document.body.classList.contains("help-page")) {
    state.pageProgressMax = 2;
} else {
    state.pageProgressMax = 1;
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

initSound();
initLanguageToggle();
initMenuLogoVisibility();
initPageScrollbar();
initAboutTextScrollbar();
initAboutParallax();
initProjectsParallax();
initHelpParallax();
setInitialImagePosition();
initDebugControls();
initScroll();
initIntroLogo(playSound);
initContentLinksImages();
initPageTransitions();
initMenuReturnToIndex();
initProjectCardHover();

function animate() {
    state.progress += (state.targetProgress - state.progress) * 0.08;

    if (document.body.classList.contains("projects-page")) {
        updateProjectsScene(state.progress);
    } else if (document.body.classList.contains("help-page")) {
        updateHelpScene(state.progress);
    } else {
        updateScene(state.progress);
    }

    requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
    if (document.body.classList.contains("projects-page")) {
        updateProjectsScene(state.progress);
    } else if (document.body.classList.contains("help-page")) {
        updateHelpScene(state.progress);
    } else {
        setInitialImagePosition();
        updateScene(state.progress);
    }

    updatePageScrollbar(state.progress);
});