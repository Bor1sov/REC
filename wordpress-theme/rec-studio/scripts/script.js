const state = {
    isSoundEnabled: true,

    progress: 0,
    targetProgress: 0,
    pageProgressMax: 1,
    pageProgressStops: null,
    pageProgressInstantSegments: null,

    isUIVisible: false,
    clickCount: 0,

    isLogoInMenu: false,
    isLogoMovingToMenu: false,
    aboutTitleEntryProgress: 0,
    aboutTitleEntryDone: false,
    aboutTitleScrollIntroStarted: false,
    aboutTitleScrollIntroStartTime: 0,
    aboutTitleScrollIntroComplete: false,
    aboutDescriptionAutoScrollStarted: false,
    aboutDescriptionAutoScrollComplete: false,
    aboutDescriptionAutoScrollStartTime: 0,
    aboutDescriptionAutoScrollStartProgress: 0,

    currentSize: 200,
    currentPosition: 5,
    currentLeftOffset: 50,

    aboutTextScrollbar: null,
    aboutTextScrollbarFill: null,

    shouldSkipIntro: false
};

const dom = {
    main: document.querySelector(".main-container"),
    logoWrapper: document.querySelector(".logo-wrapper"),
    logo: document.querySelector(".main__container__logo"),
    menuSection: document.querySelector(".menu"),

    hasContentLinks: document.querySelector(".content__links"),
    contentPage: document.querySelector(".content--page"),
    aboutInfoText: document.querySelector(".about-info-text"),

    volumeBtn: document.querySelector(".settings__valume-btn"),
    volumeIcon: document.querySelector(".settings__valume-btn__img")
};

const isContactsPage =
    document.body.classList.contains("contacts-page") ||
    document.querySelector(".contacts");

function getSceneElements() {
    return {
        baseImg: document.querySelector(".about__img"),
        paralaxText: document.querySelector(".paralax-text"),
        infoBlock: document.querySelector(".about-info"),
        title: document.querySelector(".about__title")
    };
}

const config = window.recTheme || {};
const themeBase = new URL("../../", import.meta.url).href;

function getAssetUrl(path) {
    const normalizedPath = String(path || "")
        .replace(/^\.\//, "")
        .replace(/^\/+/, "");

    const base = config.assetBase || themeBase;

    return new URL(normalizedPath, base).href;
}

function getPageUrl(slug) {
    const pages = config.pages || {};

    if (pages[slug]) return pages[slug];
    if (slug === "home") return `${window.location.origin}/`;
    if (window.location.hostname === "dev.recstudio.biz") {
        const url = new URL("/", window.location.origin);
        url.searchParams.set("pagename", slug);

        return url.href;
    }

    return new URL(`/${slug}/`, window.location.origin).href;
}

let clickSound = null;
const SOUND_STORAGE_KEY = "recStudioSoundEnabled";
const mediaMutedStates = new WeakMap();
let mediaObserver = null;

function getClickSound() {
    if (!clickSound) {
        clickSound = new Audio(getAssetUrl("assets/click-sound.mp3"));
        clickSound.volume = 0.5;
        clickSound.preload = "none";
    }

    return clickSound;
}

function playSound({ force = false } = {}) {
    if (!force && !state.isSoundEnabled) return;

    const sound = getClickSound();

    sound.muted = false;
    sound.currentTime = 0;
    sound.play().catch((e) => console.log("Sound error:", e));
}

function updateVolumeIcon() {
    if (!dom.volumeIcon) return;

    dom.volumeIcon.classList.toggle("is-sound-on", state.isSoundEnabled);
    dom.volumeIcon.classList.toggle("is-sound-off", !state.isSoundEnabled);
    dom.volumeIcon.src = getAssetUrl(
        state.isSoundEnabled
            ? "assets/sound-on.png?v=20260619-2"
            : "assets/sound-off.png?v=20260619-2"
    );
    dom.volumeIcon.removeAttribute("srcset");
    dom.volumeIcon.alt = state.isSoundEnabled
        ? "Звук включён"
        : "Звук выключен";
    dom.volumeIcon.dataset.soundEnabled = state.isSoundEnabled ? "true" : "false";

    if (dom.volumeBtn) {
        dom.volumeBtn.setAttribute(
            "aria-label",
            state.isSoundEnabled ? "Выключить звук" : "Включить звук"
        );
        dom.volumeBtn.setAttribute(
            "aria-pressed",
            state.isSoundEnabled ? "false" : "true"
        );
    }
}

function applySoundStateToMedia(root = document) {
    const mediaElements = [];

    if (root instanceof HTMLMediaElement) {
        mediaElements.push(root);
    }

    if (root.querySelectorAll) {
        mediaElements.push(...root.querySelectorAll("audio, video"));
    }

    mediaElements.forEach((media) => {
        if (media.dataset.recStudioSoundManaged === "false") return;

        if (!mediaMutedStates.has(media)) {
            const originalMuted = media.dataset.recStudioOriginalMuted === "true"
                ? true
                : media.dataset.recStudioOriginalMuted === "false"
                    ? false
                    : media.muted;

            mediaMutedStates.set(media, originalMuted);
        }

        media.muted = state.isSoundEnabled
            ? mediaMutedStates.get(media)
            : true;
    });
}

function setSoundEnabled(isEnabled) {
    state.isSoundEnabled = Boolean(isEnabled);
    localStorage.setItem(
        SOUND_STORAGE_KEY,
        state.isSoundEnabled ? "true" : "false"
    );

    if (clickSound) {
        clickSound.muted = !state.isSoundEnabled;

        if (!state.isSoundEnabled) {
            clickSound.pause();
            clickSound.currentTime = 0;
        }
    }

    applySoundStateToMedia();
    updateVolumeIcon();

    window.dispatchEvent(new CustomEvent("recStudioSoundStateChange", {
        detail: { isEnabled: state.isSoundEnabled }
    }));
}

function initSound() {
    const savedSoundState = localStorage.getItem(SOUND_STORAGE_KEY);
    const shouldForceInitialSound = document.body.classList.contains("about-page");

    setSoundEnabled(shouldForceInitialSound || savedSoundState !== "false");

    if (dom.volumeBtn && dom.volumeBtn.dataset.soundReady !== "true") {
        dom.volumeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const shouldEnableSound = !state.isSoundEnabled;

            setSoundEnabled(shouldEnableSound);
            playSound({ force: true });
        });

        dom.volumeBtn.dataset.soundReady = "true";
    }

    if (!mediaObserver) {
        mediaObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        applySoundStateToMedia(node);
                    }
                });
            });
        });

        mediaObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    window.addEventListener("storage", (event) => {
        if (event.key !== SOUND_STORAGE_KEY) return;

        setSoundEnabled(event.newValue !== "false");
    });
}

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

function setMenuLogoColor(menuLogo, color) {
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

function initMenuLogoMenuLink(menuLogo) {
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

function addGlowAnimation(element) {
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

function createMenuLogo() {
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

function initMenuLogoVisibility() {
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

const TEXT_REVEAL_DELAY = 1100;
const TEXT_REVEAL_DURATION = 850;
const LOGO_TO_MENU_DURATION = 1400;
const AUTO_MOVE_AFTER_TEXT_READY = 0;
const AUTO_MOVE_DELAY =
    TEXT_REVEAL_DELAY + TEXT_REVEAL_DURATION + AUTO_MOVE_AFTER_TEXT_READY;

let autoMoveTimer = null;

function revealUI() {
    if (!dom.main) return;

    dom.main.classList.remove("ui-hidden");
    dom.main.classList.add("ui-visible");

    state.isUIVisible = true;
}

function moveLogoToMenuTop() {
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
    logoClone.style.transition = `all ${LOGO_TO_MENU_DURATION}ms cubic-bezier(0.7, 0, 0.2, 1)`;
    logoClone.style.pointerEvents = "none";
    logoClone.style.border = "25px solid rgb(255, 0, 0)";
    logoClone.style.borderRadius = "50%";
    logoClone.style.backgroundColor = "transparent";
    logoClone.style.opacity = "0.8";

    document.body.appendChild(logoClone);

    dom.logo.style.opacity = "0";
    dom.logo.style.visibility = "hidden";

    requestAnimationFrame(() => {
        logoClone.style.top = targetTop + "px";
        logoClone.style.left = targetLeft + "px";
        logoClone.style.width = "40px";
        logoClone.style.height = "40px";
        logoClone.style.borderWidth = "12px";
    });

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

        revealUI();
        initMenuLogoVisibility();

        if (dom.logoWrapper) {
            dom.logoWrapper.style.display = "none";
        }

        document.dispatchEvent(new CustomEvent("recStudioLogoIntroComplete"));

        const shouldStayOnCurrentPage = dom.contentPage && !dom.hasContentLinks;

        if (!shouldStayOnCurrentPage) {
            window.location.href = getPageUrl("home");
        }
    }, LOGO_TO_MENU_DURATION + 50);
}

function scheduleAutoMoveToMenu() {
    clearTimeout(autoMoveTimer);

    autoMoveTimer = setTimeout(() => {
        if (!dom.logoWrapper) return;

        const isTextVisible = dom.logoWrapper.classList.contains("text-visible");

        if (
            isTextVisible &&
            !state.isLogoInMenu &&
            !state.isLogoMovingToMenu
        ) {
            moveLogoToMenuTop();
        }
    }, AUTO_MOVE_DELAY);
}

function resetLogoPosition() {
    if (!dom.logo || !dom.logoWrapper) return;

    clearTimeout(autoMoveTimer);
    autoMoveTimer = null;

    state.isLogoInMenu = false;
    state.isLogoMovingToMenu = false;
    state.clickCount = 0;

    const menuLogo =
        dom.main && dom.menuSection
            ? dom.menuSection.querySelector(".menu__logo-cont")
            : null;

    if (menuLogo && menuLogo.remove) {
        menuLogo.remove();
    }

    if (dom.main) {
        dom.main.classList.remove("menu-logo-ready");
    }

    dom.logoWrapper.classList.remove("active", "logo-shifted", "text-visible");

    dom.logo.classList.remove("is-pressed");
    dom.logo.classList.add("is-red");

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

function initIntroLogo(playSound) {
    if (!dom.logo || !dom.logoWrapper) return;

    dom.logo.classList.add("is-red");

    dom.logo.addEventListener("pointerdown", () => {
        dom.logo.classList.add("is-pressed");
    });

    window.addEventListener("pointerup", () => {
        dom.logo.classList.remove("is-pressed");
    });

    dom.logo.addEventListener("pointerleave", () => {
        dom.logo.classList.remove("is-pressed");
    });

    dom.logo.addEventListener("click", (e) => {
        e.stopPropagation();

        if (state.isLogoMovingToMenu || state.isLogoInMenu) return;

        playSound();

        dom.logo.classList.add("is-red");

        if (state.isUIVisible && !state.isLogoMovingToMenu) {
            resetScene();
            return;
        }

        if (!dom.logoWrapper.classList.contains("logo-shifted")) {
            dom.logoWrapper.classList.add("logo-shifted");

            setTimeout(() => {
                if (
                    dom.logoWrapper.classList.contains("logo-shifted") &&
                    !state.isLogoInMenu &&
                    !state.isLogoMovingToMenu
                ) {
                    dom.logoWrapper.classList.add("text-visible");
                }
            }, TEXT_REVEAL_DELAY);

            scheduleAutoMoveToMenu();
        }
    });
}

function resetScene() {
    if (!dom.main || !dom.logoWrapper) return;

    clearTimeout(autoMoveTimer);
    autoMoveTimer = null;

    dom.main.classList.remove("ui-visible");
    dom.main.classList.add("ui-hidden");
    dom.main.classList.remove("menu-logo-ready");

    dom.logoWrapper.classList.remove("active", "logo-shifted", "text-visible");

    state.progress = 0;
    state.targetProgress = 0;
    state.isUIVisible = false;
    state.clickCount = 0;
    state.aboutTitleEntryProgress = 0;
    state.aboutTitleEntryDone = false;
    state.aboutTitleScrollIntroStarted = false;
    state.aboutTitleScrollIntroStartTime = 0;
    state.aboutTitleScrollIntroComplete = false;
    state.aboutDescriptionAutoScrollStarted = false;
    state.aboutDescriptionAutoScrollComplete = false;
    state.aboutDescriptionAutoScrollStartTime = 0;
    state.aboutDescriptionAutoScrollStartProgress = 0;

    resetLogoPosition();

    Promise.resolve().then(function () { return aboutParallax; }).then(({ updateScene }) => {
        updateScene(0);
    });

    initMenuLogoVisibility();
}

let scrollbar = null;
let scrollbarTrack = null;
let scrollbarFill = null;
let scrollbarSegments = null;

function getSectionsCount() {
    return Math.max(1, Number(state.pageSectionsCount || 1));
}

function getProgressRange() {
    const stops = Array.isArray(state.pageProgressStops)
        ? state.pageProgressStops.map(Number).filter(Number.isFinite)
        : [];

    if (stops.length >= 2) {
        return {
            first: 0,
            last: Math.max(stops[stops.length - 1], 1),
            stops
        };
    }

    return {
        first: 0,
        last: Math.max(1, Number(state.pageProgressMax || 1)),
        stops: []
    };
}

function getNormalizedProgress(progressValue) {
    const { first, last } = getProgressRange();
    const distance = Math.max(last - first, 0.0001);
    const progress = Math.max(first, Math.min(last, progressValue));

    return Math.max(0, Math.min(1, (progress - first) / distance));
}

function getScrollbarElements() {
    scrollbar =
        document.querySelector(".page-scrollbar") ||
        document.querySelector(".scrollbar") ||
        document.querySelector(".menu-scrollbar");

    if (!scrollbar) return;

    scrollbarTrack =
        scrollbar.querySelector(".page-scrollbar__track") ||
        scrollbar.querySelector(".scrollbar__track") ||
        scrollbar;

    scrollbarFill =
        scrollbar.querySelector(".page-scrollbar__fill") ||
        scrollbar.querySelector(".scrollbar__fill") ||
        scrollbar.querySelector(".scrollbar-fill");

    scrollbarSegments = scrollbar.querySelector(".page-scrollbar__segments");

    if (!scrollbarSegments) {
        scrollbarSegments = document.createElement("div");
        scrollbarSegments.className = "page-scrollbar__segments";
        scrollbar.appendChild(scrollbarSegments);
    }
}

function createScrollbarIfMissing() {
    const menu = document.querySelector(".menu");

    if (!menu) return;

    getScrollbarElements();

    if (scrollbar) return;

    scrollbar = document.createElement("div");
    scrollbar.className = "page-scrollbar";

    scrollbarTrack = document.createElement("div");
    scrollbarTrack.className = "page-scrollbar__track";

    scrollbarFill = document.createElement("div");
    scrollbarFill.className = "page-scrollbar__fill";

    scrollbarSegments = document.createElement("div");
    scrollbarSegments.className = "page-scrollbar__segments";

    scrollbarTrack.appendChild(scrollbarFill);
    scrollbar.appendChild(scrollbarTrack);
    scrollbar.appendChild(scrollbarSegments);

    menu.appendChild(scrollbar);
}

function renderSegments() {
    if (!scrollbarSegments) return;

    const sectionsCount = getSectionsCount();
    const { first, last, stops } = getProgressRange();
    const distance = Math.max(last - first, 0.0001);

    scrollbarSegments.innerHTML = "";

    if (sectionsCount <= 1) return;

    const segmentPositions = stops.length >= 2
        ? stops.slice(1, -1).map((stop) => ((stop - first) / distance) * 100)
        : Array.from(
            { length: sectionsCount - 1 },
            (_, index) => ((index + 1) / sectionsCount) * 100
        );

    segmentPositions.forEach((position) => {
        const segment = document.createElement("span");

        segment.className = "page-scrollbar__segment";
        segment.style.top = `${Math.max(0, Math.min(100, position))}%`;

        scrollbarSegments.appendChild(segment);
    });
}

function initPageScrollbar() {
    createScrollbarIfMissing();
    getScrollbarElements();
    renderSegments();
    updatePageScrollbar(state.progress || 0);
}

function updatePageScrollbar(progressValue = 0) {
    if (!scrollbar || !scrollbarFill || !scrollbarSegments) {
        createScrollbarIfMissing();
        getScrollbarElements();
        renderSegments();
    }

    if (!scrollbarFill) return;

    const progress = getNormalizedProgress(progressValue);

    scrollbarFill.style.transform = `translateZ(0) scaleY(${Math.min(1, Math.max(0, progress))})`;

    scrollbarSegments
        ?.querySelectorAll(".page-scrollbar__segment")
        .forEach((segment) => {
            const segmentProgress = (parseFloat(segment.style.top) || 0) / 100;

            segment.classList.toggle("is-passed", progress >= segmentProgress);
        });
}

function setScrollbarScrollingState(isScrolling = false) {
    if (!scrollbar) {
        createScrollbarIfMissing();
        getScrollbarElements();
        renderSegments();
    }

    if (!scrollbar) return;

    scrollbar.classList.toggle("is-scrolling", Boolean(isScrolling));
}

const ABOUT_TITLE_STAGE_END = 0.18;
const ABOUT_PROJECTS_TALL_SCREEN_HOLD =
    window.innerWidth >= 1600 && window.innerHeight >= 1150 ? 0.54 : 0;

const ABOUT_PROJECTS_REVEAL_START = 1.04;
const ABOUT_PROJECTS_START = 1.24;
const ABOUT_PROJECTS_MAX = 3;

const ABOUT_HELP_REVEAL_START =
    4.18 + ABOUT_PROJECTS_TALL_SCREEN_HOLD;
const ABOUT_HELP_START =
    4.41 + ABOUT_PROJECTS_TALL_SCREEN_HOLD;
const ABOUT_HELP_MAX = 1.85;

const ABOUT_NEWS_REVEAL_START =
    6.28 + ABOUT_PROJECTS_TALL_SCREEN_HOLD;
const ABOUT_NEWS_START =
    6.45 + ABOUT_PROJECTS_TALL_SCREEN_HOLD;
const ABOUT_NEWS_MAX = 0.5;

const ABOUT_CONTACTS_REVEAL_START =
    6.78 + ABOUT_PROJECTS_TALL_SCREEN_HOLD;
const ABOUT_CONTACTS_START =
    6.94 + ABOUT_PROJECTS_TALL_SCREEN_HOLD;

const ABOUT_PAGE_MAX_PROGRESS =
    7.34 + ABOUT_PROJECTS_TALL_SCREEN_HOLD;

const ABOUT_PAGE_SCROLL_STOPS = [
    ABOUT_TITLE_STAGE_END,
    ABOUT_PROJECTS_REVEAL_START,
    ABOUT_PROJECTS_START,
    ABOUT_HELP_REVEAL_START,
    ABOUT_HELP_START,
    ABOUT_NEWS_REVEAL_START,
    ABOUT_NEWS_START,
    ABOUT_CONTACTS_REVEAL_START,
    ABOUT_CONTACTS_START,
    ABOUT_PAGE_MAX_PROGRESS
];

let positionAboutTextScrollbar$1 = () => {};
let updateAboutTextScrollbar$1 = () => {};

const WHEEL_MIN_DELTA = 4;
const WHEEL_SEGMENT_STEPS = 32;
const EPSILON = 0.0001;

function setAboutTextScrollbarHandlers(handlers = {}) {
    positionAboutTextScrollbar$1 = handlers.positionAboutTextScrollbar || positionAboutTextScrollbar$1;
    updateAboutTextScrollbar$1 = handlers.updateAboutTextScrollbar || updateAboutTextScrollbar$1;
}

function showUI() {
    if (!dom.main) return;

    if (!state.isUIVisible) {
        dom.main.classList.remove("ui-hidden");
        dom.main.classList.add("ui-visible");
        state.isUIVisible = true;
    }

    if (!state.isLogoMovingToMenu) {
        initMenuLogoVisibility();
    }
}

function getProgressStops(minProgress, maxProgress) {
    const sourceStops = Array.isArray(state.pageProgressStops)
        ? state.pageProgressStops
        : null;

    const stops = sourceStops && sourceStops.length > 1
        ? sourceStops
        : [minProgress, Math.min(1, maxProgress), maxProgress];

    return [...new Set(
        stops
            .map((value) => Math.max(minProgress, Math.min(maxProgress, value)))
            .sort((a, b) => a - b)
    )].filter((value, index, array) => {
        return index === 0 || Math.abs(value - array[index - 1]) > EPSILON;
    });
}

function getNextTargetProgress(direction, minProgress, maxProgress) {
    const stops = getProgressStops(minProgress, maxProgress);
    const current = Math.max(
        minProgress,
        Math.min(maxProgress, state.targetProgress)
    );

    if (stops.length < 2) {
        return direction > 0 ? maxProgress : minProgress;
    }

    if (direction > 0) {
        const nextStop = stops.find((stop) => stop > current + EPSILON) ?? maxProgress;
        const nextIndex = stops.indexOf(nextStop);
        const prevStop = nextIndex > 0 ? stops[nextIndex - 1] : minProgress;
        const step = (nextStop - prevStop) / WHEEL_SEGMENT_STEPS;

        return Math.min(nextStop, current + step);
    }

    const prevStop = [...stops]
        .reverse()
        .find((stop) => stop < current - EPSILON) ?? minProgress;
    const prevIndex = stops.indexOf(prevStop);
    const nextStop = prevIndex >= 0 && prevIndex < stops.length - 1
        ? stops[prevIndex + 1]
        : maxProgress;
    const step = (nextStop - prevStop) / WHEEL_SEGMENT_STEPS;

    return Math.max(prevStop, current - step);
}

function handleVirtualScroll(e) {
    if (isContactsPage) {
        e.preventDefault();
        updatePageScrollbar(0);
        return;
    }

    e.preventDefault();

    showUI();

    const isAboutTitleStage =
        document.body.classList.contains("about-page") &&
        !state.aboutTitleScrollIntroComplete;

    if (isAboutTitleStage) {
        return;
    }

    const maxProgress = state.pageProgressMax || 1;
    const minProgress =
        document.body.classList.contains("about-page") &&
        state.aboutTitleScrollIntroComplete
            ? ABOUT_TITLE_STAGE_END
            : 0;

    if (Math.abs(e.deltaY) < WHEEL_MIN_DELTA) {
        return;
    }

    state.targetProgress = getNextTargetProgress(
        Math.sign(e.deltaY),
        minProgress,
        maxProgress
    );

    setScrollbarScrollingState();
}

function initScroll() {
    if (dom.aboutInfoText) {
        dom.aboutInfoText.addEventListener(
            "wheel",
            (e) => {
                const overflowY = window.getComputedStyle(dom.aboutInfoText).overflowY;
                const hasOwnScroll =
                    (overflowY === "auto" || overflowY === "scroll") &&
                    dom.aboutInfoText.scrollHeight > dom.aboutInfoText.clientHeight + 1;

                if (!hasOwnScroll) {
                    return;
                }

                const delta = e.deltaY;

                const atTop = dom.aboutInfoText.scrollTop <= 0;
                const atBottom =
                    dom.aboutInfoText.scrollTop + dom.aboutInfoText.clientHeight >=
                    dom.aboutInfoText.scrollHeight - 1;

                const canScrollUp = delta < 0 && !atTop;
                const canScrollDown = delta > 0 && !atBottom;

                if (canScrollUp || canScrollDown) {
                    e.stopPropagation();
                    e.preventDefault();

                    dom.aboutInfoText.scrollTop += delta;

                    requestAnimationFrame(() => {
                        positionAboutTextScrollbar$1();
                        updateAboutTextScrollbar$1();
                    });
                }
            },
            { passive: false }
        );
    }

    if (dom.contentPage) {
        dom.contentPage.addEventListener("wheel", handleVirtualScroll, {
            passive: false
        });
    } else {
        window.addEventListener("wheel", handleVirtualScroll, {
            passive: false
        });
    }
}

const WINDOWS_1252_BYTES = new Map([
    [0x20ac, 0x80],
    [0x201a, 0x82],
    [0x0192, 0x83],
    [0x201e, 0x84],
    [0x2026, 0x85],
    [0x2020, 0x86],
    [0x2021, 0x87],
    [0x02c6, 0x88],
    [0x2030, 0x89],
    [0x0160, 0x8a],
    [0x2039, 0x8b],
    [0x0152, 0x8c],
    [0x017d, 0x8e],
    [0x2018, 0x91],
    [0x2019, 0x92],
    [0x201c, 0x93],
    [0x201d, 0x94],
    [0x2022, 0x95],
    [0x2013, 0x96],
    [0x2014, 0x97],
    [0x02dc, 0x98],
    [0x2122, 0x99],
    [0x0161, 0x9a],
    [0x203a, 0x9b],
    [0x0153, 0x9c],
    [0x017e, 0x9e],
    [0x0178, 0x9f]
]);

const decoder = new TextDecoder("utf-8");
const MOJIBAKE_RE = /[ÐÑÂâ][\u0080-\uffff]?/;
const BAD_RE = /[ÐÑÂâ][\u0080-\uffff]?|�/g;
const CYRILLIC_RE = /[А-Яа-яЁё]/g;
const TEXT_ATTRS = ["alt", "aria-label", "title", "data-help-title", "data-text"];

function countMatches(value, pattern) {
    return (value.match(pattern) || []).length;
}

function encodeMojibakeBytes(value) {
    const bytes = [];

    for (const char of value) {
        const code = char.codePointAt(0);

        if (code <= 0xff) {
            bytes.push(code);
            continue;
        }

        const byte = WINDOWS_1252_BYTES.get(code);

        if (byte === undefined) {
            return null;
        }

        bytes.push(byte);
    }

    return bytes;
}

function decodeMojibake(value) {
    if (!value || !MOJIBAKE_RE.test(value)) return value;

    const bytes = encodeMojibakeBytes(value);
    if (!bytes) return value;

    const decoded = decoder.decode(new Uint8Array(bytes));

    const originalBad = countMatches(value, BAD_RE);
    const decodedBad = countMatches(decoded, BAD_RE);
    const originalCyrillic = countMatches(value, CYRILLIC_RE);
    const decodedCyrillic = countMatches(decoded, CYRILLIC_RE);

    if (
        decodedBad < originalBad &&
        (decodedCyrillic > originalCyrillic || originalBad > 1)
    ) {
        return decoded;
    }

    return value;
}

function normalizeMojibake(root = document.body) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;

            if (!parent) return NodeFilter.FILTER_REJECT;
            if (/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
            }

            return MOJIBAKE_RE.test(node.nodeValue || "")
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
        }
    });

    const textNodes = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
        node.nodeValue = decodeMojibake(node.nodeValue);
    });

    root.querySelectorAll?.("*").forEach((element) => {
        TEXT_ATTRS.forEach((attr) => {
            if (!element.hasAttribute(attr)) return;

            element.setAttribute(attr, decodeMojibake(element.getAttribute(attr)));
        });
    });
}

