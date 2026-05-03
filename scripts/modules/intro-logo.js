import { state } from "./state.js";
import { dom } from "./dom.js";
import { createMenuLogo, initMenuLogoVisibility } from "./menu-logo.js";
import { showUI } from "./scroll.js";

export function moveLogoToMenuTop() {
    if (state.isLogoInMenu || state.isLogoMovingToMenu) return;
    if (!dom.main || !dom.logo || !dom.menuSection || !dom.logoWrapper) return;

    state.isLogoMovingToMenu = true;

    const logoRect = dom.logo.getBoundingClientRect();
    const menuRect = dom.menuSection.getBoundingClientRect();

    const targetTop = menuRect.top + 20;
    const targetLeft = menuRect.left + menuRect.width / 2 - 20;

    const logoClone = dom.logo.cloneNode(true);
    logoClone.classList.add("is-red");
    logoClone.style.position = "fixed";
    logoClone.style.top = logoRect.top + "px";
    logoClone.style.left = logoRect.left + "px";
    logoClone.style.width = logoRect.width + "px";
    logoClone.style.height = logoRect.height + "px";
    logoClone.style.margin = "0";
    logoClone.style.zIndex = "10001";
    logoClone.style.transition = "all 0.8s cubic-bezier(0.7, 0, 0.2, 1)";
    logoClone.style.pointerEvents = "none";
    logoClone.style.border = "25px solid rgb(255, 0, 0)";
    logoClone.style.borderRadius = "50%";
    logoClone.style.backgroundColor = "transparent";

    document.body.appendChild(logoClone);

    dom.logo.style.opacity = "0";
    dom.logo.style.visibility = "hidden";

    setTimeout(() => {
        logoClone.style.top = targetTop + "px";
        logoClone.style.left = targetLeft + "px";
        logoClone.style.width = "40px";
        logoClone.style.height = "40px";
        logoClone.style.borderWidth = "12px";
    }, 10);

    setTimeout(() => {
        if (logoClone && logoClone.remove) {
            logoClone.remove();
        }

        const oldMenuLogo = dom.menuSection.querySelector(".menu__logo-cont");

        if (oldMenuLogo) {
            oldMenuLogo.remove();
        }

        state.isLogoMovingToMenu = false;
        state.isLogoInMenu = true;

        const newMenuLogo = createMenuLogo();

        if (newMenuLogo) {
            newMenuLogo.style.display = "block";
            newMenuLogo.style.opacity = "0.8";
            newMenuLogo.style.visibility = "visible";
            newMenuLogo.style.pointerEvents = "auto";
        }

        dom.logo.style.display = "none";

        const logoText = document.querySelector(".logo-text");

        if (logoText) {
            logoText.style.transition = "opacity 0.5s ease";
            logoText.style.opacity = "0";
        }

        dom.logoWrapper.style.pointerEvents = "none";

        if (dom.main) {
            dom.main.classList.add("menu-logo-ready");
        }

        initMenuLogoVisibility();
    }, 800);
}

export function resetLogoPosition() {
    if (!dom.logo || !dom.logoWrapper) return;

    state.isLogoInMenu = false;
    state.isLogoMovingToMenu = false;

    const menuLogo = dom.main && dom.menuSection
        ? dom.menuSection.querySelector(".menu__logo-cont")
        : null;

    if (menuLogo && menuLogo.remove) {
        menuLogo.remove();
    }

    if (dom.main) {
        dom.main.classList.remove("menu-logo-ready");
    }

    dom.logoWrapper.classList.remove("active", "logo-shifted", "text-visible");

    dom.logo.classList.remove("is-red");
    dom.logo.style.display = "";
    dom.logo.style.position = "";
    dom.logo.style.top = "";
    dom.logo.style.left = "";
    dom.logo.style.width = "75px";
    dom.logo.style.height = "75px";
    dom.logo.style.borderWidth = "25px";
    dom.logo.style.border = "";
    dom.logo.style.boxShadow = "";
    dom.logo.style.animation = "";
    dom.logo.style.transform = "";
    dom.logo.style.opacity = "0.8";
    dom.logo.style.visibility = "visible";
    dom.logo.style.zIndex = "";
    dom.logo.style.margin = "";

    dom.logoWrapper.style.pointerEvents = "";

    const logoText = document.querySelector(".logo-text");

    if (logoText) {
        logoText.style.transition = "";
        logoText.style.opacity = "";
    }

    initMenuLogoVisibility();
}

export function initIntroLogo(playSound) {
    if (!dom.logo || !dom.logoWrapper) return;

    dom.logo.addEventListener("click", (e) => {
        e.stopPropagation();

        playSound();
        state.clickCount++;

        dom.logo.classList.add("is-red");

        if (state.clickCount === 2 && !state.isLogoInMenu && !state.isLogoMovingToMenu) {
            moveLogoToMenuTop();
            showUI();
            state.targetProgress = 0.3;
            return;
        }

        if (state.isUIVisible && !state.isLogoMovingToMenu) {
            resetScene();
            return;
        }

        if (!dom.logoWrapper.classList.contains("logo-shifted")) {
            dom.logoWrapper.classList.add("logo-shifted");

            setTimeout(() => {
                if (dom.logoWrapper.classList.contains("logo-shifted")) {
                    dom.logoWrapper.classList.add("text-visible");
                }
            }, 500);

            return;
        }

        showUI();
        state.targetProgress += 0.05;
    });
}

export function resetScene() {
    if (!dom.main || !dom.logoWrapper) return;

    dom.main.classList.remove("ui-visible");
    dom.main.classList.add("ui-hidden");
    dom.main.classList.remove("menu-logo-ready");

    dom.logoWrapper.classList.remove("active", "logo-shifted", "text-visible");

    state.progress = 0;
    state.targetProgress = 0;
    state.isUIVisible = false;
    state.clickCount = 0;

    resetLogoPosition();

    import("./about-parallax.js").then(({ updateScene }) => {
        updateScene(0);
    });

    initMenuLogoVisibility();
}