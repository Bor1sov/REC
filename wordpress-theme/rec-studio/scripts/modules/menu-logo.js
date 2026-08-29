import { state } from "./state.js";
import { dom } from "./dom.js";
import { playSound } from "./sound.js?v=20260619-6";
import { getPageUrl } from "./runtime.js";

const menuLogoGuardStyle = document.createElement("style");

menuLogoGuardStyle.textContent = `
    .main-container:not(.menu-logo-ready) .menu__logo-cont {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
    }

    .main-container.menu-logo-ready .menu__logo-cont {
        display: block;
        opacity: 0.8;
        visibility: visible;
        pointer-events: auto;
    }
`;

document.head.appendChild(menuLogoGuardStyle);

const initialMenuLogo = dom.menuSection
    ? dom.menuSection.querySelector(".menu__logo-cont")
    : null;

if (initialMenuLogo) {
    if (dom.main && !(state.shouldSkipIntro && dom.hasContentLinks)) {
        initialMenuLogo.remove();
    } else {
        initialMenuLogo.style.display = "block";
    }
}

export function setMenuLogoColor(menuLogo, color) {
    if (!menuLogo) return;

    if (color === "white") {
        menuLogo.dataset.logoColor = "white";
        menuLogo.classList.remove("red-glow");
        menuLogo.classList.add("white-glow");
        menuLogo.style.borderColor = "rgb(255, 255, 255)";
        menuLogo.style.boxShadow = "0 0 24px rgba(255, 255, 255, 0.85)";
    } else {
        menuLogo.dataset.logoColor = "red";
        menuLogo.classList.remove("white-glow");
        menuLogo.classList.add("red-glow");
        menuLogo.style.borderColor = "rgb(255, 0, 0)";
        menuLogo.style.boxShadow = "0 0 24px rgba(255, 0, 0, 0.85)";
    }
}

export function initMenuLogoMenuLink(menuLogo) {
    if (!menuLogo) return;
    if (menuLogo.dataset.menuLinkReady === "true") return;

    if (!menuLogo.dataset.logoColor) {
        setMenuLogoColor(menuLogo, "red");
    }

    const menuUrl = getPageUrl("menu");

    if (menuLogo.tagName === "A") {
        menuLogo.setAttribute("href", menuUrl);
    } else {
        menuLogo.setAttribute("role", "link");
        menuLogo.tabIndex = 0;
    }

    menuLogo.setAttribute("aria-label", "Open menu index");

    const goToMenu = () => {
        sessionStorage.setItem("recStudioSkipIntro", "true");
        window.location.href = menuUrl;
    };

    menuLogo.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        playSound();

        menuLogo.style.transform = "scale(0.9)";

        setTimeout(() => {
            menuLogo.style.transform = "scale(1)";
            goToMenu();
        }, 120);
    });

    menuLogo.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;

        e.preventDefault();
        e.stopPropagation();
        playSound();
        goToMenu();
    });

    menuLogo.dataset.menuLinkReady = "true";
}

export function addGlowAnimation(element) {
    if (!element) return;

    element.classList.add("menu__logo-cont");

    const oldStyle = document.querySelector("#menu-logo-glow-style");

    if (oldStyle) return;

    const style = document.createElement("style");
    style.id = "menu-logo-glow-style";
    style.textContent = `
        @keyframes menuLogoGlowRed {
            0% { box-shadow: 0 0 0px rgba(255, 0, 0, 0); }
            50% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); }
            100% { box-shadow: 0 0 0px rgba(255, 0, 0, 0); }
        }

        @keyframes menuLogoGlowWhite {
            0% { box-shadow: 0 0 0px rgba(255, 255, 255, 0); }
            50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
            100% { box-shadow: 0 0 0px rgba(255, 255, 255, 0); }
        }

        .menu__logo-cont.red-glow {
            animation: menuLogoGlowRed 2s ease-in-out infinite;
        }

        .menu__logo-cont.white-glow {
            animation: menuLogoGlowWhite 2s ease-in-out infinite;
        }

        .menu__logo-cont {
            transition: all 0.3s ease;
        }

        .menu__logo-cont.red-glow:hover {
            box-shadow: 0 0 25px rgba(255, 0, 0, 1);
        }

        .menu__logo-cont.white-glow:hover {
            box-shadow: 0 0 25px rgba(255, 255, 255, 1);
        }

        .menu__logo-cont:active {
            transform: scale(0.95);
        }
    `;

    document.head.appendChild(style);
}

export function createMenuLogo() {
    if (!dom.menuSection) return null;

    let menuLogo = dom.menuSection.querySelector(".menu__logo-cont");

    if (menuLogo) {
        setMenuLogoColor(menuLogo, menuLogo.dataset.logoColor || "red");
        initMenuLogoMenuLink(menuLogo);
        return menuLogo;
    }

    menuLogo = document.createElement("a");
    menuLogo.className = "menu__logo-cont red-glow";
    menuLogo.href = getPageUrl("menu");
    menuLogo.style.width = "40px";
    menuLogo.style.height = "40px";
    menuLogo.style.border = "12px solid rgb(255, 0, 0)";
    menuLogo.style.borderRadius = "50%";
    menuLogo.style.margin = "20px auto 10px auto";
    menuLogo.style.opacity = "0.8";
    menuLogo.style.cursor = "pointer";
    menuLogo.style.display = "block";
    menuLogo.style.position = "relative";
    menuLogo.style.flexShrink = "0";

    addGlowAnimation(menuLogo);
    setMenuLogoColor(menuLogo, "red");
    initMenuLogoMenuLink(menuLogo);

    const menuBlock = dom.menuSection.querySelector(".menu-block");

    if (menuBlock) {
        dom.menuSection.insertBefore(menuLogo, menuBlock);
    } else {
        dom.menuSection.insertBefore(menuLogo, dom.menuSection.firstChild);
    }

    return menuLogo;
}

export function initMenuLogoVisibility() {
    let menuLogo = dom.menuSection
        ? dom.menuSection.querySelector(".menu__logo-cont")
        : null;

    if (dom.main) {
        if (state.isLogoInMenu && !state.isLogoMovingToMenu) {
            menuLogo = createMenuLogo();

            if (!menuLogo) return;

            dom.main.classList.add("menu-logo-ready");

            menuLogo.style.display = "block";
            menuLogo.style.opacity = "0.8";
            menuLogo.style.visibility = "visible";
            menuLogo.style.pointerEvents = "auto";

            initMenuLogoMenuLink(menuLogo);
        } else {
            if (menuLogo) {
                menuLogo.remove();
            }

            dom.main.classList.remove("menu-logo-ready");
        }
    } else {
        menuLogo = createMenuLogo();

        if (!menuLogo) return;

        menuLogo.style.display = "block";
        menuLogo.style.opacity = "0.8";
        menuLogo.style.visibility = "visible";
        menuLogo.style.pointerEvents = "auto";

        initMenuLogoMenuLink(menuLogo);
    }
}