const LINK_IMAGES = {
    faq: "faq.jpg",
    projects: "b.jpg",
    help: "a.jpg",
    news: "news.jpg",
    contact: "contact.png"
};

function initContentLinksImages() {
    const links = document.querySelectorAll(".content__links__item");

    links.forEach((link) => {
        const baseClass = "content__links__item";

        const imageClass = Array.from(link.classList).find(
            (className) => className !== baseClass
        );

        if (!imageClass) return;

        const imageName = LINK_IMAGES[imageClass] || `${imageClass}.png`;
        const imageUrl = getAssetUrl(`assets/${imageName}`);

        const linkText = decodeMojibake(link.textContent.trim());

        link.textContent = linkText;
        link.dataset.text = linkText;
        link.style.setProperty("--hover-bg", `url("${imageUrl}")`);
    });
}

function initPageTransitions() {
    const links = document.querySelectorAll(".content__links__item");

    links.forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            e.preventDefault();

            document.body.classList.add("page-leaving");

            setTimeout(() => {
                window.location.href = href;
            }, 500);
        });
    });
}

function initMenuReturnToIndex() {
    document.addEventListener(
        "click",
        (e) => {
            const link = e.target.closest("a[href]");
            const menuLink = link && link.href === getPageUrl("menu");

            const menuBlock = e.target.closest(".menu-block");

            if (menuLink || (!dom.hasContentLinks && menuBlock)) {
                sessionStorage.setItem("recStudioSkipIntro", "true");
            }
        },
        true
    );
}

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
const ABOUT_PARALAX_TEXT_MOVE_PERCENT$1 = 285;
const ABOUT_PARALAX_REFERENCE_HEIGHT$1 = 1200;
const PAGE_SCROLL_EASE = 0.045;

let setInitialImagePosition$1 = () => {};
let updateScene$1 = () => {};
let updateProjectsScene$1 = () => {};
let updateHelpScene$1 = () => {};
let updateAboutProjectsSection$1 = () => {};
let updateAboutHelpSection$1 = () => {};
let updateAboutNewsSection$1 = () => {};
let updateAboutContactsSection$1 = () => {};
let lastRenderedProgress = Number.NaN;

function getAboutParalaxTextMovePercent$1() {
    if (window.innerWidth < 1600 || window.innerHeight >= ABOUT_PARALAX_REFERENCE_HEIGHT$1) {
        return ABOUT_PARALAX_TEXT_MOVE_PERCENT$1;
    }

    return ABOUT_PARALAX_TEXT_MOVE_PERCENT$1 *
        (ABOUT_PARALAX_REFERENCE_HEIGHT$1 / Math.max(window.innerHeight, 1));
}

function easeIntroExit(progress) {
    const x = Math.max(0, Math.min(1, progress));

    return x * (0.62 + 0.38 * x);
}

function smoothstep$5(progress) {
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
        Math.min(1, textMovePercent / getAboutParalaxTextMovePercent$1())
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
            aboutTextScrollbar$1,
            aboutParallax$1,
            aboutProjects,
            aboutHelp,
            aboutNews,
            aboutContacts
        ] = await Promise.all([
            Promise.resolve().then(function () { return aboutTextScrollbar; }),
            Promise.resolve().then(function () { return aboutParallax; }),
            Promise.resolve().then(function () { return aboutProjectsSection; }),
            Promise.resolve().then(function () { return aboutHelpSection; }),
            Promise.resolve().then(function () { return aboutNewsSection; }),
            Promise.resolve().then(function () { return aboutContactsSection; })
        ]);

        setInitialImagePosition$1 = aboutParallax$1.setInitialImagePosition;
        updateScene$1 = aboutParallax$1.updateScene;
        setAboutTextScrollbarHandlers({
            positionAboutTextScrollbar: aboutTextScrollbar$1.positionAboutTextScrollbar,
            updateAboutTextScrollbar: aboutTextScrollbar$1.updateAboutTextScrollbar
        });
        updateAboutProjectsSection$1 = aboutProjects.updateAboutProjectsSection;
        updateAboutHelpSection$1 = aboutHelp.updateAboutHelpSection;
        updateAboutNewsSection$1 = aboutNews.updateAboutNewsSection;
        updateAboutContactsSection$1 = aboutContacts.updateAboutContactsSection;

        aboutTextScrollbar$1.initAboutTextScrollbar();
        aboutParallax$1.initAboutParallax();
        aboutProjects.initAboutProjectsSection();
        aboutHelp.initAboutHelpSection();
        aboutNews.initAboutNewsSection();
        aboutContacts.initAboutContactsSection();
        setInitialImagePosition$1();
        return;
    }

    if (isProjectsPage) {
        const [projectsParallax$1, projectCardHover$1] = await Promise.all([
            Promise.resolve().then(function () { return projectsParallax; }),
            Promise.resolve().then(function () { return projectCardHover; })
        ]);

        updateProjectsScene$1 = projectsParallax$1.updateProjectsScene;
        projectsParallax$1.initProjectsParallax();
        projectCardHover$1.initProjectCardHover();
        return;
    }

    if (isHelpPage) {
        const helpParallax$1 = await Promise.resolve().then(function () { return helpParallax; });

        updateHelpScene$1 = helpParallax$1.updateHelpScene;
        helpParallax$1.initHelpParallax();
    }
}

function renderPage(force = false) {
    if (!force && Math.abs(state.progress - lastRenderedProgress) < 0.0005) {
        return;
    }

    lastRenderedProgress = state.progress;

    if (isProjectsPage) {
        updateProjectsScene$1(state.progress);
    } else if (isHelpPage) {
        updateHelpScene$1(state.progress);
    } else if (isAboutPage) {
        updateScene$1(state.progress);
        updateAboutProjectsSection$1(state.progress);
        updateAboutHelpSection$1(state.progress);
        updateAboutNewsSection$1(state.progress);
        updateAboutContactsSection$1(state.progress);
    } else {
        updatePageScrollbar(state.progress);
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

            const easedProgress = smoothstep$5(progress);
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

    Promise.resolve().then(function () { return debug; })
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
        setInitialImagePosition$1();
    }

    renderPage(true);
    updatePageScrollbar(state.progress);
});

function initAboutTextScrollbar() {
    if (!dom.aboutInfoText) return;

    const aboutInfo = dom.aboutInfoText.closest(".about-info");
    if (!aboutInfo) return;

    aboutInfo.style.position = "relative";

    state.aboutTextScrollbar = document.createElement("div");
    state.aboutTextScrollbar.className = "about-text-scrollbar";

    state.aboutTextScrollbarFill = document.createElement("div");
    state.aboutTextScrollbarFill.className = "about-text-scrollbar__fill";

    state.aboutTextScrollbar.appendChild(state.aboutTextScrollbarFill);

    aboutInfo.appendChild(state.aboutTextScrollbar);

    positionAboutTextScrollbar();
    updateAboutTextScrollbar();

    dom.aboutInfoText.addEventListener("scroll", updateAboutTextScrollbar);

    window.addEventListener("resize", () => {
        positionAboutTextScrollbar();
        updateAboutTextScrollbar();
    });
}

function positionAboutTextScrollbar() {
    if (!dom.aboutInfoText || !state.aboutTextScrollbar) return;

    const aboutInfo = dom.aboutInfoText.closest(".about-info");
    if (!aboutInfo) return;

    const textRect = dom.aboutInfoText.getBoundingClientRect();
    const infoRect = aboutInfo.getBoundingClientRect();

    const textStyles = window.getComputedStyle(dom.aboutInfoText);
    const scrollbarInset = Math.max(
        10,
        Math.min(44, Number.parseFloat(textStyles.paddingRight) / 2 || 0)
    );
    const textContainerHeight =
        Number.parseFloat(textStyles.height) || textRect.height;
    const scrollbarHeight = textContainerHeight / 2;

    const top = textRect.top - infoRect.top;

    const left = textRect.right - infoRect.left - scrollbarInset;

    state.aboutTextScrollbar.style.top = `${top}px`;
    state.aboutTextScrollbar.style.left = `${left}px`;
    state.aboutTextScrollbar.style.height = `${scrollbarHeight}px`;
}

function updateAboutTextScrollbar() {
    if (!dom.aboutInfoText || !state.aboutTextScrollbarFill) return;

    const aboutInfo = dom.aboutInfoText.closest(".about-info");
    if (!aboutInfo) return;

    const scrollableHeight =
        dom.aboutInfoText.scrollHeight - dom.aboutInfoText.clientHeight;
    const hasScroll = scrollableHeight > 2;

    aboutInfo.classList.toggle("has-scroll", hasScroll);

    if (!hasScroll) {
        state.aboutTextScrollbarFill.style.height = "0%";
        state.aboutTextScrollbarFill.style.transform = "translateY(0)";
        return;
    }

    const progress = dom.aboutInfoText.scrollTop / scrollableHeight;
    const visibleRatio =
        dom.aboutInfoText.clientHeight / dom.aboutInfoText.scrollHeight;

    const fillHeight = Math.max(14, visibleRatio * 100);
    const maxMove = 100 - fillHeight;

    state.aboutTextScrollbarFill.style.height = `${fillHeight}%`;
    state.aboutTextScrollbarFill.style.transform =
        `translateY(${progress * maxMove}%)`;
}

var aboutTextScrollbar = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initAboutTextScrollbar: initAboutTextScrollbar,
    positionAboutTextScrollbar: positionAboutTextScrollbar,
    updateAboutTextScrollbar: updateAboutTextScrollbar
});

const ABOUT_INTRO_TITLE_START_SIZE = 0.1;
const ABOUT_INTRO_TITLE_ENTRY_SIZE = 15;
const ABOUT_INTRO_TITLE_MAX_SIZE = 625;

function clamp$6(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange$5(value, inMin, inMax, outMin, outMax) {
    const progress = clamp$6((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}

function smoothstep$4(value) {
    const x = clamp$6(value, 0, 1);
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

    return clamp$6(textMovePercent / getAboutParalaxTextMovePercent(), 0, 1);
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
            })
            .catch(scheduleAboutIntroAmbientRevealRetry);
        return;
    }

    audio.muted = false;
    aboutIntroAmbientRevealed = true;
    clearAboutIntroAmbientRevealRetry();
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

function setAboutIntroAmbientVolume(volume = ABOUT_INTRO_AMBIENT_VOLUME) {
    const audio = getAboutIntroAmbientAudio();
    if (!audio) return;

    audio.volume = clamp$6(volume, 0, ABOUT_INTRO_AMBIENT_VOLUME);
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

    const fadeRatio = clamp$6(
        titleTop / ABOUT_INTRO_AMBIENT_FADE_DISTANCE,
        0.06,
        1
    );

    setAboutIntroAmbientVolume(ABOUT_INTRO_AMBIENT_VOLUME * fadeRatio);
    playAboutIntroAmbient();
}

function setParalaxTextTransform(paralaxText, rawTextMove) {
    if (!paralaxText) return;

    const translatePercent = 100 - Math.max(rawTextMove, 0);

    paralaxText.style.transform = `translateY(${translatePercent}%)`;

}

function syncTitleBackgroundWithImage(baseImg, title) {
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

function syncAboutImageAndTitle(progressValue) {
    const { baseImg, title } = getSceneElements();

    const imageStopProgress = getAboutTextReachTopProgress();
    const imageProgress = mapRange$5(progressValue, 0, imageStopProgress, 0, 1);
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

    const introProgress = clamp$6(progressValue / ABOUT_TITLE_STAGE_END, 0, 1);
    const titleFontSize = mapRange$5(
        introProgress,
        0,
        1,
        ABOUT_INTRO_TITLE_START_SIZE,
        ABOUT_INTRO_TITLE_MAX_SIZE
    );

    const backgroundTransitionProgress = smoothstep$4(
        mapRange$5(introProgress, 0.75, 1, 0, 1)
    );
    const titleTransitionProgress = smoothstep$4(
        mapRange$5(introProgress, 0.9, 1, 0, 1)
    );

    const titleOpacity = mapRange$5(
        titleTransitionProgress,
        0,
        1,
        1,
        0
    );

    const imageOpacity = mapRange$5(
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

    const sceneProgress = mapRange$5(
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

function setInitialImagePosition() {
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

function updateScene(p) {
    const progress = state.aboutTitleScrollIntroComplete
        ? clamp$6(p, ABOUT_TITLE_STAGE_END, 1)
        : clamp$6(p, 0, 1);

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
function initAboutParallax() {
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

var aboutParallax = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initAboutParallax: initAboutParallax,
    setInitialImagePosition: setInitialImagePosition,
    syncAboutImageAndTitle: syncAboutImageAndTitle,
    syncTitleBackgroundWithImage: syncTitleBackgroundWithImage,
    updateScene: updateScene
});

let isReady$3 = false;
let isLoading$3 = false;

const PREVIEW_LIMIT = 10;
const PREVIEW_PROJECT_ORDER = [
    ["tayna-molebki.jpg"],
    ["izolyatsiya.jpg"],
    ["alchnost.jpg"],
    ["syschik.jpg"],
    ["storozh.jpg"],
    ["semeyny-patrul.jpg"],
    ["dikaya-diviziya.jpg"],
    ["gromkoe-delo.jpg"],
    ["spetsnaz.jpg"],
    ["nashi-mamashi.jpg"]
];
const FALLBACK_PREVIEW_PROJECTS = [
    {
        title: "Тайна Молебки",
        genre: "Исторический детектив с элементами мистики",
        image: "assets/tayna-molebki.jpg",
        age: "18+",
        format: "Сериал",
        duration: "8 серий"
    },
    {
        title: "Изоляция",
        genre: "Научно-фантастический триллер",
        image: "assets/izolyatsiya.jpg",
        age: "18+",
        format: "Сериал",
        duration: "8 серий"
    },
    {
        title: "Алчность",
        genre: "Детектив, авантюрная мелодрама",
        image: "assets/alchnost.jpg",
        age: "18+",
        format: "Сериал",
        duration: "8 серий"
    },
    {
        title: "Сыщик с Малого Гнездовского",
        genre: "Исторический детектив",
        image: "assets/syschik.jpg",
        age: "18+",
        format: "Сериал",
        duration: "8 серий"
    },
    {
        title: "Сторож",
        genre: "Фантастика, триллер",
        image: "assets/storozh.jpg",
        age: "18+",
        format: "Сериал",
        duration: "8 серий"
    },
    {
        title: "Семейный патруль",
        genre: "Семейное ток-шоу",
        image: "assets/semeyny-patrul.jpg",
        age: "16+",
        format: "ТВ-проект",
        duration: "56 выпусков"
    },
    {
        title: "Дикая дивизия",
        genre: "Шпионский детектив",
        image: "assets/dikaya-diviziya.jpg",
        age: "18+",
        format: "Сериал",
        duration: "4 серии"
    },
    {
        title: "Громкое дело",
        genre: "Реалити-шоу выходного дня",
        image: "assets/gromkoe-delo.jpg",
        age: "12+",
        format: "ТВ-проект",
        duration: "52 мин."
    },
    {
        title: "Специальное назначение",
        genre: "Политический триллер",
        image: "assets/spetsnaz.jpg",
        age: "18+",
        format: "Сериал",
        duration: "10 серий"
    },
    {
        title: "Наши мамаши",
        genre: "Ситком",
        image: "assets/nashi-mamashi.jpg",
        age: "6+",
        format: "Сериал",
        duration: "20 серий"
    }
];
const ABOUT_PROJECTS_SCROLL_END = 2.94;

function clamp$5(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange$4(value, inMin, inMax, outMin, outMax) {
    const progress = clamp$5((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}
function smoothstep$3(value) {
    const x = clamp$5(value, 0, 1);
    return x * x * (3 - 2 * x);
}

function mapRangeSmooth$3(value, inMin, inMax, outMin, outMax) {
    const progress = smoothstep$3((value - inMin) / (inMax - inMin));
    return outMin + (outMax - outMin) * progress;
}

function getElements$3() {
    return {
        section: document.querySelector(".about-projects-section"),
        bgImg: document.querySelector(".about-projects-bg__img"),
        stage: document.querySelector(".about-projects-stage"),
        titleLayer: document.querySelector(".about-projects-paralax-text"),
        title: document.querySelector(".about-projects__title"),
        preview: document.querySelector(".about-projects-preview"),

        detail: document.querySelector(".about-projects-detail"),
        detailImg: document.querySelector(".about-projects-detail__img"),
        detailTitle: document.querySelector(".about-projects-detail__title"),
        detailGenre: document.querySelector(".about-projects-detail__genre"),
        detailNote: document.querySelector(".about-projects-detail__note"),
        detailDescription: document.querySelector(".about-projects-detail__description"),
        detailText: document.querySelector(".about-projects-detail__text"),
        detailScrollbarFill: document.querySelector(".about-projects-detail__scrollbar-fill"),
        detailAge: document.querySelector(".about-projects-detail__age"),
        detailFormat: document.querySelector(".about-projects-detail__format"),
        detailDuration: document.querySelector(".about-projects-detail__duration"),
        detailClose: document.querySelector(".about-projects-detail__close"),
        detailBackButtons: document.querySelectorAll(".about-projects-detail__nav"),

        requestPopup: document.querySelector(".about-projects-request-popup"),
        requestPopupClose: document.querySelector(".about-projects-request-popup__close"),
        requestForm: document.querySelector(".about-projects-request-form"),
        requestProjectInput: document.querySelector(".about-projects-request-form__project")
    };
}

const CLASS_MAP = {
    "project-detail": "about-projects-detail",
    "project-detail__media": "about-projects-detail__media",
    "project-detail__img": "about-projects-detail__img",
    "project-detail__content": "about-projects-detail__content",
    "project-detail__close": "about-projects-detail__close",
    "project-detail__top": "about-projects-detail__top",
    "project-detail__title": "about-projects-detail__title",
    "project-detail__genre": "about-projects-detail__genre",
    "project-detail__note": "about-projects-detail__note",
    "project-detail__text-wrap": "about-projects-detail__text-wrap",
    "project-detail__text": "about-projects-detail__text",
    "project-detail__scrollbar": "about-projects-detail__scrollbar",
    "project-detail__scrollbar-fill": "about-projects-detail__scrollbar-fill",
    "project-detail__description": "about-projects-detail__description",
    "project-detail__meta": "about-projects-detail__meta",
    "project-detail__age": "about-projects-detail__age",
    "project-detail__divider": "about-projects-detail__divider",
    "project-detail__format": "about-projects-detail__format",
    "project-detail__duration": "about-projects-detail__duration",
    "project-detail__status": "about-projects-detail__status",
    "project-detail__bottom": "about-projects-detail__bottom",
    "project-detail__teaser": "about-projects-detail__teaser",
    "project-detail__nav": "about-projects-detail__nav",
    "project-detail__request": "about-projects-detail__request",

    "projects-request-popup": "about-projects-request-popup",
    "projects-request-popup__container": "about-projects-request-popup__container",
    "projects-request-popup__dialog": "about-projects-request-popup__dialog",
    "projects-request-popup__close": "about-projects-request-popup__close",
    "projects-request-popup__title": "about-projects-request-popup__title",
    "projects-request-form": "about-projects-request-form",
    "projects-request-form__project": "about-projects-request-form__project",
    "projects-request-form__row": "about-projects-request-form__row",
    "projects-request-form__row--options": "about-projects-request-form__row--options",
    "projects-request-form__row--textarea": "about-projects-request-form__row--textarea",
    "projects-request-form__label": "about-projects-request-form__label",
    "projects-request-form__field": "about-projects-request-form__field",
    "projects-request-form__field--checks": "about-projects-request-form__field--checks",
    "projects-request-form__check": "about-projects-request-form__check",
    "projects-request-form__submit": "about-projects-request-form__submit",
    "projects-open-request": "about-projects-open-request"
};

function remapElementClasses$1(root) {
    root.querySelectorAll(".menu, .settings, script, link, style").forEach((node) => {
        node.remove();
    });

    root.querySelectorAll("*").forEach((element) => {
        const newClasses = Array.from(element.classList).map((className) => {
            return CLASS_MAP[className] || className;
        });

        element.className = newClasses.join(" ");
    });

    const rootClasses = Array.from(root.classList).map((className) => {
        return CLASS_MAP[className] || className;
    });

    root.className = rootClasses.join(" ");
}

function escapeHtml$1(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getEpisodesText$1(duration) {
    if (!duration) return "";

    const match = duration.match(/(\d+\s*сер(?:ия|ии|ий))/i);

    if (match) return match[1];

    return duration;
}

function getTitleSizeClass$1(title) {
    const cleanTitle = title.trim();
    const titleLength = cleanTitle.length;
    const wordsCount = cleanTitle.split(/\s+/).filter(Boolean).length;

    if (titleLength > 42 || wordsCount >= 5) return " is-ultra-long";
    if (titleLength > 30 || wordsCount >= 4) return " is-extra-long";
    if (titleLength > 18 || wordsCount >= 3) return " is-long";

    return "";
}

function getCardAssetName(card) {
    const src = card.querySelector("img")?.getAttribute("src") || "";
    const cleanSrc = src.split("?")[0].replace(/\\/g, "/");

    return cleanSrc.substring(cleanSrc.lastIndexOf("/") + 1).toLowerCase();
}

function getOrderedPreviewCards(cards) {
    const remaining = [...cards];
    const ordered = [];

    PREVIEW_PROJECT_ORDER.forEach((assetNames) => {
        const index = remaining.findIndex((card) => {
            const assetName = getCardAssetName(card);

            return assetNames.includes(assetName);
        });

        if (index >= 0) {
            ordered.push(remaining.splice(index, 1)[0]);
        }
    });

    return [...ordered, ...remaining];
}

function createFallbackSourceCard(project) {
    const card = document.createElement("article");
    const img = document.createElement("img");

    card.className = "project-card";
    card.dataset.projectTitle = project.title;
    card.dataset.projectGenre = project.genre;
    card.dataset.projectAge = project.age;
    card.dataset.projectFormat = project.format;
    card.dataset.projectDuration = project.duration;
    card.dataset.projectDescription =
        project.description || "Описание проекта находится в разработке.";

    img.src = getAssetUrl(project.image);
    img.alt = project.title;
    card.appendChild(img);

    return card;
}

function getFallbackPreviewCards() {
    return FALLBACK_PREVIEW_PROJECTS.map(createFallbackSourceCard);
}

function createPreviewCard(sourceCard) {
    const img = sourceCard.querySelector("img");

    const title = sourceCard.dataset.projectTitle || img?.alt || "";
    const genre = sourceCard.dataset.projectGenre || "";
    const age = sourceCard.dataset.projectAge || "";
    const duration = sourceCard.dataset.projectDuration || "";
    const episodes = getEpisodesText$1(duration);
    const titleSizeClass = getTitleSizeClass$1(title);

    const card = document.createElement("article");

    card.className = "about-projects-card";

    Array.from(sourceCard.attributes).forEach((attribute) => {
        if (attribute.name.startsWith("data-")) {
            card.setAttribute(attribute.name, attribute.value);
        }
    });

    card.innerHTML = `
        <img src="${escapeHtml$1(img?.getAttribute("src") || "")}" alt="${escapeHtml$1(img?.getAttribute("alt") || title)}" />

        <div class="about-projects-card__hover">
            <div class="about-projects-card__hover-top">
                <span>${escapeHtml$1(episodes)}</span>
                <span>${escapeHtml$1(age)}</span>
            </div>

            <div class="about-projects-card__hover-bottom">
                <h3 class="about-projects-card__hover-title${titleSizeClass}">
                    ${escapeHtml$1(title)}
                </h3>

                <p class="about-projects-card__hover-genre">${escapeHtml$1(genre)}</p>
            </div>
        </div>
    `;

    card.addEventListener("click", (e) => {
        if (document.body.classList.contains("about-projects-request-open")) return;

        e.preventDefault();
        e.stopPropagation();
        openDetail$1(card);
    });
    return card;
}

function buildSection(cards, detailNode, requestNode) {
    const { section } = getElements$3();

    if (!section) return;

    section.innerHTML = `
        <div class="about-projects-bg">
            <img
                src="${getAssetUrl("assets/b.jpg")}"
                class="about-projects-bg__img"
                alt="Наши проекты"
            />
        </div>

        <div class="about-projects-stage">
            <section class="about-projects-hero">
                <div class="about-projects-paralax-text">
                    <h2 class="about-projects__title">НАШИ ПРОЕКТЫ</h2>

                    <p class="about-projects__subtitle">
                        Мы готовы предложить<br />
                        вашему вниманию
                    </p>

                    <div class="about-projects-services-viewport">
                        <div class="about-projects-services">
                            <div class="about-projects-service">
                                <span></span>
                                <p>свои<br />сценарии</p>
                            </div>

                            <div class="about-projects-service">
                                <span></span>
                                <p>осуществить<br />разработку<br />вашего проекта</p>
                            </div>

                            <div class="about-projects-service">
                                <span></span>
                                <p>участвовать<br />в совместном<br />производстве</p>
                            </div>

                            <div class="about-projects-service">
                                <span></span>
                                <p>кино, сериалы<br />и тв-проекты</p>
                            </div>

                            <div class="about-projects-service">
                                <span></span>
                                <p>док.фильмы</p>
                            </div>

                            <div class="about-projects-service" aria-hidden="true">
                                <span></span>
                                <p>свои<br />сценарии</p>
                            </div>

                            <div class="about-projects-service" aria-hidden="true">
                                <span></span>
                                <p>осуществить<br />разработку<br />вашего проекта</p>
                            </div>

                            <div class="about-projects-service" aria-hidden="true">
                                <span></span>
                                <p>участвовать<br />в совместном<br />производстве</p>
                            </div>

                            <div class="about-projects-service" aria-hidden="true">
                                <span></span>
                                <p>кино, сериалы<br />и тв-проекты</p>
                            </div>

                            <div class="about-projects-service" aria-hidden="true">
                                <span></span>
                                <p>док.фильмы</p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <section class="about-projects-preview">
                <div class="about-projects-grid"></div>

                <div class="about-projects-actions">
                    <a class="about-projects-all" href="${getPageUrl("projects")}">Все проекты</a>
                </div>
            </section>
        </div>
    `;

    const grid = section.querySelector(".about-projects-grid");

    getOrderedPreviewCards(cards).slice(0, PREVIEW_LIMIT).forEach((card) => {
        grid.appendChild(createPreviewCard(card));
    });

    if (detailNode) {
        const detailClone = detailNode.cloneNode(true);
        remapElementClasses$1(detailClone);
        section.appendChild(detailClone);
    }

    if (requestNode) {
        const requestClone = requestNode.cloneNode(true);
        remapElementClasses$1(requestClone);
        section.appendChild(requestClone);
    }
}

function updateDetailTextScrollbar() {
    const { detailText, detailScrollbarFill } = getElements$3();

    const textWrap = document.querySelector(".about-projects-detail__text-wrap");
    const scrollbar = document.querySelector(".about-projects-detail__scrollbar");

    if (!detailText || !detailScrollbarFill || !textWrap || !scrollbar) return;

    const scrollableHeight = detailText.scrollHeight - detailText.clientHeight;
    const hasScroll = scrollableHeight > 2;

    textWrap.classList.toggle("has-scroll", hasScroll);

    if (!hasScroll) {
        detailScrollbarFill.style.height = "0%";
        detailScrollbarFill.style.transform = "translateY(0)";
        return;
    }

    const progress = detailText.scrollTop / scrollableHeight;
    const visibleRatio = detailText.clientHeight / detailText.scrollHeight;

    const fillHeight = Math.max(14, visibleRatio * 100);
    const maxMove = 100 - fillHeight;

    detailScrollbarFill.style.height = `${fillHeight}%`;
    detailScrollbarFill.style.transform = `translateY(${progress * maxMove}%)`;
}

function fitDetailTextHeight() {
    const detail = document.querySelector(".about-projects-detail");
    const content = document.querySelector(".about-projects-detail__content");
    const top = document.querySelector(".about-projects-detail__top");
    const textWrap = document.querySelector(".about-projects-detail__text-wrap");
    const meta = document.querySelector(".about-projects-detail__meta");
    const status = document.querySelector(".about-projects-detail__status");
    const bottom = document.querySelector(".about-projects-detail__bottom");

    if (
        !detail ||
        !detail.classList.contains("is-open") ||
        !content ||
        !top ||
        !textWrap ||
        !meta ||
        !status ||
        !bottom
    ) {
        return;
    }

    textWrap.style.removeProperty("--about-projects-detail-text-height");

    const textWrapStyles = window.getComputedStyle(textWrap);
    const contentStyles = window.getComputedStyle(content);
    const defaultHeight = textWrap.getBoundingClientRect().height;
    const contentPaddingTop = Number.parseFloat(contentStyles.paddingTop) || 0;
    const textWrapMarginTop = Number.parseFloat(textWrapStyles.marginTop) || 0;
    const safetyGap = 18;

    const usedHeight =
        contentPaddingTop +
        top.getBoundingClientRect().height +
        textWrapMarginTop +
        meta.getBoundingClientRect().height +
        status.getBoundingClientRect().height +
        bottom.getBoundingClientRect().height +
        safetyGap;

    const availableHeight = content.clientHeight - usedHeight;
    const fittedHeight = Math.max(0, Math.min(defaultHeight, availableHeight));

    textWrap.style.setProperty(
        "--about-projects-detail-text-height",
        `${fittedHeight}px`
    );

    const bottomOverflow =
        bottom.getBoundingClientRect().bottom - detail.getBoundingClientRect().bottom;

    if (bottomOverflow > 0) {
        textWrap.style.setProperty(
            "--about-projects-detail-text-height",
            `${Math.max(0, fittedHeight - bottomOverflow - safetyGap)}px`
        );
    }
}

function updateDetailLayout() {
    fitDetailTextHeight();
    updateDetailTextScrollbar();
}

function getCurrentDetailProjectTitle$1() {
    const { detail, detailTitle } = getElements$3();

    if (!detail || !detail.classList.contains("is-open") || !detailTitle) {
        return "";
    }

    return detailTitle.textContent.trim();
}

function openDetail$1(card) {
    const {
        detail,
        detailImg,
        detailTitle,
        detailGenre,
        detailNote,
        detailDescription,
        detailText,
        detailAge,
        detailFormat,
        detailDuration
    } = getElements$3();

    if (!detail || !card) return;

    const img = card.querySelector("img");

    const title = card.dataset.projectTitle || img?.alt || "";
    const genre = card.dataset.projectGenre || "";
    const note = card.dataset.projectNote || "";
    const age = card.dataset.projectAge || "";
    const format = card.dataset.projectFormat || "";
    const duration = card.dataset.projectDuration || "";
    const description =
        card.dataset.projectDescription ||
        "Описание проекта находится в разработке.";

    if (detailImg && img) {
        detailImg.src = img.getAttribute("src");
        detailImg.alt = img.getAttribute("alt") || title;
    }

    if (detailTitle) detailTitle.textContent = title;
    if (detailGenre) detailGenre.textContent = genre;
    if (detailNote) detailNote.textContent = note ? `(${note})` : "";
    if (detailDescription) detailDescription.textContent = description;
    if (detailAge) detailAge.textContent = age;
    if (detailFormat) detailFormat.textContent = format;
    if (detailDuration) detailDuration.textContent = duration;

    if (detailText) detailText.scrollTop = 0;

    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-projects-detail-open");

    requestAnimationFrame(() => {
        updateDetailLayout();

        requestAnimationFrame(updateDetailLayout);
    });
}

function closeDetail$1() {
    const { detail } = getElements$3();

    if (!detail) return;

    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    detail.style.removeProperty("--about-projects-detail-text-height");
    document
        .querySelector(".about-projects-detail__text-wrap")
        ?.style.removeProperty("--about-projects-detail-text-height");
    document.body.classList.remove("about-projects-detail-open");
}

function openRequest$1(projectTitle = "") {
    const { requestPopup, requestProjectInput } = getElements$3();

    if (!requestPopup) return;

    if (requestProjectInput) {
        requestProjectInput.value = projectTitle || getCurrentDetailProjectTitle$1();
    }

    requestPopup.classList.add("is-open");
    requestPopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-projects-request-open");
}

function closeRequest$1(resetForm = false) {
    const { requestPopup, requestForm } = getElements$3();

    if (!requestPopup) return;

    requestPopup.classList.remove("is-open");
    requestPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-projects-request-open");

    if (resetForm && requestForm) {
        requestForm.reset();
    }
}

function initInteractions$2() {
    const {
        detail,
        detailClose,
        detailBackButtons,
        detailText,
        requestPopup,
        requestPopupClose,
        requestForm
    } = getElements$3();

    if (document.body.dataset.aboutProjectsCardDelegationReady !== "true") {
        document.addEventListener(
            "click",
            (e) => {
                if (document.body.classList.contains("about-projects-request-open")) return;

                const card = e.target.closest(".about-projects-card");

                if (!card) return;
                if (!card.closest(".about-projects-section")) return;
                if (card.closest(".about-projects-detail, .about-projects-request-popup")) return;

                e.preventDefault();
                e.stopPropagation();
                openDetail$1(card);
            },
            true
        );

        document.body.dataset.aboutProjectsCardDelegationReady = "true";
    }

    document.querySelectorAll(".about-projects-open-request").forEach((button) => {
        if (button.dataset.aboutProjectsRequestReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openRequest$1(getCurrentDetailProjectTitle$1());
        });

        button.dataset.aboutProjectsRequestReady = "true";
    });

    if (detailClose && detailClose.dataset.closeReady !== "true") {
        detailClose.addEventListener("click", closeDetail$1);
        detailClose.dataset.closeReady = "true";
    }

    detailBackButtons.forEach((button, index) => {
        if (button.dataset.backReady === "true") return;

        if (index === 1) {
            button.setAttribute("aria-label", "Вернуться к списку проектов");
            button.addEventListener("click", closeDetail$1);
        }

        button.dataset.backReady = "true";
    });

    if (detail && detail.dataset.overlayReady !== "true") {
        detail.addEventListener("click", (e) => {
            if (e.target === detail) closeDetail$1();
        });

        detail.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        detail.dataset.overlayReady = "true";
    }

    if (detail && detail.dataset.fitResizeReady !== "true") {
        window.addEventListener("resize", () => {
            if (!detail.classList.contains("is-open")) return;

            updateDetailLayout();
        });

        detail.dataset.fitResizeReady = "true";
    }

    if (detailText && detailText.dataset.scrollbarReady !== "true") {
        detailText.addEventListener("scroll", updateDetailTextScrollbar);

        detailText.addEventListener(
            "wheel",
            (e) => {
                const delta = e.deltaY;

                const atTop = detailText.scrollTop <= 0;
                const atBottom =
                    detailText.scrollTop + detailText.clientHeight >=
                    detailText.scrollHeight - 1;

                const canScrollUp = delta < 0 && !atTop;
                const canScrollDown = delta > 0 && !atBottom;

                if (canScrollUp || canScrollDown) {
                    e.stopPropagation();
                    e.preventDefault();

                    detailText.scrollTop += delta;
                    requestAnimationFrame(updateDetailTextScrollbar);
                }
            },
            { passive: false }
        );

        detailText.dataset.scrollbarReady = "true";
    }

    if (requestPopupClose && requestPopupClose.dataset.closeReady !== "true") {
        requestPopupClose.addEventListener("click", () => closeRequest$1());
        requestPopupClose.dataset.closeReady = "true";
    }

    if (requestForm && requestForm.dataset.formReady !== "true") {
        requestForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeRequest$1(true);
        });

        requestForm.dataset.formReady = "true";
    }

    if (requestPopup && requestPopup.dataset.overlayReady !== "true") {
        requestPopup.addEventListener("click", (e) => {
            if (e.target === requestPopup) closeRequest$1();
        });

        requestPopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        requestPopup.dataset.overlayReady = "true";
    }
}

async function loadProjectsContent() {
    const { section } = getElements$3();

    if (!section || isLoading$3 || isReady$3) return;

    isLoading$3 = true;

    try {
        const response = await fetch(getPageUrl("projects"));
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        doc.querySelectorAll(".menu, .settings, script, link, style").forEach((node) => {
            node.remove();
        });

        const parsedCards = Array.from(doc.querySelectorAll(".project-card"));
        const cards = parsedCards.length ? parsedCards : getFallbackPreviewCards();
        const detailNode = doc.querySelector(".project-detail");
        const requestNode = doc.querySelector(".projects-request-popup");

        buildSection(cards, detailNode, requestNode);
        initInteractions$2();

        isReady$3 = true;
        isLoading$3 = false;

        updateAboutProjectsSection(0);
    } catch (error) {
        console.error("About projects load error:", error);

        section.innerHTML = `
            <div class="about-projects-section__loader">
                Не удалось загрузить проекты
            </div>
        `;

        isLoading$3 = false;
    }
}

function getPreviewBottomShift(stage) {
    if (!stage) return 0;

    const preview = document.querySelector(".about-projects-preview");

    if (!preview) return 0;

    const rawShift = window.getComputedStyle(preview)
        .getPropertyValue("--about-projects-preview-overlap-shift")
        .trim();
    const overlapShift = rawShift.endsWith("vh")
        ? (parseFloat(rawShift) / 100) * window.innerHeight
        : parseFloat(rawShift) || 0;
    const previewBottomInsideStage = preview.offsetTop + preview.offsetHeight - overlapShift;
    const tallScreenBottomReserve =
        window.innerWidth >= 1600 && window.innerHeight >= 1150
            ? window.innerHeight * 0.3
            : 0;

    return Math.max(
        0,
        previewBottomInsideStage -
            window.innerHeight -
            tallScreenBottomReserve
    );
}

function syncAboutProjectsTitleBackground(bgImg, title) {
    if (!bgImg || !title) return;

    const imgRect = bgImg.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    const naturalWidth = bgImg.naturalWidth || imgRect.width;
    const naturalHeight = bgImg.naturalHeight || imgRect.height;

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

function initAboutProjectsSection() {
    if (!document.querySelector(".about-projects-section")) return;

    loadProjectsContent();
}

function updateAboutProjectsSection(globalProgress) {
    const {
        section,
        bgImg,
        stage,
        titleLayer,
        title,
        preview
    } = getElements$3();

    if (!section) return;

    const revealY = mapRangeSmooth$3(
        globalProgress,
        ABOUT_PROJECTS_REVEAL_START,
        ABOUT_PROJECTS_START,
        100,
        0
    );

    const localProgress = clamp$5(
        globalProgress - ABOUT_PROJECTS_START,
        0,
        ABOUT_PROJECTS_MAX
    );

    section.style.transform = `translateY(${revealY}vh)`;

    if (!isReady$3) {
        updatePageScrollbar(globalProgress);
        return;
    }

    if (stage) {
        const maxStageShift = getPreviewBottomShift(stage);

        const stageY = mapRange$4(
            localProgress,
            1,
            ABOUT_PROJECTS_SCROLL_END,
            0,
            -maxStageShift
        );

        stage.style.transform = `translateY(${stageY}px)`;
    }

    if (bgImg) {
        const bgProgress = mapRangeSmooth$3(localProgress, 0, 1.85, 0, 1);
        const bgZoom = 1 + bgProgress * 0.4;
        const bgMove = bgProgress * 80;

        bgImg.style.transformOrigin = "center center";
        bgImg.style.transform = `translateY(${bgMove}px) scale(${bgZoom})`;
    }

    if (titleLayer) {
        const textMove = mapRange$4(localProgress, 0, 1, 0, 100);
        titleLayer.style.transform = `translateY(${100 - textMove}%)`;
    }

    if (preview) {
        const previewOverlapProgress = smoothstep$3(
            mapRange$4(localProgress, 0.9, 3, 0, 1)
        );

        preview.style.setProperty(
            "--about-projects-preview-overlap-progress",
            previewOverlapProgress
        );
    }

    if (bgImg && title) {
        syncAboutProjectsTitleBackground(bgImg, title);
    }

    updatePageScrollbar(globalProgress);
}

var aboutProjectsSection = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initAboutProjectsSection: initAboutProjectsSection,
    updateAboutProjectsSection: updateAboutProjectsSection
});

const ABOUT_HELP_CARDS_OVERLAP_START = 1.26;
const ABOUT_HELP_CARDS_OVERLAP_END = 1.78;

let isReady$2 = false;
let isLoading$2 = false;
let currentDetailGroupKey$1 = "support";
let detailWheelLocked$1 = false;

const detailGroups$1 = {
    support: {
        title: "Сопровождение проектов",
        items: [
            {
                title: "Разработка презентаций",
                description:
                    "Презентация проекта — это ключевой этап, который открывает его дальнейшую судьбу. Важно не только иметь сильную идею, но и уметь эффектно и убедительно её подать. Хорошая презентация не просто информирует, а заряжает идеей.\n\nВ работу включены разработка структуры, основные визуальные принципы, которые сделают отличие и уникальность концепции проекта. Составляем помощь в грамотной подготовке всех разделов с учётом требований индустрии, где необходимо привлечь участие в разработке креатива и презентационных проектов.",
                services: [
                    "Презентация проекта",
                    "Библия персонажей"
                ],
                image: "./assets/Услуги Текстура/Разраб Презентации.jpg"
            },
            {
                title: "Ки-арт / дизайн",
                description:
                    "Мы поможем с визуальным оформлением картины: разработаем ки-арт, изображения и композиции на основе референсов, соберём единый постер, титры, логотипы, промо-материалы, социальные сети, айдентику и другие визуальные элементы.\n\nЗадача — создать цельную и выразительную визуальную персонажность проекта.",
                services: [
                    "Ки-арт для фильма",
                    "Разработка постера",
                    "Разработка логотипов",
                    "Титры к фильму",
                    "Фотосъёмка",
                    "Дизайн для социальных сетей",
                    "Разработка сайта"
                ],
                image: "./assets/Услуги Текстура/Ки-арт.jpg"
            },
            {
                title: "Подготовка <br>заявки в: Минкульт,<br> Фонд кино, ИРИ, ПФКИ",
                description:
                    "Профессионально и быстро подготовим пакет документов для получения субсидий, которые выделяются теми или иными производственно-индустриальными фондами, финансовой поддержкой ведомств и организаций.\n\nДля подачи или участия важно пройти этап подготовки правильно и последовательно. Мы ежегодно готовим документы на получение субсидий и имеем большой опыт подачи.",
                services: [
                    "Оформление заявки на субсидию",
                    "Проверка уже подготовленного пакета документов",
                    "Консультации"
                ],
                image: "./assets/Услуги Текстура/Подготовка заявки.jpg"
            },
            {
                title: "Прокатное удостоверение",
                description:
                    "Прокатное удостоверение — подтверждающий документ права владения на фильм. Наличие прокатного удостоверения обязательно для публичных показов фильмов.\n\nГрамотно подготовим пакет документов, отвезём его в Минкульт РФ, следим копию в архив, оплатим пошлины и отдадим вам готовое прокатное удостоверение. С 2024 прокатное удостоверение стало цифровым.",
                services: [
                    "Прокатное на игровой, анимацию, док, фильмы",
                    "Прокатное на сериал",
                    "Сдача исходных материалов в ГФФ",
                    "Монтажные и диалоговые листы",
                    "Запись жесткого диска с DCP и WAV",
                    "Запись кассет HDcam и DVD"
                ],
                image: "./assets/Услуги Текстура/ПрокатУд.jpg"
            },
            {
                title: "Постпродакшн",
                description:
                    "Услуги режиссёрского монтажа с пониманием задачи и сроков. Смонтируем или сократим фильм, сделаем трейлер или фильм о фильме.\n\nПомогаем довести материал до финального состояния и подготовить его к презентации, передаче партнёрам или дальнейшему продвижению.",
                services: [
                    "Монтаж фильма",
                    "Монтаж трейлера",
                    "Фильм о фильме"
                ],
                image: "./assets/Услуги Текстура/Постпродакшн.jpg"
            }
        ]
    },

    advertising: {
        title: "Рекламный департамент",
        items: [
            {
                title: "Креатив",
                description:
                    "Путь в тысячи миль начинается с первого шага, а создание качественного видео контента — с креативной и грамотно расписанной идеи.\n\nПрежде чем начать реализацию задумки, мы детально прорабатываем каждый будущий кадр и создаём надёжный фундамент для успешности проекта.",
                services: [
                    "Сториборд",
                    "Нейминг",
                    "Креативная концепция",
                    "Сценарии"
                ],
                image: "./assets/Услуги Текстура/Креатив.jpg"
            },
            {
                title: "Дизайн",
                description:
                    "Наша команда специалистов по созданию креативной рекламы и созданию ярких впечатлений в цифровых формах ваших брендов.",
                services: [
                    "Разработка фирменного стиля",
                    "Дизайн упаковки",
                    "Адаптивный дизайн",
                    "Веб-дизайн",
                    "Проектирование интерфейсов",
                    "Юзабилити",
                    "Арт, иллюстрации",
                    "Инфографика",
                    "Проектирование и производство выставочных и торговых стендов",
                    "POS-материалы"
                ],
                image: "./assets/Услуги Текстура/Дизайн.jpg"
            },
            {
                title: "Планирование",
                description:
                    "Работая со смыслами, мы делим на следующие этапы:\n\n1 — ПОИСК РАМОК\nЗа которые нам нужно выйти. Это поиск стереотипных действий, которые совершают наши конкуренты, и шаблоны мышления, в которых находятся потребители.\n\n2 — ПОИСК ТРЕНДОВ\nВ каком будущем предстоит жить бренду и на какие ценности важно отозваться и оказывать влияние.\n\n3 — СОЗДАНИЕ ИНСТРУМЕНТОВ\nКоторые разрушают стереотипы, которые позволяют легко донести ценности и обогнать конкурентов.",
                services: [
                    "Исследование и аналитика",
                    "Стратегии",
                    "Бренд-консалтинг"
                ],
                image: "./assets/Услуги Текстура/Планирование.jpg"
            },
            {
                title: "Видеосъёмка",
                description:
                    "Наша команда осуществляет полный цикл производства коммерческого видео, ТВ-передач, фильмов, сериалов и диджитал проектов.\n\nМы вам готовы предложить как проекты «под ключ», так и совместное производство.",
                services: [
                    "Рекламные ролики",
                    "Вирусные ролики",
                    "Имиджевые ролики",
                    "Анимационные ролики",
                    "Разработка YouTube/SMM каналов",
                    "Корпоративные фильмы",
                    "Трансляции",
                    "Продающее видео",
                    "Видео-отзывы",
                    "Репортажная съёмка",
                    "Аэросъёмка"
                ],
                image: "./assets/Услуги Текстура/Видеосъемка.jpg"
            },
            {
                title: "Фотосъёмка",
                description:
                    "Наши фотохудожники готовы передать качество и эстетику вашей продукции до мельчайших подробностей. Мы используем только современное оборудование, а среди наших фотографов есть победители международных конкурсов.",
                services: [
                    "Предметная фотосъёмка",
                    "Для маркетплейсов",
                    "Рекламная съёмка",
                    "Дополнительный сервис",
                    "Мероприятия"
                ],
                image: "./assets/Услуги Текстура/Фотосъемка.jpg"
            },
            {
                title: "Организация мероприятий",
                description:
                    "Наши специалисты разработают креативную идею и реализуют её визуализацию. Мы изготовим элементы проекта, предоставляем мультимедийное оборудование и интерактивный контент, текстовые, фото, аудио и видеоматериалы.\n\nРазработаем, доставим и установим выставочные и торговые конструкции на объектах.",
                services: [
                    "Концерты",
                    "Спортивные мероприятия",
                    "Проведение презентаций, конференций и других мероприятий"
                ],
                image: "./assets/Услуги Текстура/Организация мероприятий.jpg"
            },
            {
                title: "Интернет-маркетинг",
                description:
                    "Наше агентство работает с 95% площадок Рунета. Ваши рекламные объявления появляются в популярных системах Яндекс и Google, а также появляются на сайтах партнёров поисковых систем и социальных сетях.\n\nПодберём наиболее эффективные площадки для проведения рекламных кампаний.\n\nМЫ СЕРТИФИЦИРОВАННОЕ АГЕНТСТВО.",
                services: [
                    "Поисковое продвижение",
                    "SEO продвижение сайта",
                    "Разработка сайтов",
                    "Баинг"
                ],
                image: "./assets/Услуги Текстура/Интернет-маркетинг.jpg"
            },
            {
                title: "СММ",
                description:
                    "Управление маркетингом и социальных сетях. Работаем над имиджем вашей компании и помогаем выстроить коммуникацию с аудиторией.",
                services: [
                    "Представительство бренда в социальных сетях",
                    "Таргетированная реклама",
                    "Работа с блогерами"
                ],
                image: "./assets/Услуги Текстура/СММ.jpg"
            }
        ]
    }
};

function clamp$4(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange$3(value, inMin, inMax, outMin, outMax) {
    const progress = clamp$4((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}
function smoothstep$2(value) {
    const x = clamp$4(value, 0, 1);
    return x * x * (3 - 2 * x);
}

function mapRangeSmooth$2(value, inMin, inMax, outMin, outMax) {
    const progress = smoothstep$2((value - inMin) / (inMax - inMin));
    return outMin + (outMax - outMin) * progress;
}

function remapClassName(className) {
    if (className === "help-bg") return "about-help-bg";
    if (className === "help-bg__img") return "about-help-bg__img";
    if (className === "help-stage") return "about-help-stage";
    if (className === "help-hero") return "about-help-hero";
    if (className === "help-paralax-text") return "about-help-paralax-text";
    if (className === "help-parallax-text") return "about-help-parallax-text";
    if (className === "help__title") return "about-help__title";
    if (className === "help__subtitle") return "about-help__subtitle";
    if (className === "help-arrow") return "about-help-arrow";

    if (className.startsWith("help-")) {
        return className.replace("help-", "about-help-");
    }

    if (className.startsWith("help__")) {
        return className.replace("help__", "about-help__");
    }

    return className;
}

function remapElementClasses(root) {
    root.querySelectorAll(".menu, .settings, script, link, style").forEach((node) => {
        node.remove();
    });

    const allElements = [root, ...root.querySelectorAll("*")];

    allElements.forEach((element) => {
        const newClasses = Array.from(element.classList).map(remapClassName);
        element.className = newClasses.join(" ");
    });
}

function getElements$2() {
    return {
        section: document.querySelector(".about-help-section"),
        bgImg: document.querySelector(".about-help-bg__img"),
        stage: document.querySelector(".about-help-stage"),
        cardsSection: document.querySelector(".about-help-cards-section"),
        paralaxText: document.querySelector(".about-help-paralax-text, .about-help-parallax-text"),
        title: document.querySelector(".about-help__title"),
        arrow: document.querySelector(".about-help-arrow"),

        detail: document.querySelector(".about-help-detail"),
        detailClose: document.querySelector(".about-help-detail__back"),
        detailBreadcrumbHome: document.querySelector(".about-help-detail__breadcrumbs-home"),
        detailBreadcrumbCurrent: document.querySelector(".about-help-detail__breadcrumbs-current"),
        detailNavList: document.querySelector(".about-help-detail__nav-list"),
        detailText: document.querySelector(".about-help-detail__text"),
        detailDescription: document.querySelector(".about-help-detail__description"),
        detailServicesList: document.querySelector(".about-help-detail__services-list"),
        detailImg: document.querySelector(".about-help-detail__img"),
        detailArrow: document.querySelector(".about-help-detail__arrow"),

        requestPopup: document.querySelector(".about-help-request-popup"),
        requestPopupDialog: document.querySelector(".about-help-request-popup__dialog"),
        requestPopupClose: document.querySelector(".about-help-request-popup__close"),
        requestForm: document.querySelector(".about-help-request-form"),
        requestServiceInput: document.querySelector(".about-help-request-form__service"),
        requestServiceVisibleInput: document.querySelector(".about-help-request-form__service-visible"),

        pricePopup: document.querySelector(".about-help-price-popup"),
        pricePopupDialog: document.querySelector(".about-help-price-popup__dialog"),
        pricePopupClose: document.querySelector(".about-help-price-popup__close"),
        priceForm: document.querySelector(".about-help-price-form"),
        priceButtons: document.querySelectorAll(".about-help-detail__download-price")
    };
}

function getCurrentGroup$1() {
    return detailGroups$1[currentDetailGroupKey$1] || detailGroups$1.support;
}

function getCurrentDetailIndex$1() {
    const activeButton = document.querySelector(
        ".about-help-detail__nav-item.is-active"
    );

    return Number(activeButton?.dataset.aboutHelpDetailIndex || 0);
}

function switchDetailGroup$1(direction = 1, targetIndex = 0) {
    const groupKeys = Object.keys(detailGroups$1);
    const currentGroupIndex = Math.max(
        0,
        groupKeys.indexOf(currentDetailGroupKey$1)
    );
    const nextGroupIndex =
        (currentGroupIndex + direction + groupKeys.length) % groupKeys.length;

    currentDetailGroupKey$1 = groupKeys[nextGroupIndex];

    const group = getCurrentGroup$1();
    const nextIndex = targetIndex < 0
        ? group.items.length - 1
        : Math.min(targetIndex, group.items.length - 1);

    renderDetailNav$1(nextIndex);
    renderDetail$1(nextIndex);
}

function stepDetail$1(direction = 1) {
    const group = getCurrentGroup$1();
    const currentIndex = getCurrentDetailIndex$1();
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < group.items.length) {
        renderDetail$1(nextIndex);
        return;
    }

    switchDetailGroup$1(direction, direction > 0 ? 0 : -1);
}

function getOffsetTopInside$3(parent, child) {
    let offset = 0;
    let element = child;

    while (element && element !== parent) {
        offset += element.offsetTop;
        element = element.offsetParent;
    }

    return offset;
}

function getStageBottomShift$2(stage) {
    if (!stage) return 0;

    const cardsSection = document.querySelector(".about-help-cards-section");

    if (!cardsSection) return 0;

    const sectionTopInsideStage = getOffsetTopInside$3(stage, cardsSection);
    const rawShift = window.getComputedStyle(cardsSection)
        .getPropertyValue("--about-help-cards-parallax-shift")
        .trim();
    const parallaxShift = rawShift.endsWith("vh")
        ? (parseFloat(rawShift) / 100) * window.innerHeight
        : parseFloat(rawShift) || 0;
    const sectionBottomInsideStage = sectionTopInsideStage +
        cardsSection.offsetHeight -
        parallaxShift;

    return Math.max(0, sectionBottomInsideStage - window.innerHeight - 10);
}

function syncAboutHelpTitleBackground(bgImg, title) {
    if (!bgImg || !title) return;

    const imgRect = bgImg.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    const naturalWidth = bgImg.naturalWidth || imgRect.width;
    const naturalHeight = bgImg.naturalHeight || imgRect.height;

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

function renderDetailNav$1(activeIndex = 0) {
    const { detailBreadcrumbCurrent, detailNavList } = getElements$2();
    const group = getCurrentGroup$1();

    if (detailBreadcrumbCurrent) {
        detailBreadcrumbCurrent.textContent = group.title;
        detailBreadcrumbCurrent.title = "Переключить набор услуг";
    }

    if (!detailNavList) return;

    detailNavList.innerHTML = group.items
        .map((item, index) => {
            const activeClass = index === activeIndex ? " is-active" : "";

            return `
                <button
                    class="about-help-detail__nav-item${activeClass}"
                    type="button"
                    data-about-help-detail-index="${index}"
                >
                    ${item.title}
                </button>
            `;
        })
        .join("");

    detailNavList.querySelectorAll(".about-help-detail__nav-item").forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.aboutHelpDetailIndex || 0);
            renderDetail$1(index);
        });
    });
}

function renderDetail$1(index) {
    const {
        detailDescription,
        detailServicesList,
        detailImg,
        detailNavList,
        detailText
    } = getElements$2();
    const group = getCurrentGroup$1();
    const item = group.items[index];

    if (!item) return;

    if (detailNavList) {
        detailNavList.querySelectorAll(".about-help-detail__nav-item").forEach((button, buttonIndex) => {
            button.classList.toggle("is-active", buttonIndex === index);
        });
    }

    if (detailDescription) {
        detailDescription.textContent = item.description;
    }

    if (detailText) {
        detailText.scrollTop = 0;
    }

    if (detailServicesList) {
        detailServicesList.innerHTML = item.services
            .map((service) => `<li>${service}</li>`)
            .join("");
    }

    if (detailImg) {
        detailImg.src = getAssetUrl(item.image);
        detailImg.alt = item.title.replace(/<br\s*\/?>/gi, " ");
    }
}

function openDetail(card) {
    const { detail } = getElements$2();

    if (!detail || !card) return;

    const kind = card.dataset.helpKind || card.dataset.aboutHelpKind || "support";

    currentDetailGroupKey$1 = kind === "advertising" ? "advertising" : "support";

    renderDetailNav$1(0);
    renderDetail$1(0);

    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-help-detail-open");
}

function ensureCardDetailButtons(root = document) {
    root.querySelectorAll(".about-help-large-card").forEach((card) => {
        if (card.querySelector(".about-help-card-button")) return;

        const button = document.createElement("button");

        button.className = "about-help-card-button";
        button.type = "button";
        button.textContent = "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435";

        card.appendChild(button);
    });
}

function closeDetail() {
    const { detail } = getElements$2();

    if (!detail) return;

    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-help-detail-open");
}

function getCurrentDetailServiceTitle$1() {
    const activeButton = document.querySelector(".about-help-detail__nav-item.is-active");

    if (!activeButton) return getCurrentGroup$1().title;

    return activeButton.textContent.trim();
}

function openRequest(serviceTitle = "") {
    const { requestPopup, requestServiceInput, requestServiceVisibleInput } = getElements$2();

    if (!requestPopup) return;

    const currentTitle = serviceTitle || getCurrentDetailServiceTitle$1();

    if (requestServiceInput) {
        requestServiceInput.value = currentTitle;
    }

    if (requestServiceVisibleInput) {
        requestServiceVisibleInput.value = currentTitle;
    }

    requestPopup.classList.add("is-open");
    requestPopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-help-request-open");
}

function closeRequest(resetForm = false) {
    const { requestPopup, requestForm } = getElements$2();

    if (!requestPopup) return;

    requestPopup.classList.remove("is-open");
    requestPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-help-request-open");

    if (resetForm && requestForm) {
        requestForm.reset();
    }
}

function openPricePopup() {
    const { pricePopup } = getElements$2();

    if (!pricePopup) return;

    pricePopup.classList.add("is-open");
    pricePopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-help-price-open");
}

function closePricePopup(resetForm = false) {
    const { pricePopup, priceForm } = getElements$2();

    if (!pricePopup) return;

    pricePopup.classList.remove("is-open");
    pricePopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-help-price-open");

    if (resetForm && priceForm) {
        priceForm.reset();
    }
}

function initInteractions$1() {
    const {
        detail,
        detailClose,
        detailArrow,
        detailBreadcrumbHome,
        detailBreadcrumbCurrent,
        requestPopup,
        requestPopupDialog,
        requestPopupClose,
        requestForm,
        pricePopup,
        pricePopupDialog,
        pricePopupClose,
        priceForm,
        priceButtons
    } = getElements$2();

    ensureCardDetailButtons();

    document.querySelectorAll(".about-help-card-button").forEach((button) => {
        if (button.dataset.aboutHelpDetailReady === "true") return;

        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            openDetail(button.closest(".about-help-large-card"));
        });

        button.dataset.aboutHelpDetailReady = "true";
    });

    if (detailArrow && detailArrow.dataset.aboutHelpArrowReady !== "true") {
        detailArrow.addEventListener("click", () => {
            stepDetail$1(1);
        });

        detailArrow.dataset.aboutHelpArrowReady = "true";
    }

    if (
        detailBreadcrumbHome &&
        detailBreadcrumbHome.dataset.aboutHelpHomeReady !== "true"
    ) {
        detailBreadcrumbHome.addEventListener("click", () => {
            window.location.href = getPageUrl("help");
        });

        detailBreadcrumbHome.dataset.aboutHelpHomeReady = "true";
    }

    if (
        detailBreadcrumbCurrent &&
        detailBreadcrumbCurrent.dataset.aboutHelpGroupSwitchReady !== "true"
    ) {
        detailBreadcrumbCurrent.addEventListener("click", () => {
            switchDetailGroup$1(1, 0);
        });

        detailBreadcrumbCurrent.dataset.aboutHelpGroupSwitchReady = "true";
    }

    if (detailClose && detailClose.dataset.aboutHelpCloseReady !== "true") {
        detailClose.addEventListener("click", closeDetail);
        detailClose.dataset.aboutHelpCloseReady = "true";
    }

    if (detail && detail.dataset.aboutHelpOverlayReady !== "true") {
        detail.addEventListener("wheel", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (detailWheelLocked$1 || Math.abs(e.deltaY) < 4) return;

            detailWheelLocked$1 = true;
            stepDetail$1(e.deltaY > 0 ? 1 : -1);

            window.setTimeout(() => {
                detailWheelLocked$1 = false;
            }, 320);
        });

        detail.dataset.aboutHelpOverlayReady = "true";
    }

    priceButtons.forEach((button) => {
        if (button.dataset.aboutHelpPriceReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPricePopup();
        });

        button.dataset.aboutHelpPriceReady = "true";
    });

    if (pricePopupClose && pricePopupClose.dataset.aboutHelpPriceCloseReady !== "true") {
        pricePopupClose.addEventListener("click", () => {
            closePricePopup();
        });

        pricePopupClose.dataset.aboutHelpPriceCloseReady = "true";
    }

    if (priceForm && priceForm.dataset.aboutHelpPriceFormReady !== "true") {
        priceForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closePricePopup(true);
        });

        priceForm.dataset.aboutHelpPriceFormReady = "true";
    }

    if (pricePopup && pricePopup.dataset.aboutHelpPricePopupReady !== "true") {
        pricePopup.addEventListener("click", (e) => {
            if (e.target === pricePopup) closePricePopup();
        });

        pricePopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        pricePopup.dataset.aboutHelpPricePopupReady = "true";
    }

    if (pricePopupDialog && pricePopupDialog.dataset.aboutHelpPriceDialogReady !== "true") {
        pricePopupDialog.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        pricePopupDialog.dataset.aboutHelpPriceDialogReady = "true";
    }

    document.querySelectorAll(".about-help-open-request").forEach((button) => {
        if (button.dataset.aboutHelpRequestReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openRequest(getCurrentDetailServiceTitle$1());
        });

        button.dataset.aboutHelpRequestReady = "true";
    });

    if (requestPopupClose && requestPopupClose.dataset.aboutHelpPopupCloseReady !== "true") {
        requestPopupClose.addEventListener("click", () => {
            closeRequest();
        });

        requestPopupClose.dataset.aboutHelpPopupCloseReady = "true";
    }

    if (requestForm && requestForm.dataset.aboutHelpFormReady !== "true") {
        requestForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeRequest(true);
        });

        requestForm.dataset.aboutHelpFormReady = "true";
    }

    if (requestPopup && requestPopup.dataset.aboutHelpPopupReady !== "true") {
        requestPopup.addEventListener("click", (e) => {
            if (e.target === requestPopup) closeRequest();
        });

        requestPopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        requestPopup.dataset.aboutHelpPopupReady = "true";
    }

    if (requestPopupDialog && requestPopupDialog.dataset.aboutHelpDialogReady !== "true") {
        requestPopupDialog.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        requestPopupDialog.dataset.aboutHelpDialogReady = "true";
    }

    if (document.body.dataset.aboutHelpEscapeReady !== "true") {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;

            const {
                requestPopup: popup,
                pricePopup: currentPricePopup,
                detail: currentDetail
            } = getElements$2();

            if (currentPricePopup && currentPricePopup.classList.contains("is-open")) {
                closePricePopup();
                return;
            }

            if (popup && popup.classList.contains("is-open")) {
                closeRequest();
                return;
            }

            if (currentDetail && currentDetail.classList.contains("is-open")) {
                closeDetail();
            }
        });

        document.body.dataset.aboutHelpEscapeReady = "true";
    }
}

async function loadHelpContent() {
    const { section } = getElements$2();

    if (!section || isLoading$2 || isReady$2) return;

    isLoading$2 = true;

    try {
        const response = await fetch(getPageUrl("help"));
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        doc.querySelectorAll(".menu, .settings, script, link, style").forEach((node) => {
            node.remove();
        });

        const sourceNodes = [
            doc.querySelector(".help-bg"),
            doc.querySelector(".help-stage"),
            doc.querySelector(".help-detail"),
            doc.querySelector(".help-price-popup"),
            doc.querySelector(".help-request-popup"),
            doc.querySelector(".help-arrow")
        ].filter(Boolean);

        section.innerHTML = "";

        sourceNodes.forEach((node) => {
            const clone = node.cloneNode(true);
            remapElementClasses(clone);
            section.appendChild(clone);
        });


        const cardImages = {
            support: "assets/Услуги Текстура/сопровождение проектов.jpg",
            advertising: "assets/Услуги Текстура/рекламный департамент.jpg"
        };

        section.querySelectorAll(".about-help-large-card").forEach((card) => {
            const image = card.querySelector("img");
            const imagePath = cardImages[card.dataset.helpKind];

            if (!image || !imagePath) return;

            image.removeAttribute("srcset");
            image.loading = "eager";
            image.decoding = "async";
            image.src = getAssetUrl(imagePath);
        });
        normalizeMojibake(section);
        ensureCardDetailButtons(section);
        initInteractions$1();

        isReady$2 = true;
        isLoading$2 = false;

        updateAboutHelpSection(0);
    } catch (error) {
        console.error("About help load error:", error);

        section.innerHTML = `
            <div class="about-help-section__loader">
                Не удалось загрузить услуги
            </div>
        `;

        isLoading$2 = false;
    }
}

function initAboutHelpSection() {
    if (!document.body.classList.contains("about-page")) return;

    loadHelpContent();
}

function updateAboutHelpSection(globalProgress) {
    if (!document.body.classList.contains("about-page")) return;

    const { section, bgImg, stage, cardsSection, paralaxText, title, arrow } = getElements$2();

    if (!section) return;

    const revealY = mapRangeSmooth$2(
        globalProgress,
        ABOUT_HELP_REVEAL_START,
        ABOUT_HELP_START,
        100,
        0
    );

    const localProgress = clamp$4(
        globalProgress - ABOUT_HELP_START,
        0,
        ABOUT_HELP_MAX
    );

    const heroProgress = clamp$4(localProgress, 0, 1);

    section.style.transform = `translateY(${revealY}vh)`;

    if (!isReady$2) {
        updatePageScrollbar(globalProgress);
        return;
    }

    if (stage) {
        const maxStageShift = getStageBottomShift$2(stage);

        const stageY = mapRangeSmooth$2(
            localProgress,
            1,
            ABOUT_HELP_MAX,
            0,
            -maxStageShift
        );

        stage.style.transform = `translateY(${stageY}px)`;
    }


    if (bgImg) {
        const bgZoom = 1 + heroProgress * 0.4;
        const bgMove = heroProgress * 80;

        bgImg.style.transformOrigin = "center center";
        bgImg.style.transform = `translateY(${bgMove}px) scale(${bgZoom})`;
    }

    if (paralaxText) {
        const textMove = heroProgress * 115;
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
    }

    if (cardsSection) {
        const cardsOverlapProgress = smoothstep$2(
            mapRange$3(
                localProgress,
                ABOUT_HELP_CARDS_OVERLAP_START,
                ABOUT_HELP_CARDS_OVERLAP_END,
                0,
                1
            )
        );

        cardsSection.style.setProperty(
            "--about-help-cards-overlap-progress",
            cardsOverlapProgress
        );
    }

    if (bgImg && title) {
        syncAboutHelpTitleBackground(bgImg, title);
    }

    if (arrow) {
        arrow.style.opacity = localProgress >= ABOUT_HELP_MAX - 0.05 ? "0" : "1";
    }

    updatePageScrollbar(globalProgress);
}

var aboutHelpSection = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initAboutHelpSection: initAboutHelpSection,
    updateAboutHelpSection: updateAboutHelpSection
});

let isReady$1 = false;
let isLoading$1 = false;

function clamp$3(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange$2(value, inMin, inMax, outMin, outMax) {
    const progress = clamp$3((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}
function smoothstep$1(value) {
    const x = clamp$3(value, 0, 1);
    return x * x * (3 - 2 * x);
}

function mapRangeSmooth$1(value, inMin, inMax, outMin, outMax) {
    const progress = smoothstep$1((value - inMin) / (inMax - inMin));
    return outMin + (outMax - outMin) * progress;
}

function getElements$1() {
    return {
        section: document.querySelector(".about-news-section"),
        stage: document.querySelector(".about-news-section .news-stage"),
        arrow: document.querySelector(".about-news-section .news-arrow"),

        listSection: document.querySelector(".about-news-section .news-list-section"),
        listContent: document.querySelector(".about-news-section .news-list-section__content"),
        newsList: document.querySelector(".about-news-section .news-list"),
        listItems: document.querySelectorAll(".about-news-section .news-list__item"),
        listScrollbar: document.querySelector(".about-news-section .news-list-scrollbar"),
        listScrollbarFill: document.querySelector(".about-news-section .news-list-scrollbar__fill"),

        articles: document.querySelectorAll(".about-news-section .news-article"),
        relatedItems: document.querySelectorAll(".about-news-section .news-related__item"),
        scrollToTopButtons: document.querySelectorAll(".about-news-section .news-scroll-to-top")
    };
}

function getOffsetTopInside$2(parent, child) {
    let offset = 0;
    let element = child;

    while (element && element !== parent) {
        offset += element.offsetTop;
        element = element.offsetParent;
    }

    return offset;
}

function getStageBottomShift$1(stage) {
    if (!stage) return 0;

    const listSection = document.querySelector(".about-news-section .news-list-section");

    if (!listSection) return 0;

    const bottomInsideStage =
        getOffsetTopInside$2(stage, listSection) + listSection.offsetHeight;

    return Math.max(0, bottomInsideStage - window.innerHeight - 10);
}

function normalizeNewsContent(root) {
    if (!root) return;

    root.querySelectorAll(
        ".menu, .settings, script, link, style"
    ).forEach((node) => {
        node.remove();
    });

    root.querySelectorAll(
        ".news-tabs, .news-tabs__list, .news-tabs__item, .news-tab, .news-filter, .news-filters"
    ).forEach((node) => {
        node.remove();
    });

    root.querySelectorAll(".news-article").forEach((article) => {
        article.classList.remove("is-active");
        article.style.display = "";
    });

    root.querySelectorAll(".news-list-section").forEach((section) => {
        section.classList.remove(
            "is-hidden",
            "is-disabled",
            "is-inactive",
            "hidden"
        );

        section.removeAttribute("hidden");
        section.removeAttribute("aria-hidden");

        section.style.display = "";
        section.style.visibility = "";
        section.style.opacity = "";
    });

    root.querySelectorAll(".news-list").forEach((list) => {
        list.classList.remove(
            "is-hidden",
            "is-disabled",
            "is-inactive",
            "hidden"
        );

        list.removeAttribute("hidden");
        list.removeAttribute("aria-hidden");

        list.style.display = "";
        list.style.visibility = "";
        list.style.opacity = "";
    });

    root.querySelectorAll(".news-list__item").forEach((item) => {
        item.classList.remove(
            "is-hidden",
            "is-disabled",
            "is-inactive",
            "hidden"
        );

        item.removeAttribute("hidden");
        item.removeAttribute("aria-hidden");

        item.style.display = "";
        item.style.visibility = "";
        item.style.opacity = "";
        item.style.pointerEvents = "";
    });

    root.querySelectorAll(".news-list-scrollbar").forEach((scrollbar) => {
        scrollbar.remove();
    });
}

function ensureNewsListScrollbar() {
    const {
        listContent,
        newsList
    } = getElements$1();

    if (!listContent || !newsList) return;

    if (listContent.querySelector(".news-list-scrollbar")) return;

    const scrollbar = document.createElement("div");
    scrollbar.className = "news-list-scrollbar";

    const scrollbarFill = document.createElement("div");
    scrollbarFill.className = "news-list-scrollbar__fill";

    const scrollbarArrow = document.createElement("div");
    scrollbarArrow.className = "news-list-scrollbar__arrow";

    scrollbar.appendChild(scrollbarFill);
    scrollbar.appendChild(scrollbarArrow);

    listContent.appendChild(scrollbar);
}

function ensureAllNewsButton() {
    const bottom = document.querySelector(
        ".about-news-section .news-list-section__bottom"
    );

    if (!bottom) return;
    if (bottom.querySelector(".about-news-all-link")) return;

    const link = document.createElement("a");
    link.className = "about-news-all-link";
    link.href = getPageUrl("news");
    link.textContent = "Все новости";

    bottom.prepend(link);
}

function updateNewsListScrollbar() {
    const {
        newsList,
        listScrollbar,
        listScrollbarFill
    } = getElements$1();

    if (!newsList || !listScrollbar || !listScrollbarFill) return;

    const maxScroll = newsList.scrollHeight - newsList.clientHeight;

    if (maxScroll <= 0) {
        listScrollbar.style.opacity = "0";
        listScrollbarFill.style.height = "0%";
        return;
    }

    listScrollbar.style.opacity = "1";

    const progress = newsList.scrollTop / maxScroll;
    const fill = Math.max(0, Math.min(100, progress * 100));

    listScrollbarFill.style.height = `${fill}%`;
}

function initCustomNewsScroll() {
    const {
        listSection,
        newsList
    } = getElements$1();

    if (!listSection || !newsList) return;
    if (newsList.dataset.aboutNewsScrollbarReady === "true") return;

    ensureNewsListScrollbar();

    newsList.addEventListener("scroll", updateNewsListScrollbar);

    listSection.addEventListener(
        "wheel",
        (event) => {
            const maxScroll = newsList.scrollHeight - newsList.clientHeight;

            if (maxScroll <= 0) return;

            const delta = event.deltaY;

            const atTop = newsList.scrollTop <= 0;
            const atBottom = newsList.scrollTop >= maxScroll - 1;

            const canScrollInside =
                (delta < 0 && !atTop) ||
                (delta > 0 && !atBottom);

            if (canScrollInside) {
                event.preventDefault();
                event.stopPropagation();

                newsList.scrollTop += delta;
                updateNewsListScrollbar();
            }
        },
        { passive: false }
    );

    window.addEventListener("resize", updateNewsListScrollbar);

    newsList.dataset.aboutNewsScrollbarReady = "true";

    requestAnimationFrame(updateNewsListScrollbar);
    setTimeout(updateNewsListScrollbar, 150);
    setTimeout(updateNewsListScrollbar, 600);
}

function setActiveArticle(articleKey) {
    const {
        articles,
        listItems,
        stage
    } = getElements$1();

    let hasTargetArticle = false;

    articles.forEach((article) => {
        const isActive = article.dataset.newsArticle === articleKey;

        if (isActive) {
            hasTargetArticle = true;
        }

        article.classList.toggle("is-active", isActive);
    });

    if (!hasTargetArticle) return;

    listItems.forEach((item) => {
        item.classList.toggle(
            "is-active",
            item.dataset.newsTarget === articleKey
        );
    });

    if (stage) {
        stage.style.transform = "translateY(0)";
    }

    document.body.classList.add("about-news-article-open");
}

function showNewsListOnly() {
    const {
        articles,
        listItems,
        newsList,
        stage
    } = getElements$1();

    document.body.classList.remove("about-news-article-open");

    articles.forEach((article) => {
        article.classList.remove("is-active");
    });

    listItems.forEach((item) => {
        item.classList.remove("is-active");
    });

    if (newsList) {
        newsList.scrollTop = 0;
    }

    if (stage) {
        stage.style.transform = "translateY(0)";
    }

    requestAnimationFrame(updateNewsListScrollbar);
}

function initInteractions() {
    const {
        listItems,
        relatedItems,
        scrollToTopButtons
    } = getElements$1();

    listItems.forEach((item) => {
        if (item.dataset.aboutNewsReady === "true") return;

        item.addEventListener("click", () => {
            const target = item.dataset.newsTarget || "sales";
            setActiveArticle(target);
        });

        item.dataset.aboutNewsReady = "true";
    });

    relatedItems.forEach((item) => {
        if (item.dataset.aboutNewsRelatedReady === "true") return;

        item.addEventListener("click", () => {
            const target = item.dataset.newsTarget || "sales";
            setActiveArticle(target);
        });

        item.dataset.aboutNewsRelatedReady = "true";
    });

    scrollToTopButtons.forEach((button) => {
        if (button.dataset.aboutNewsScrollTopReady === "true") return;

        button.addEventListener("click", () => {
            const { stage } = getElements$1();

            if (stage) {
                stage.style.transform = "translateY(0)";
            }
        });

        button.dataset.aboutNewsScrollTopReady = "true";
    });
}

async function loadNewsContent() {
    const { section } = getElements$1();

    if (!section || isLoading$1 || isReady$1) return;

    isLoading$1 = true;

    try {
        const response = await fetch(getPageUrl("news"));
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        normalizeNewsContent(doc);

        const sourceNodes = [
            doc.querySelector(".news-stage"),
            doc.querySelector(".news-arrow")
        ].filter(Boolean);

        section.innerHTML = "";

        sourceNodes.forEach((node) => {
            const clone = node.cloneNode(true);
            normalizeNewsContent(clone);
            section.appendChild(clone);
        });

        normalizeNewsContent(section);
        ensureNewsListScrollbar();
        ensureAllNewsButton();
        initInteractions();
        initCustomNewsScroll();

        isReady$1 = true;
        isLoading$1 = false;

        showNewsListOnly();
        updateAboutNewsSection(0);
    } catch (error) {
        console.error("About news load error:", error);

        section.innerHTML = `
            <div class="about-news-section__loader">
                Не удалось загрузить новости
            </div>
        `;

        isLoading$1 = false;
    }
}

function initAboutNewsSection() {
    if (!document.body.classList.contains("about-page")) return;

    loadNewsContent();
}

function updateAboutNewsSection(globalProgress) {
    if (!document.body.classList.contains("about-page")) return;

    const {
        section,
        stage,
        arrow
    } = getElements$1();

    if (!section) return;

    const revealY = mapRangeSmooth$1(
        globalProgress,
        ABOUT_NEWS_REVEAL_START,
        ABOUT_NEWS_START,
        100,
        0
    );

    const localProgress = clamp$3(
        globalProgress - ABOUT_NEWS_START,
        0,
        ABOUT_NEWS_MAX
    );

    section.style.transform = `translateY(${revealY}vh)`;

    if (!isReady$1) {
        updatePageScrollbar(globalProgress);
        return;
    }

    if (stage) {
        if (document.body.classList.contains("about-news-article-open")) {
            const maxStageShift = getStageBottomShift$1(stage);

            const stageY = mapRange$2(
                localProgress,
                0,
                ABOUT_NEWS_MAX,
                0,
                -maxStageShift
            );

            stage.style.transform = `translateY(${stageY}px)`;
        } else {
            stage.style.transform = "translateY(0)";
        }
    }

    if (arrow) {
        arrow.style.opacity = "0";
        arrow.style.pointerEvents = "none";
    }

    updateNewsListScrollbar();
    updatePageScrollbar(globalProgress);
}

var aboutNewsSection = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initAboutNewsSection: initAboutNewsSection,
    updateAboutNewsSection: updateAboutNewsSection
});

let isReady = false;
let isLoading = false;

function clamp$2(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function smoothstep(value) {
    const x = clamp$2(value, 0, 1);
    return x * x * (3 - 2 * x);
}

function mapRangeSmooth(value, inMin, inMax, outMin, outMax) {
    const progress = smoothstep((value - inMin) / (inMax - inMin));
    return outMin + (outMax - outMin) * progress;
}

function getElements() {
    return {
        section: document.querySelector(".about-contacts-section")
    };
}

function normalizeContactsContent(root) {
    if (!root) return;

    root.querySelectorAll(".menu, .settings, script, link, style").forEach((node) => {
        node.remove();
    });
}

async function loadContactsContent() {
    const { section } = getElements();

    if (!section || isLoading || isReady) return;

    isLoading = true;

    try {
        const response = await fetch(getPageUrl("contacts"));
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        normalizeContactsContent(doc);

        const contacts = doc.querySelector(".contacts");

        section.innerHTML = "";

        if (contacts) {
            const clone = contacts.cloneNode(true);
            normalizeContactsContent(clone);
            section.appendChild(clone);
        } else {
            section.innerHTML = `
                <div class="about-contacts-section__loader">
                    Контакты не найдены
                </div>
            `;
        }

        isReady = true;
        isLoading = false;

        updateAboutContactsSection(0);
    } catch (error) {
        console.error("About contacts load error:", error);

        section.innerHTML = `
            <div class="about-contacts-section__loader">
                Не удалось загрузить контакты
            </div>
        `;

        isLoading = false;
    }
}

function initAboutContactsSection() {
    if (!document.body.classList.contains("about-page")) return;

    loadContactsContent();
}

function updateAboutContactsSection(globalProgress) {
    if (!document.body.classList.contains("about-page")) return;

    const { section } = getElements();

    if (!section) return;

    const revealY = mapRangeSmooth(
        globalProgress,
        ABOUT_CONTACTS_REVEAL_START,
        ABOUT_CONTACTS_START,
        100,
        0
    );

    section.style.transform = `translateY(${revealY}vh)`;

    updatePageScrollbar(globalProgress);
}

var aboutContactsSection = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initAboutContactsSection: initAboutContactsSection,
    updateAboutContactsSection: updateAboutContactsSection
});

const PROJECTS_MAX_PROGRESS = 5;

let currentProjectCard = null;

function clamp$1(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange$1(value, inMin, inMax, outMin, outMax) {
    const progress = clamp$1((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}

function getProjectsElements() {
    return {
        bgImg: document.querySelector(".projects-bg__img"),
        stage: document.querySelector(".projects-stage"),
        paralaxText: document.querySelector(".projects-paralax-text"),
        title: document.querySelector(".projects__title"),
        servicesViewport: document.querySelector(".projects-services-viewport"),
        arrow: document.querySelector(".projects-arrow"),

        detail: document.querySelector(".project-detail"),
        detailImg: document.querySelector(".project-detail__img"),
        detailTitle: document.querySelector(".project-detail__title"),
        detailGenre: document.querySelector(".project-detail__genre"),
        detailNote: document.querySelector(".project-detail__note"),
        detailDescription: document.querySelector(".project-detail__description"),
        detailText: document.querySelector(".project-detail__text"),
        detailScrollbarFill: document.querySelector(".project-detail__scrollbar-fill"),
        detailAge: document.querySelector(".project-detail__age"),
        detailFormat: document.querySelector(".project-detail__format"),
        detailDuration: document.querySelector(".project-detail__duration"),
        detailPrevNav: document.querySelector(".project-detail__nav--prev"),
        detailCloseNav: document.querySelector(".project-detail__nav--close"),
        detailNextNav: document.querySelector(".project-detail__nav--next"),

        requestPopup: document.querySelector(".projects-request-popup"),
        requestPopupDialog: document.querySelector(".projects-request-popup__dialog"),
        requestPopupClose: document.querySelector(".projects-request-popup__close"),
        requestForm: document.querySelector(".projects-request-form"),
        requestProjectInput: document.querySelector(".projects-request-form__project")
    };
}

function getOffsetTopInside$1(parent, child) {
    let offset = 0;
    let element = child;

    while (element && element !== parent) {
        offset += element.offsetTop;
        element = element.offsetParent;
    }

    return offset;
}

function getTvCardsBottomShift(stage) {
    if (!stage) return 0;

    const tvSection = document.querySelector(".projects-section--tv");
    const tvGrid = document.querySelector(".projects-section--tv .projects-grid");
    const target = tvSection || tvGrid;

    if (!target) return 0;

    const targetTopInsideStage = getOffsetTopInside$1(stage, target);
    const targetBottomInsideStage = targetTopInsideStage + target.offsetHeight;

    return Math.max(
        0,
        targetBottomInsideStage - window.innerHeight
    );
}

function syncProjectsTitleBackground(bgImg, title) {
    if (!bgImg || !title) return;

    const imgRect = bgImg.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    const naturalWidth = bgImg.naturalWidth || imgRect.width;
    const naturalHeight = bgImg.naturalHeight || imgRect.height;

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

function updateProjectDetailTextScrollbar() {
    const {
        detailText,
        detailScrollbarFill
    } = getProjectsElements();

    const textWrap = document.querySelector(".project-detail__text-wrap");
    const scrollbar = document.querySelector(".project-detail__scrollbar");

    if (!detailText || !detailScrollbarFill || !textWrap || !scrollbar) return;

    const scrollableHeight = detailText.scrollHeight - detailText.clientHeight;
    const hasScroll = scrollableHeight > 2;

    textWrap.classList.toggle("has-scroll", hasScroll);

    if (!hasScroll) {
        detailScrollbarFill.style.height = "0%";
        detailScrollbarFill.style.transform = "translateY(0)";
        return;
    }

    const progress = detailText.scrollTop / scrollableHeight;
    const visibleRatio = detailText.clientHeight / detailText.scrollHeight;

    const fillHeight = Math.max(14, visibleRatio * 100);
    const maxMove = 100 - fillHeight;

    detailScrollbarFill.style.height = `${fillHeight}%`;
    detailScrollbarFill.style.transform = `translateY(${progress * maxMove}%)`;
}

function initProjectDetailTextScrollbar() {
    const { detailText } = getProjectsElements();

    if (!detailText) return;
    if (detailText.dataset.scrollbarReady === "true") return;

    detailText.addEventListener("scroll", () => {
        updateProjectDetailTextScrollbar();
    });

    detailText.addEventListener(
        "wheel",
        (e) => {
            const delta = e.deltaY;

            const atTop = detailText.scrollTop <= 0;
            const atBottom =
                detailText.scrollTop + detailText.clientHeight >=
                detailText.scrollHeight - 1;

            const canScrollUp = delta < 0 && !atTop;
            const canScrollDown = delta > 0 && !atBottom;

            if (canScrollUp || canScrollDown) {
                e.stopPropagation();
                e.preventDefault();

                detailText.scrollTop += delta;

                requestAnimationFrame(() => {
                    updateProjectDetailTextScrollbar();
                });
            }
        },
        { passive: false }
    );

    detailText.dataset.scrollbarReady = "true";
}

function initProjectsServicesHorizontalScroll() {
    const { servicesViewport } = getProjectsElements();

    if (!servicesViewport) return;
    if (servicesViewport.dataset.horizontalScrollReady === "true") return;

    servicesViewport.addEventListener(
        "wheel",
        (e) => {
            const horizontalDelta = Math.abs(e.deltaX);
            const verticalDelta = Math.abs(e.deltaY);

            const isHorizontalScroll = horizontalDelta > verticalDelta;

            if (!isHorizontalScroll) return;

            e.preventDefault();
            e.stopPropagation();

            servicesViewport.scrollLeft += e.deltaX;
        },
        { passive: false }
    );

    servicesViewport.dataset.horizontalScrollReady = "true";
}

function getProjectCards() {
    return Array.from(document.querySelectorAll(".project-card"));
}

function openAdjacentProject(direction) {
    if (!currentProjectCard) return;

    const cards = getProjectCards();
    const currentIndex = cards.indexOf(currentProjectCard);

    if (currentIndex < 0 || !cards.length) return;

    const nextIndex = (currentIndex + direction + cards.length) % cards.length;
    openProjectDetail(cards[nextIndex]);
}

function getCurrentDetailProjectTitle() {
    const { detail, detailTitle } = getProjectsElements();

    if (!detail || !detail.classList.contains("is-open") || !detailTitle) {
        return "";
    }

    return detailTitle.textContent.trim();
}

function openProjectDetail(card) {
    const {
        detail,
        detailImg,
        detailTitle,
        detailGenre,
        detailNote,
        detailDescription,
        detailText,
        detailAge,
        detailFormat,
        detailDuration
    } = getProjectsElements();

    if (!detail || !card) return;

    currentProjectCard = card;

    const img = card.querySelector("img");

    const title = card.dataset.projectTitle || img?.alt || "";
    const genre = card.dataset.projectGenre || "";
    const note = card.dataset.projectNote || "";
    const age = card.dataset.projectAge || "";
    const format = card.dataset.projectFormat || "";
    const duration = card.dataset.projectDuration || "";
    const description =
        card.dataset.projectDescription ||
        "Описание проекта находится в разработке.";

    if (detailImg && img) {
        detailImg.src = img.getAttribute("src");
        detailImg.alt = img.getAttribute("alt") || title;
    }

    if (detailTitle) detailTitle.textContent = title;
    if (detailGenre) detailGenre.textContent = genre;
    if (detailNote) detailNote.textContent = note ? `(${note})` : "";
    if (detailDescription) detailDescription.textContent = description;
    if (detailAge) detailAge.textContent = age;
    if (detailFormat) detailFormat.textContent = format;
    if (detailDuration) detailDuration.textContent = duration;

    if (detailText) {
        detailText.scrollTop = 0;
    }

    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.classList.add("projects-detail-open");

    requestAnimationFrame(() => {
        updateProjectDetailTextScrollbar();
    });

    setTimeout(() => {
        updateProjectDetailTextScrollbar();
    }, 150);
}

function closeProjectDetail() {
    const { detail } = getProjectsElements();

    if (!detail) return;

    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    document.body.classList.remove("projects-detail-open");
    currentProjectCard = null;
}

function openProjectRequest(projectTitle = "") {
    const {
        requestPopup,
        requestProjectInput
    } = getProjectsElements();

    if (!requestPopup) return;

    const currentTitle = projectTitle || getCurrentDetailProjectTitle();

    if (requestProjectInput) {
        requestProjectInput.value = currentTitle;
    }

    requestPopup.classList.add("is-open");
    requestPopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("projects-request-open");
}

function closeProjectRequest(resetForm = false) {
    const {
        requestPopup,
        requestForm
    } = getProjectsElements();

    if (!requestPopup) return;

    requestPopup.classList.remove("is-open");
    requestPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("projects-request-open");

    if (resetForm && requestForm) {
        requestForm.reset();
    }
}

function initProjectDetailCards() {
    const { detail, detailPrevNav, detailCloseNav, detailNextNav } = getProjectsElements();

    if (document.body.dataset.projectCardDelegationReady !== "true") {
        document.addEventListener(
            "click",
            (e) => {
                if (!document.body.classList.contains("projects-page")) return;
                if (document.body.classList.contains("projects-request-open")) return;

                const card = e.target.closest(".project-card");

                if (!card) return;
                if (card.closest(".project-detail, .projects-request-popup")) return;

                e.preventDefault();
                openProjectDetail(card);
            },
            true
        );

        document.body.dataset.projectCardDelegationReady = "true";
    }

    if (detailPrevNav && detailPrevNav.dataset.prevReady !== "true") {
        detailPrevNav.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            openAdjacentProject(-1);
        });

        detailPrevNav.dataset.prevReady = "true";
    }

    if (detailNextNav && detailNextNav.dataset.nextReady !== "true") {
        detailNextNav.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            openAdjacentProject(1);
        });

        detailNextNav.dataset.nextReady = "true";
    }

    if (detailCloseNav && detailCloseNav.dataset.closeReady !== "true") {
        detailCloseNav.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            closeProjectDetail();
        });

        detailCloseNav.dataset.closeReady = "true";
    }

    if (detail && detail.dataset.overlayReady !== "true") {
        detail.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        detail.addEventListener("click", (e) => {
            if (e.target === detail) {
                closeProjectDetail();
            }
        });

        detail.dataset.overlayReady = "true";
    }
}

function initProjectRequestPopup() {
    const {
        requestPopup,
        requestPopupDialog,
        requestPopupClose,
        requestForm
    } = getProjectsElements();

    const requestButtons = document.querySelectorAll(".projects-open-request");

    requestButtons.forEach((button) => {
        if (button.dataset.requestReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const projectTitle =
                button.dataset.projectTitle ||
                getCurrentDetailProjectTitle() ||
                "";

            openProjectRequest(projectTitle);
        });

        button.dataset.requestReady = "true";
    });

    if (requestPopupClose && requestPopupClose.dataset.popupCloseReady !== "true") {
        requestPopupClose.addEventListener("click", () => {
            closeProjectRequest();
        });

        requestPopupClose.dataset.popupCloseReady = "true";
    }

    if (requestForm && requestForm.dataset.formReady !== "true") {
        requestForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeProjectRequest(true);
        });

        requestForm.dataset.formReady = "true";
    }

    if (requestPopup && requestPopup.dataset.popupReady !== "true") {
        requestPopup.addEventListener("click", (e) => {
            if (e.target === requestPopup) {
                closeProjectRequest();
            }
        });

        requestPopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        requestPopup.dataset.popupReady = "true";
    }

    if (
        requestPopupDialog &&
        requestPopupDialog.dataset.dialogReady !== "true"
    ) {
        requestPopupDialog.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        requestPopupDialog.dataset.dialogReady = "true";
    }

    if (document.body.dataset.projectEscapeReady !== "true") {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;

            const { requestPopup: popup, detail } = getProjectsElements();

            if (popup && popup.classList.contains("is-open")) {
                closeProjectRequest();
                return;
            }

            if (detail && detail.classList.contains("is-open")) {
                closeProjectDetail();
            }
        });

        document.body.dataset.projectEscapeReady = "true";
    }
}

function initProjectsParallax() {
    if (!document.body.classList.contains("projects-page")) return;

    state.pageProgressMax = PROJECTS_MAX_PROGRESS;

    const { bgImg, arrow } = getProjectsElements();

    initProjectsServicesHorizontalScroll();
    initProjectDetailCards();
    initProjectRequestPopup();
    initProjectDetailTextScrollbar();

    if (bgImg) {
        if (bgImg.complete) {
            updateProjectsScene(state.progress);
        } else {
            bgImg.addEventListener("load", () => {
                updateProjectsScene(state.progress);
            });
        }
    }

    if (arrow) {
        arrow.addEventListener("click", () => {
            if (document.body.classList.contains("projects-detail-open")) return;

            state.targetProgress = clamp$1(
                Math.ceil(state.targetProgress + 0.1),
                0,
                PROJECTS_MAX_PROGRESS
            );
        });
    }

    updateProjectsScene(state.progress);
}

function updateProjectsScene(progressValue) {
    if (!document.body.classList.contains("projects-page")) return;

    const p = clamp$1(progressValue, 0, PROJECTS_MAX_PROGRESS);

    const {
        bgImg,
        stage,
        paralaxText,
        title,
        arrow
    } = getProjectsElements();

    if (stage) {
        const maxStageShift = getTvCardsBottomShift(stage);

        const stageY = mapRange$1(
            p,
            1,
            PROJECTS_MAX_PROGRESS,
            0,
            -maxStageShift
        );

        stage.style.transform = `translateY(${stageY}px)`;
    }

    if (bgImg) {
        const bgMove = mapRange$1(p, 0, PROJECTS_MAX_PROGRESS, 0, 120);
        const bgZoom = mapRange$1(p, 0, PROJECTS_MAX_PROGRESS, 1, 1.18);

        bgImg.style.transform = `translateY(${bgMove}px) scale(${bgZoom})`;
    }

    if (paralaxText) {
        const textMove = mapRange$1(p, 0, 1, 0, 100);
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
    }

    if (bgImg && title) {
        syncProjectsTitleBackground(bgImg, title);
    }

    if (arrow) {
        const shouldHideArrow =
            p >= PROJECTS_MAX_PROGRESS - 0.05 ||
            document.body.classList.contains("projects-detail-open");

        arrow.style.opacity = shouldHideArrow ? "0" : "1";
        arrow.style.pointerEvents = shouldHideArrow ? "none" : "auto";
    }

    updatePageScrollbar(p);
}

function resetProjectsScene() {
    if (!document.body.classList.contains("projects-page")) return;

    state.progress = 0;
    state.targetProgress = 0;

    updateProjectsScene(0);
}

var projectsParallax = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initProjectsParallax: initProjectsParallax,
    resetProjectsScene: resetProjectsScene,
    updateProjectsScene: updateProjectsScene
});

function getEpisodesText(duration) {
    if (!duration) return "";

    const match = duration.match(/(\d+\s*сер(?:ия|ии|ий))/i);

    if (match) {
        return match[1];
    }

    return duration;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getTitleSizeClass(title) {
    const cleanTitle = title.trim();
    const titleLength = cleanTitle.length;
    const wordsCount = cleanTitle.split(/\s+/).filter(Boolean).length;

    if (titleLength > 42 || wordsCount >= 5) {
        return " is-ultra-long";
    }

    if (titleLength > 30 || wordsCount >= 4) {
        return " is-extra-long";
    }

    if (titleLength > 18 || wordsCount >= 3) {
        return " is-long";
    }

    return "";
}

function initProjectCardHover() {
    const cards = document.querySelectorAll(".project-card");

    cards.forEach((card) => {
        if (card.querySelector(".project-card__hover")) return;

        const title = card.dataset.projectTitle || "";
        const genre = card.dataset.projectGenre || "";
        const age = card.dataset.projectAge || "";
        const duration = card.dataset.projectDuration || "";

        const episodes = getEpisodesText(duration);
        const titleSizeClass = getTitleSizeClass(title);

        const hover = document.createElement("div");
        hover.className = "project-card__hover";

        hover.innerHTML = `
            <div class="project-card__hover-top">
                <span>${escapeHtml(episodes)}</span>
                <span>${escapeHtml(age)}</span>
            </div>

            <div class="project-card__hover-bottom">
                <h3 class="project-card__hover-title${titleSizeClass}">
                    ${escapeHtml(title)}
                </h3>

                <p class="project-card__hover-genre">${escapeHtml(genre)}</p>
            </div>

        `;

        card.appendChild(hover);
    });
}

var projectCardHover = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initProjectCardHover: initProjectCardHover
});

const HELP_MAX_PROGRESS = 2.25;
const HELP_CARDS_IDLE_START = 1.18;

const detailGroups = {
    support: {
        title: "Сопровождение проектов",
        items: [
            {
                title: "Разработка презентаций",
                description:
                    "Презентация проекта — это ключевой этап, который открывает его дальнейшую судьбу. Важно не только иметь сильную идею, но и уметь эффектно и убедительно её подать. Хорошая презентация не просто информирует, а заряжает идеей.\n\nВ работу включены разработка структуры, основные визуальные принципы, которые сделают отличие и уникальность концепции проекта. Составляем помощь в грамотной подготовке всех разделов с учётом требований индустрии, где необходимо привлечь участие в разработке креатива и презентационных проектов.",
                services: [
                    "Презентация проекта",
                    "Библия персонажей"
                ],
                image: "./assets/Услуги Текстура/Разраб Презентации.jpg"
            },
            {
                title: "Ки-арт / дизайн",
                description:
                    "Мы поможем с визуальным оформлением картины: разработаем ки-арт, изображения и композиции на основе референсов, соберём единый постер, титры, логотипы, промо-материалы, социальные сети, айдентику и другие визуальные элементы.\n\nЗадача — создать цельную и выразительную визуальную персонажность проекта.",
                services: [
                    "Ки-арт для фильма",
                    "Разработка постера",
                    "Разработка логотипов",
                    "Титры к фильму",
                    "Фотосъёмка",
                    "Дизайн для социальных сетей",
                    "Разработка сайта"
                ],
                image: "./assets/Услуги Текстура/Ки-арт.jpg"
            },
            {
                title: "Подготовка <br>заявки в: Минкульт,<br> Фонд кино, ИРИ, ПФКИ",
                description:
                    "Профессионально и быстро подготовим пакет документов для получения субсидий, которые выделяются теми или иными производственно-индустриальными фондами, финансовой поддержкой ведомств и организаций.\n\nДля подачи или участия важно пройти этап подготовки правильно и последовательно. Мы ежегодно готовим документы на получение субсидий и имеем большой опыт подачи.",
                services: [
                    "Оформление заявки на субсидию",
                    "Проверка уже подготовленного пакета документов",
                    "Консультации"
                ],
                image: "./assets/Услуги Текстура/Подготовка заявки.jpg"
            },
            {
                title: "Прокатное удостоверение",
                description:
                    "Прокатное удостоверение — подтверждающий документ права владения на фильм. Наличие прокатного удостоверения обязательно для публичных показов фильмов.\n\nГрамотно подготовим пакет документов, отвезём его в Минкульт РФ, следим копию в архив, оплатим пошлины и отдадим вам готовое прокатное удостоверение. С 2024 прокатное удостоверение стало цифровым.",
                services: [
                    "Прокатное на игровой, анимацию, док, фильмы",
                    "Прокатное на сериал",
                    "Сдача исходных материалов в ГФФ",
                    "Монтажные и диалоговые листы",
                    "Запись жесткого диска с DCP и WAV",
                    "Запись кассет HDcam и DVD"
                ],
                image: "./assets/Услуги Текстура/ПрокатУд.jpg"
            },
            {
                title: "Постпродакшн",
                description:
                    "Услуги режиссёрского монтажа с пониманием задачи и сроков. Смонтируем или сократим фильм, сделаем трейлер или фильм о фильме.\n\nПомогаем довести материал до финального состояния и подготовить его к презентации, передаче партнёрам или дальнейшему продвижению.",
                services: [
                    "Монтаж фильма",
                    "Монтаж трейлера",
                    "Фильм о фильме"
                ],
                image: "./assets/Услуги Текстура/Постпродакшн.jpg"
            }
        ]
    },

    advertising: {
        title: "Рекламный департамент",
        items: [
            {
                title: "Креатив",
                description:
                    "Путь в тысячи миль начинается с первого шага, а создание качественного видео контента — с креативной и грамотно расписанной идеи.\n\nПрежде чем начать реализацию задумки, мы детально прорабатываем каждый будущий кадр и создаём надёжный фундамент для успешности проекта.",
                services: [
                    "Сториборд",
                    "Нейминг",
                    "Креативная концепция",
                    "Сценарии"
                ],
                image: "./assets/Услуги Текстура/Креатив.jpg"
            },
            {
                title: "Дизайн",
                description:
                    "Наша команда специалистов по созданию креативной рекламы и созданию ярких впечатлений в цифровых формах ваших брендов.",
                services: [
                    "Разработка фирменного стиля",
                    "Дизайн упаковки",
                    "Адаптивный дизайн",
                    "Веб-дизайн",
                    "Проектирование интерфейсов",
                    "Юзабилити",
                    "Арт, иллюстрации",
                    "Инфографика",
                    "Проектирование и производство выставочных и торговых стендов",
                    "POS-материалы"
                ],
                image: "./assets/Услуги Текстура/Дизайн.jpg"
            },
            {
                title: "Планирование",
                description:
                    "Работая со смыслами, мы делим на следующие этапы:\n\n1 — ПОИСК РАМОК\nЗа которые нам нужно выйти. Это поиск стереотипных действий, которые совершают наши конкуренты, и шаблоны мышления, в которых находятся потребители.\n\n2 — ПОИСК ТРЕНДОВ\nВ каком будущем предстоит жить бренду и на какие ценности важно отозваться и оказывать влияние.\n\n3 — СОЗДАНИЕ ИНСТРУМЕНТОВ\nКоторые разрушают стереотипы, которые позволяют легко донести ценности и обогнать конкурентов.",
                services: [
                    "Исследование и аналитика",
                    "Стратегии",
                    "Бренд-консалтинг"
                ],
                image: "./assets/Услуги Текстура/Планирование.jpg"
            },
            {
                title: "Видеосъёмка",
                description:
                    "Наша команда осуществляет полный цикл производства коммерческого видео, ТВ-передач, фильмов, сериалов и диджитал проектов.\n\nМы вам готовы предложить как проекты «под ключ», так и совместное производство.",
                services: [
                    "Рекламные ролики",
                    "Вирусные ролики",
                    "Имиджевые ролики",
                    "Анимационные ролики",
                    "Разработка YouTube/SMM каналов",
                    "Корпоративные фильмы",
                    "Трансляции",
                    "Продающее видео",
                    "Видео-отзывы",
                    "Репортажная съёмка",
                    "Аэросъёмка"
                ],
                image: "./assets/Услуги Текстура/Видеосъемка.jpg"
            },
            {
                title: "Фотосъёмка",
                description:
                    "Наши фотохудожники готовы передать качество и эстетику вашей продукции до мельчайших подробностей. Мы используем только современное оборудование, а среди наших фотографов есть победители международных конкурсов.",
                services: [
                    "Предметная фотосъёмка",
                    "Для маркетплейсов",
                    "Рекламная съёмка",
                    "Дополнительный сервис",
                    "Мероприятия"
                ],
                image: "./assets/Услуги Текстура/Фотосъемка.jpg"
            },
            {
                title: "Организация мероприятий",
                description:
                    "Наши специалисты разработают креативную идею и реализуют её визуализацию. Мы изготовим элементы проекта, предоставляем мультимедийное оборудование и интерактивный контент, текстовые, фото, аудио и видеоматериалы.\n\nРазработаем, доставим и установим выставочные и торговые конструкции на объектах.",
                services: [
                    "Концерты",
                    "Спортивные мероприятия",
                    "Проведение презентаций, конференций и других мероприятий"
                ],
                image: "./assets/Услуги Текстура/Организация мероприятий.jpg"
            },
            {
                title: "Интернет-маркетинг",
                description:
                    "Наше агентство работает с 95% площадок Рунета. Ваши рекламные объявления появляются в популярных системах Яндекс и Google, а также появляются на сайтах партнёров поисковых систем и социальных сетях.\n\nПодберём наиболее эффективные площадки для проведения рекламных кампаний.\n\nМЫ СЕРТИФИЦИРОВАННОЕ АГЕНТСТВО.",
                services: [
                    "Поисковое продвижение",
                    "SEO продвижение сайта",
                    "Разработка сайтов",
                    "Баинг"
                ],
                image: "./assets/Услуги Текстура/Интернет-маркетинг.jpg"
            },
            {
                title: "СММ",
                description:
                    "Управление маркетингом и социальных сетях. Работаем над имиджем вашей компании и помогаем выстроить коммуникацию с аудиторией.",
                services: [
                    "Представительство бренда в социальных сетях",
                    "Таргетированная реклама",
                    "Работа с блогерами"
                ],
                image: "./assets/Услуги Текстура/СММ.jpg"
            }
        ]
    }
};

let currentDetailGroupKey = "support";
let detailWheelLocked = false;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * progress;
}

function getHelpElements() {
    return {
        bgImg: document.querySelector(".help-bg__img"),
        stage: document.querySelector(".help-stage"),
        paralaxText: document.querySelector(".help-paralax-text, .help-parallax-text"),
        title: document.querySelector(".help__title"),
        arrow: document.querySelector(".help-arrow"),

        detail: document.querySelector(".help-detail"),
        detailClose: document.querySelector(".help-detail__back"),
        detailBreadcrumbHome: document.querySelector(".help-detail__breadcrumbs-home"),
        detailBreadcrumbCurrent: document.querySelector(".help-detail__breadcrumbs-current"),
        detailNavList: document.querySelector(".help-detail__nav-list"),
        detailText: document.querySelector(".help-detail__text"),
        detailDescription: document.querySelector(".help-detail__description"),
        detailServicesList: document.querySelector(".help-detail__services-list"),
        detailImg: document.querySelector(".help-detail__img"),
        detailArrow: document.querySelector(".help-detail__arrow"),

        requestPopup: document.querySelector(".help-request-popup"),
        requestPopupDialog: document.querySelector(".help-request-popup__dialog"),
        requestPopupClose: document.querySelector(".help-request-popup__close"),
        requestForm: document.querySelector(".help-request-form"),
        requestServiceInput: document.querySelector(".help-request-form__service"),
        requestServiceVisibleInput: document.querySelector(".help-request-form__service-visible"),

        pricePopup: document.querySelector(".help-price-popup"),
        pricePopupDialog: document.querySelector(".help-price-popup__dialog"),
        pricePopupClose: document.querySelector(".help-price-popup__close"),
        priceForm: document.querySelector(".help-price-form"),
        priceButtons: document.querySelectorAll(".help-detail__download-price")
    };
}

function getCurrentGroup() {
    return detailGroups[currentDetailGroupKey] || detailGroups.support;
}

function getCurrentDetailIndex() {
    const activeButton = document.querySelector(".help-detail__nav-item.is-active");

    return Number(activeButton?.dataset.helpDetailIndex || 0);
}

function switchDetailGroup(direction = 1, targetIndex = 0) {
    const groupKeys = Object.keys(detailGroups);
    const currentGroupIndex = Math.max(
        0,
        groupKeys.indexOf(currentDetailGroupKey)
    );
    const nextGroupIndex =
        (currentGroupIndex + direction + groupKeys.length) % groupKeys.length;

    currentDetailGroupKey = groupKeys[nextGroupIndex];

    const group = getCurrentGroup();
    const nextIndex = targetIndex < 0
        ? group.items.length - 1
        : Math.min(targetIndex, group.items.length - 1);

    renderDetailNav(nextIndex);
    renderDetail(nextIndex);
}

function stepDetail(direction = 1) {
    const group = getCurrentGroup();
    const currentIndex = getCurrentDetailIndex();
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < group.items.length) {
        renderDetail(nextIndex);
        return;
    }

    switchDetailGroup(direction, direction > 0 ? 0 : -1);
}

function getOffsetTopInside(parent, child) {
    let offset = 0;
    let element = child;

    while (element && element !== parent) {
        offset += element.offsetTop;
        element = element.offsetParent;
    }

    return offset;
}

function getStageBottomShift(stage) {
    if (!stage) return 0;

    const cardsSection = document.querySelector(".help-cards-section");

    if (!cardsSection) return 0;

    const sectionTopInsideStage = getOffsetTopInside(stage, cardsSection);
    const sectionBottomInsideStage =
        sectionTopInsideStage + cardsSection.offsetHeight;
    return Math.max(
        0,
        sectionBottomInsideStage - window.innerHeight
    );
}

function syncHelpTitleBackground(bgImg, title) {
    if (!bgImg || !title) return;

    const imgRect = bgImg.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    const naturalWidth = bgImg.naturalWidth || imgRect.width;
    const naturalHeight = bgImg.naturalHeight || imgRect.height;

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

function renderDetailNav(activeIndex = 0) {
    const {
        detailBreadcrumbCurrent,
        detailNavList
    } = getHelpElements();

    const group = getCurrentGroup();

    if (detailBreadcrumbCurrent) {
        detailBreadcrumbCurrent.textContent = group.title;
        detailBreadcrumbCurrent.title = "Переключить набор услуг";
    }

    if (!detailNavList) return;

    detailNavList.innerHTML = group.items
        .map((item, index) => {
            const activeClass = index === activeIndex ? " is-active" : "";

            return `
                <button
                    class="help-detail__nav-item${activeClass}"
                    type="button"
                    data-help-detail-index="${index}"
                >
                    ${item.title}
                </button>
            `;
        })
        .join("");

    detailNavList.querySelectorAll(".help-detail__nav-item").forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.helpDetailIndex || 0);
            renderDetail(index);
        });
    });
}

function renderDetail(index) {
    const {
        detailDescription,
        detailServicesList,
        detailImg,
        detailNavList,
        detailText
    } = getHelpElements();

    const group = getCurrentGroup();
    const item = group.items[index];

    if (!item) return;

    if (detailNavList) {
        detailNavList.querySelectorAll(".help-detail__nav-item").forEach((button, buttonIndex) => {
            button.classList.toggle("is-active", buttonIndex === index);
        });
    }

    if (detailDescription) {
        detailDescription.textContent = item.description;
    }

    if (detailText) {
        detailText.scrollTop = 0;
    }

    if (detailServicesList) {
        detailServicesList.innerHTML = item.services
            .map((service) => `<li>${service}</li>`)
            .join("");
    }

    if (detailImg) {
        detailImg.src = getAssetUrl(item.image);
        detailImg.alt = item.title;
    }
}

function openHelpDetail(card) {
    const { detail } = getHelpElements();

    if (!detail || !card) return;

    const kind = card.dataset.helpKind || "support";

    currentDetailGroupKey = kind === "advertising" ? "advertising" : "support";

    renderDetailNav(0);
    renderDetail(0);

    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.classList.add("help-detail-open");
}

function closeHelpDetail() {
    const { detail } = getHelpElements();

    if (!detail) return;

    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    document.body.classList.remove("help-detail-open");
}

function goToHelpPage() {
    const helpUrl = getPageUrl("help");

    if (new URL(helpUrl, window.location.href).href === window.location.href) {
        closeHelpDetail();
        return;
    }

    window.location.href = helpUrl;
}

function getCurrentDetailServiceTitle() {
    const activeButton = document.querySelector(".help-detail__nav-item.is-active");

    if (!activeButton) return getCurrentGroup().title;

    return activeButton.textContent.trim();
}

function openHelpRequest(serviceTitle = "") {
    const {
        requestPopup,
        requestServiceInput,
        requestServiceVisibleInput
    } = getHelpElements();

    if (!requestPopup) return;

    const currentTitle = serviceTitle || getCurrentDetailServiceTitle();

    if (requestServiceInput) {
        requestServiceInput.value = currentTitle;
    }

    if (requestServiceVisibleInput) {
        requestServiceVisibleInput.value = currentTitle;
    }

    requestPopup.classList.add("is-open");
    requestPopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("help-request-open");
}

function closeHelpRequest(resetForm = false) {
    const {
        requestPopup,
        requestForm
    } = getHelpElements();

    if (!requestPopup) return;

    requestPopup.classList.remove("is-open");
    requestPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("help-request-open");

    if (resetForm && requestForm) {
        requestForm.reset();
    }
}

function openHelpPricePopup() {
    const { pricePopup } = getHelpElements();

    if (!pricePopup) return;

    pricePopup.classList.add("is-open");
    pricePopup.setAttribute("aria-hidden", "false");
    document.body.classList.add("help-price-open");
}

function closeHelpPricePopup(resetForm = false) {
    const {
        pricePopup,
        priceForm
    } = getHelpElements();

    if (!pricePopup) return;

    pricePopup.classList.remove("is-open");
    pricePopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("help-price-open");

    if (resetForm && priceForm) {
        priceForm.reset();
    }
}

function ensureHelpCardDetailButtons(root = document) {
    root.querySelectorAll(".help-large-card").forEach((card) => {
        if (card.querySelector(".help-card-button")) return;

        const button = document.createElement("button");

        button.className = "help-card-button";
        button.type = "button";
        button.textContent = "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435";

        card.appendChild(button);
    });
}
function initHelpDetailCards() {
    const {
        detail,
        detailClose,
        detailArrow,
        detailBreadcrumbHome,
        detailBreadcrumbCurrent
    } = getHelpElements();
    ensureHelpCardDetailButtons();

    document.querySelectorAll(".help-card-button").forEach((button) => {
        if (button.dataset.helpDetailReady === "true") return;

        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            openHelpDetail(button.closest(".help-large-card"));
        });

        button.dataset.helpDetailReady = "true";
    });

    if (detailArrow && detailArrow.dataset.arrowReady !== "true") {
        detailArrow.addEventListener("click", () => {
            stepDetail(1);
        });

        detailArrow.dataset.arrowReady = "true";
    }

    if (
        detailBreadcrumbHome &&
        detailBreadcrumbHome.dataset.homeReady !== "true"
    ) {
        detailBreadcrumbHome.addEventListener("click", () => {
            goToHelpPage();
        });

        detailBreadcrumbHome.dataset.homeReady = "true";
    }

    if (
        detailBreadcrumbCurrent &&
        detailBreadcrumbCurrent.dataset.groupSwitchReady !== "true"
    ) {
        detailBreadcrumbCurrent.addEventListener("click", () => {
            switchDetailGroup(1, 0);
        });

        detailBreadcrumbCurrent.dataset.groupSwitchReady = "true";
    }

    if (detailClose && detailClose.dataset.closeReady !== "true") {
        detailClose.addEventListener("click", closeHelpDetail);
        detailClose.dataset.closeReady = "true";
    }

    if (detail && detail.dataset.overlayReady !== "true") {
        detail.addEventListener("wheel", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (detailWheelLocked || Math.abs(e.deltaY) < 4) return;

            detailWheelLocked = true;
            stepDetail(e.deltaY > 0 ? 1 : -1);

            window.setTimeout(() => {
                detailWheelLocked = false;
            }, 320);
        });

        detail.dataset.overlayReady = "true";
    }
}

function initHelpPricePopup() {
    const {
        pricePopup,
        pricePopupDialog,
        pricePopupClose,
        priceForm,
        priceButtons
    } = getHelpElements();

    priceButtons.forEach((button) => {
        if (button.dataset.priceReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            openHelpPricePopup();
        });

        button.dataset.priceReady = "true";
    });

    if (pricePopupClose && pricePopupClose.dataset.priceCloseReady !== "true") {
        pricePopupClose.addEventListener("click", () => {
            closeHelpPricePopup();
        });

        pricePopupClose.dataset.priceCloseReady = "true";
    }

    if (priceForm && priceForm.dataset.priceFormReady !== "true") {
        priceForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeHelpPricePopup(true);
        });

        priceForm.dataset.priceFormReady = "true";
    }

    if (pricePopup && pricePopup.dataset.pricePopupReady !== "true") {
        pricePopup.addEventListener("click", (e) => {
            if (e.target === pricePopup) {
                closeHelpPricePopup();
            }
        });

        pricePopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        pricePopup.dataset.pricePopupReady = "true";
    }

    if (
        pricePopupDialog &&
        pricePopupDialog.dataset.priceDialogReady !== "true"
    ) {
        pricePopupDialog.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        pricePopupDialog.dataset.priceDialogReady = "true";
    }
}

function initHelpRequestPopup() {
    const {
        requestPopup,
        requestPopupDialog,
        requestPopupClose,
        requestForm
    } = getHelpElements();

    const requestButtons = document.querySelectorAll(".help-open-request");

    requestButtons.forEach((button) => {
        if (button.dataset.requestReady === "true") return;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            openHelpRequest(getCurrentDetailServiceTitle());
        });

        button.dataset.requestReady = "true";
    });

    if (requestPopupClose && requestPopupClose.dataset.popupCloseReady !== "true") {
        requestPopupClose.addEventListener("click", () => {
            closeHelpRequest();
        });

        requestPopupClose.dataset.popupCloseReady = "true";
    }

    if (requestForm && requestForm.dataset.formReady !== "true") {
        requestForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeHelpRequest(true);
        });

        requestForm.dataset.formReady = "true";
    }

    if (requestPopup && requestPopup.dataset.popupReady !== "true") {
        requestPopup.addEventListener("click", (e) => {
            if (e.target === requestPopup) {
                closeHelpRequest();
            }
        });

        requestPopup.addEventListener("wheel", (e) => {
            e.stopPropagation();
        });

        requestPopup.dataset.popupReady = "true";
    }

    if (
        requestPopupDialog &&
        requestPopupDialog.dataset.dialogReady !== "true"
    ) {
        requestPopupDialog.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        requestPopupDialog.dataset.dialogReady = "true";
    }

    if (document.body.dataset.helpEscapeReady !== "true") {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;

            const {
                requestPopup: popup,
                pricePopup,
                detail
            } = getHelpElements();

            if (pricePopup && pricePopup.classList.contains("is-open")) {
                closeHelpPricePopup();
                return;
            }

            if (popup && popup.classList.contains("is-open")) {
                closeHelpRequest();
                return;
            }

            if (detail && detail.classList.contains("is-open")) {
                closeHelpDetail();
            }
        });

        document.body.dataset.helpEscapeReady = "true";
    }
}

function initHelpParallax() {
    if (!document.body.classList.contains("help-page")) return;

    state.pageProgressMax = HELP_MAX_PROGRESS;

    const { bgImg, arrow } = getHelpElements();

    initHelpDetailCards();
    initHelpRequestPopup();
    initHelpPricePopup();

    if (bgImg) {
        bgImg.style.transformOrigin = "center center";

        if (bgImg.complete) {
            updateHelpScene(state.progress);
        } else {
            bgImg.addEventListener("load", () => {
                updateHelpScene(state.progress);
            });
        }
    }

    if (arrow) {
        arrow.addEventListener("click", () => {
            state.targetProgress = clamp(
                Math.ceil(state.targetProgress + 0.1),
                0,
                HELP_MAX_PROGRESS
            );
        });
    }

    updateHelpScene(state.progress);
}

function updateHelpScene(progressValue) {
    if (!document.body.classList.contains("help-page")) return;

    const p = clamp(progressValue, 0, HELP_MAX_PROGRESS);
    const heroProgress = clamp(p, 0, 1);

    const {
        bgImg,
        stage,
        paralaxText,
        title,
        arrow
    } = getHelpElements();

    if (stage) {
        const maxStageShift = getStageBottomShift(stage);

        const stageY = mapRange(
            p,
            HELP_CARDS_IDLE_START,
            HELP_MAX_PROGRESS,
            0,
            -maxStageShift
        );

        stage.style.transform = `translateY(${stageY}px)`;
    }

    if (bgImg) {
        const bgZoom = 1 + heroProgress * 0.4;
        const bgMove = heroProgress * 80;

        bgImg.style.transformOrigin = "center center";
        bgImg.style.transform = `translateY(${bgMove}px) scale(${bgZoom})`;
    }

    if (paralaxText) {
        const textMove = heroProgress * 115;
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
    }

    if (bgImg && title) {
        syncHelpTitleBackground(bgImg, title);
    }

    if (arrow) {
        arrow.style.opacity = p >= HELP_MAX_PROGRESS - 0.05 ? "0" : "1";
    }

    updatePageScrollbar(p);
}

function resetHelpScene() {
    if (!document.body.classList.contains("help-page")) return;

    state.progress = 0;
    state.targetProgress = 0;

    updateHelpScene(0);
}

var helpParallax = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initHelpParallax: initHelpParallax,
    resetHelpScene: resetHelpScene,
    updateHelpScene: updateHelpScene
});

function setImageSize(percent) {
    const { title } = getSceneElements();

    if (title) {
        const scale = percent / 200;
        title.style.setProperty("--about-scale", scale);
    }
}

function setImagePosition(percentFromTop) {
    const { title } = getSceneElements();

    if (title) {
        title.style.backgroundPosition = `center ${percentFromTop}%`;
    }

    return null;
}

function setImageLeftOffset(pixels) {
    const { title } = getSceneElements();

    if (title) {
        title.style.backgroundPosition = `${50 + pixels / 10}% center`;
    }
}

function initDebugControls() {
    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
            state.currentLeftOffset = Math.max(0, state.currentLeftOffset - 10);
            setImageLeftOffset(state.currentLeftOffset);
            console.log(`Left offset: ${state.currentLeftOffset}px`);
        } else if (e.key === "ArrowRight") {
            state.currentLeftOffset = state.currentLeftOffset + 10;
            setImageLeftOffset(state.currentLeftOffset);
            console.log(`Left offset: ${state.currentLeftOffset}px`);
        } else if (e.key === "ArrowUp") {
            state.currentPosition = Math.max(0, state.currentPosition - 5);
            setImagePosition(state.currentPosition);
            console.log(`Position: ${state.currentPosition}%`);
        } else if (e.key === "ArrowDown") {
            state.currentPosition = Math.min(50, state.currentPosition + 5);
            setImagePosition(state.currentPosition);
            console.log(`Position: ${state.currentPosition}%`);
        } else if (e.key === "+") {
            state.currentSize = Math.min(500, state.currentSize + 25);
            setImageSize(state.currentSize);
            console.log(`Size: ${state.currentSize}%`);
        } else if (e.key === "-") {
            state.currentSize = Math.max(100, state.currentSize - 25);
            setImageSize(state.currentSize);
            console.log(`Size: ${state.currentSize}%`);
        }
    });
}

var debug = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initDebugControls: initDebugControls
});
