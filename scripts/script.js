const main = document.querySelector(".main-container");
const logoWrapper = document.querySelector(".logo-wrapper");
const logo = document.querySelector(".main__container__logo");
const menuSection = document.querySelector(".menu");

const clickSound = new Audio("./assets/звук кнопки.mp3");
clickSound.volume = 0.5;
clickSound.preload = "auto";

let isSoundEnabled = true;

let progress = 0;
let targetProgress = 0;
let isUIVisible = false;
let clickCount = 0;
let isLogoInMenu = false;
let isLogoMovingToMenu = false;
let currentSize = 200;
let currentPosition = 5;
let currentLeftOffset = 50;

let pageScrollbar = null;
let pageScrollbarThumb = null;
let scrollbarTimer = null;

let aboutTextScrollbar = null;
let aboutTextScrollbarFill = null;

const hasContentLinks = document.querySelector(".content__links");
const contentPage = document.querySelector(".content--page");
const aboutInfoText = document.querySelector(".about-info-text");
const isContactsPage =
    document.body.classList.contains("contacts-page") ||
    document.querySelector(".contacts");

const navigationEntry = performance.getEntriesByType("navigation")[0];
const isPageReload = navigationEntry && navigationEntry.type === "reload";

const shouldSkipIntro =
    sessionStorage.getItem("recStudioSkipIntro") === "true" && !isPageReload;

if (isPageReload) {
    sessionStorage.removeItem("recStudioSkipIntro");
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

const initialMenuLogo = menuSection
    ? menuSection.querySelector(".menu__logo-cont")
    : null;

if (initialMenuLogo) {
    if (main && !(shouldSkipIntro && hasContentLinks)) {
        initialMenuLogo.remove();
    } else {
        initialMenuLogo.style.display = "block";
    }
}

if (main) {
    main.classList.add("show");
    main.classList.remove("hidden");

    if (shouldSkipIntro && hasContentLinks) {
        main.classList.remove("ui-hidden");
        main.classList.add("ui-visible");
        main.classList.add("menu-logo-ready");

        if (logoWrapper) {
            logoWrapper.style.display = "none";
        }

        isUIVisible = true;
        isLogoInMenu = true;
        isLogoMovingToMenu = false;

        createMenuLogo();
        initMenuLogoVisibility();

        sessionStorage.removeItem("recStudioSkipIntro");
    } else {
        main.classList.add("ui-hidden");
        main.classList.remove("ui-visible");
        main.classList.remove("menu-logo-ready");

        if (logoWrapper) {
            logoWrapper.style.display = "";
        }

        isUIVisible = false;
        isLogoInMenu = false;
        isLogoMovingToMenu = false;
    }
}

function playSound() {
    if (!isSoundEnabled) return;

    clickSound.currentTime = 0;
    clickSound.play().catch((e) => console.log("Sound error:", e));
}

const volumeBtn = document.querySelector(".settings__valume-btn");
const volumeIcon = document.querySelector(".settings__valume-btn__img");

function updateVolumeIcon() {
    if (!volumeIcon) return;

    if (isSoundEnabled) {
        volumeIcon.src = "./assets/ЗВУК.png";
        volumeIcon.style.opacity = "0.7";
        volumeIcon.style.filter = "brightness(0) invert(1)";
    } else {
        volumeIcon.src = "./assets/ЗВУКOFF.png";
        volumeIcon.style.opacity = "0.7";
        volumeIcon.style.filter = "brightness(0) invert(1)";
    }
}

if (volumeBtn) {
    volumeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isSoundEnabled = !isSoundEnabled;
        updateVolumeIcon();
    });
}

updateVolumeIcon();

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

function initMenuLogoColorToggle(menuLogo) {
    if (!menuLogo) return;
    if (menuLogo.dataset.colorToggleReady === "true") return;

    if (!menuLogo.dataset.logoColor) {
        setMenuLogoColor(menuLogo, "red");
    }

    menuLogo.addEventListener("click", (e) => {
        e.stopPropagation();
        playSound();

        const currentColor = menuLogo.dataset.logoColor;
        const nextColor = currentColor === "white" ? "red" : "white";

        setMenuLogoColor(menuLogo, nextColor);

        menuLogo.style.transform = "scale(0.9)";

        setTimeout(() => {
            menuLogo.style.transform = "scale(1)";
        }, 150);
    });

    menuLogo.dataset.colorToggleReady = "true";
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
            0% {
                box-shadow: 0 0 0px rgba(255, 0, 0, 0);
            }
            50% {
                box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
            }
            100% {
                box-shadow: 0 0 0px rgba(255, 0, 0, 0);
            }
        }

        @keyframes menuLogoGlowWhite {
            0% {
                box-shadow: 0 0 0px rgba(255, 255, 255, 0);
            }
            50% {
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
            }
            100% {
                box-shadow: 0 0 0px rgba(255, 255, 255, 0);
            }
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
    if (!menuSection) return null;

    let menuLogo = menuSection.querySelector(".menu__logo-cont");

    if (menuLogo) {
        setMenuLogoColor(menuLogo, menuLogo.dataset.logoColor || "red");
        initMenuLogoColorToggle(menuLogo);
        return menuLogo;
    }

    menuLogo = document.createElement("div");
    menuLogo.className = "menu__logo-cont red-glow";
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
    initMenuLogoColorToggle(menuLogo);

    const menuBlock = menuSection.querySelector(".menu-block");

    if (menuBlock) {
        menuSection.insertBefore(menuLogo, menuBlock);
    } else {
        menuSection.insertBefore(menuLogo, menuSection.firstChild);
    }

    return menuLogo;
}

function initMenuLogoVisibility() {
    let menuLogo = menuSection
        ? menuSection.querySelector(".menu__logo-cont")
        : null;

    if (main) {
        if (isLogoInMenu && !isLogoMovingToMenu) {
            menuLogo = createMenuLogo();

            if (!menuLogo) return;

            main.classList.add("menu-logo-ready");

            menuLogo.style.display = "block";
            menuLogo.style.opacity = "0.8";
            menuLogo.style.visibility = "visible";
            menuLogo.style.pointerEvents = "auto";

            initMenuLogoColorToggle(menuLogo);
        } else {
            if (menuLogo) {
                menuLogo.remove();
            }

            main.classList.remove("menu-logo-ready");
        }
    } else {
        menuLogo = createMenuLogo();

        if (!menuLogo) return;

        menuLogo.style.display = "block";
        menuLogo.style.opacity = "0.8";
        menuLogo.style.visibility = "visible";
        menuLogo.style.pointerEvents = "auto";

        initMenuLogoColorToggle(menuLogo);
    }
}

initMenuLogoVisibility();

function getSceneElements() {
    return {
        baseImg: document.querySelector(".about__img"),
        paralaxText: document.querySelector(".paralax-text"),
        infoBlock: document.querySelector(".about-info"),
        title: document.querySelector(".about__title")
    };
}

function initPageScrollbar() {
    if (!contentPage) return;

    pageScrollbar = document.createElement("div");
    pageScrollbar.className = "page-scrollbar";

    pageScrollbarThumb = document.createElement("div");
    pageScrollbarThumb.className = "page-scrollbar__thumb";

    pageScrollbar.appendChild(pageScrollbarThumb);
    document.body.appendChild(pageScrollbar);

    updatePageScrollbar(progress);
}

initPageScrollbar();

function updatePageScrollbar(p) {
    if (!pageScrollbar || !pageScrollbarThumb) return;

    if (isContactsPage) {
        pageScrollbarThumb.style.height = "0%";
        return;
    }

    const fill = Math.max(0, Math.min(100, p * 100));
    pageScrollbarThumb.style.height = `${fill}%`;
}

function setScrollbarScrollingState() {
    if (!pageScrollbar) return;

    if (isContactsPage) {
        pageScrollbar.classList.remove("is-scrolling");
        return;
    }

    pageScrollbar.classList.add("is-scrolling");

    clearTimeout(scrollbarTimer);

    scrollbarTimer = setTimeout(() => {
        pageScrollbar.classList.remove("is-scrolling");
    }, 350);
}

function initAboutTextScrollbar() {
    if (!aboutInfoText) return;

    const aboutInfo = aboutInfoText.closest(".about-info");
    if (!aboutInfo) return;

    aboutInfo.style.position = "relative";

    aboutTextScrollbar = document.createElement("div");
    aboutTextScrollbar.className = "about-text-scrollbar";

    aboutTextScrollbarFill = document.createElement("div");
    aboutTextScrollbarFill.className = "about-text-scrollbar__fill";

    const arrow = document.createElement("div");
    arrow.className = "about-text-scrollbar__arrow";

    aboutTextScrollbar.appendChild(aboutTextScrollbarFill);
    aboutTextScrollbar.appendChild(arrow);

    aboutInfo.appendChild(aboutTextScrollbar);

    positionAboutTextScrollbar();
    updateAboutTextScrollbar();

    aboutInfoText.addEventListener("scroll", updateAboutTextScrollbar);

    window.addEventListener("resize", () => {
        positionAboutTextScrollbar();
        updateAboutTextScrollbar();
    });
}

function positionAboutTextScrollbar() {
    if (!aboutInfoText || !aboutTextScrollbar) return;

    const aboutInfo = aboutInfoText.closest(".about-info");
    if (!aboutInfo) return;

    const textRect = aboutInfoText.getBoundingClientRect();
    const infoRect = aboutInfo.getBoundingClientRect();

    const scrollbarHeightRatio = 0.6;
    const scrollbarGap = 85;
    const scrollbarOffsetY = 0;

    const top =
        textRect.top -
        infoRect.top +
        textRect.height * ((1 - scrollbarHeightRatio) / 2) +
        scrollbarOffsetY;

    const left = textRect.right - infoRect.left + scrollbarGap;

    aboutTextScrollbar.style.top = `${top}px`;
    aboutTextScrollbar.style.left = `${left}px`;
    aboutTextScrollbar.style.height = `${textRect.height * scrollbarHeightRatio}px`;
}

function updateAboutTextScrollbar() {
    if (!aboutInfoText || !aboutTextScrollbarFill) return;

    const maxScroll = aboutInfoText.scrollHeight - aboutInfoText.clientHeight;

    if (maxScroll <= 0) {
        aboutTextScrollbarFill.style.height = "0%";
        return;
    }

    const textProgress = aboutInfoText.scrollTop / maxScroll;
    const fill = Math.max(0, Math.min(100, textProgress * 100));

    aboutTextScrollbarFill.style.height = `${fill}%`;
}

initAboutTextScrollbar();

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
}

function syncAboutImageAndTitle(progressValue) {
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

function setInitialImagePosition() {
    const { baseImg, title } = getSceneElements();

    if (baseImg) {
        baseImg.style.transformOrigin = "center center";
        baseImg.style.transform = "translateY(0px) scale(1)";
    }

    if (baseImg && title) {
        syncTitleBackgroundWithImage(baseImg, title);
    }

    updatePageScrollbar(progress);
    positionAboutTextScrollbar();
    updateAboutTextScrollbar();
}

setInitialImagePosition();

const aboutImage = document.querySelector(".about__img");

if (aboutImage) {
    if (aboutImage.complete) {
        setInitialImagePosition();
    } else {
        aboutImage.addEventListener("load", () => {
            setInitialImagePosition();
            updateScene(progress);
        });
    }
}

window.addEventListener("resize", () => {
    setInitialImagePosition();
    updateScene(progress);
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

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        currentLeftOffset = Math.max(0, currentLeftOffset - 10);
        setImageLeftOffset(currentLeftOffset);
        console.log(`Left offset: ${currentLeftOffset}px`);
    } else if (e.key === "ArrowRight") {
        currentLeftOffset = currentLeftOffset + 10;
        setImageLeftOffset(currentLeftOffset);
        console.log(`Left offset: ${currentLeftOffset}px`);
    } else if (e.key === "ArrowUp") {
        currentPosition = Math.max(0, currentPosition - 5);
        setImagePosition(currentPosition);
        console.log(`Position: ${currentPosition}%`);
    } else if (e.key === "ArrowDown") {
        currentPosition = Math.min(50, currentPosition + 5);
        setImagePosition(currentPosition);
        console.log(`Position: ${currentPosition}%`);
    } else if (e.key === "+") {
        currentSize = Math.min(500, currentSize + 25);
        setImageSize(currentSize);
        console.log(`Size: ${currentSize}%`);
    } else if (e.key === "-") {
        currentSize = Math.max(100, currentSize - 25);
        setImageSize(currentSize);
        console.log(`Size: ${currentSize}%`);
    }
});

function moveLogoToMenuTop() {
    if (isLogoInMenu || isLogoMovingToMenu) return;
    if (!main || !logo || !menuSection || !logoWrapper) return;

    isLogoMovingToMenu = true;

    const logoRect = logo.getBoundingClientRect();
    const menuRect = menuSection.getBoundingClientRect();

    const targetTop = menuRect.top + 20;
    const targetLeft = menuRect.left + menuRect.width / 2 - 20;

    const logoClone = logo.cloneNode(true);
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

    logo.style.opacity = "0";
    logo.style.visibility = "hidden";

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

        const oldMenuLogo = menuSection.querySelector(".menu__logo-cont");

        if (oldMenuLogo) {
            oldMenuLogo.remove();
        }

        isLogoMovingToMenu = false;
        isLogoInMenu = true;

        const newMenuLogo = createMenuLogo();

        if (newMenuLogo) {
            newMenuLogo.style.display = "block";
            newMenuLogo.style.opacity = "0.8";
            newMenuLogo.style.visibility = "visible";
            newMenuLogo.style.pointerEvents = "auto";
        }

        logo.style.display = "none";

        const logoText = document.querySelector(".logo-text");

        if (logoText) {
            logoText.style.transition = "opacity 0.5s ease";
            logoText.style.opacity = "0";
        }

        logoWrapper.style.pointerEvents = "none";

        if (main) {
            main.classList.add("menu-logo-ready");
        }

        initMenuLogoVisibility();

        console.log("Logo moved inside menu with glow animation");
    }, 800);
}

function resetLogoPosition() {
    if (!isLogoInMenu && !isLogoMovingToMenu) return;
    if (!logo || !logoWrapper) return;

    isLogoInMenu = false;
    isLogoMovingToMenu = false;

    const menuLogo = main && menuSection
        ? menuSection.querySelector(".menu__logo-cont")
        : null;

    if (menuLogo && menuLogo.remove) {
        menuLogo.remove();
    }

    if (main) {
        main.classList.remove("menu-logo-ready");
    }

    initMenuLogoVisibility();

    logo.style.display = "";
    logo.style.position = "";
    logo.style.top = "";
    logo.style.left = "";
    logo.style.width = "75px";
    logo.style.height = "75px";
    logo.style.borderWidth = "25px";
    logo.style.border = "25px solid rgb(255, 0, 0)";
    logo.style.transform = "";
    logo.style.opacity = "0.8";
    logo.style.visibility = "visible";
    logo.style.zIndex = "";
    logo.style.margin = "";

    logoWrapper.style.pointerEvents = "";

    const logoText = document.querySelector(".logo-text");

    if (logoText) {
        logoText.style.transition = "";
        logoText.style.opacity = "";
    }

    console.log("Logo reset from menu");
}

function showUI() {
    if (!main) return;

    if (!isUIVisible) {
        main.classList.remove("ui-hidden");
        main.classList.add("ui-visible");
        isUIVisible = true;
    }

    if (!isLogoMovingToMenu) {
        initMenuLogoVisibility();
    }
}

function resetScene() {
    if (!main || !logoWrapper) return;

    main.classList.remove("ui-visible");
    main.classList.add("ui-hidden");
    main.classList.remove("menu-logo-ready");

    logoWrapper.classList.remove("active");

    progress = 0;
    targetProgress = 0;
    isUIVisible = false;
    clickCount = 0;
    isLogoInMenu = false;
    isLogoMovingToMenu = false;

    resetLogoPosition();

    updateScene(0);
    initMenuLogoVisibility();
}

function updateScene(p) {
    const { paralaxText } = getSceneElements();

    syncAboutImageAndTitle(p);

    if (paralaxText) {
        const textMove = p * 120;
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
    }

    updatePageScrollbar(p);
    positionAboutTextScrollbar();
    updateAboutTextScrollbar();
}

function animate() {
    progress += (targetProgress - progress) * 0.08;
    updateScene(progress);
    requestAnimationFrame(animate);
}

animate();

function handleVirtualScroll(e) {
    if (isContactsPage) {
        e.preventDefault();
        updatePageScrollbar(0);
        return;
    }

    e.preventDefault();

    showUI();

    targetProgress += e.deltaY * 0.002;
    targetProgress = Math.max(0, Math.min(1, targetProgress));

    setScrollbarScrollingState();
}

if (aboutInfoText) {
    aboutInfoText.addEventListener(
        "wheel",
        (e) => {
            const delta = e.deltaY;

            const atTop = aboutInfoText.scrollTop <= 0;
            const atBottom =
                aboutInfoText.scrollTop + aboutInfoText.clientHeight >=
                aboutInfoText.scrollHeight - 1;

            const canScrollUp = delta < 0 && !atTop;
            const canScrollDown = delta > 0 && !atBottom;

            if (canScrollUp || canScrollDown) {
                e.stopPropagation();
                e.preventDefault();

                aboutInfoText.scrollTop += delta;

                requestAnimationFrame(() => {
                    positionAboutTextScrollbar();
                    updateAboutTextScrollbar();
                });
            }
        },
        { passive: false }
    );
}

if (contentPage) {
    contentPage.addEventListener("wheel", handleVirtualScroll, {
        passive: false
    });
} else {
    window.addEventListener("wheel", handleVirtualScroll, {
        passive: false
    });
}

if (logo && logoWrapper) {
    logo.addEventListener("click", (e) => {
        e.stopPropagation();

        playSound();
        clickCount++;

        if (clickCount === 2 && !isLogoInMenu && !isLogoMovingToMenu) {
            moveLogoToMenuTop();
            showUI();
            targetProgress = 0.3;
            return;
        }

        if (isUIVisible && !isLogoMovingToMenu) {
            resetScene();
            return;
        }

        if (!logoWrapper.classList.contains("active")) {
            logoWrapper.classList.add("active");
            return;
        }

        showUI();
        targetProgress += 0.05;
    });
}

function initContentLinksImages() {
    const links = document.querySelectorAll(".content__links__item");

    links.forEach((link) => {
        const baseClass = "content__links__item";

        const imageClass = Array.from(link.classList).find(
            (className) => className !== baseClass
        );

        if (!imageClass) return;

        const imageUrl = new URL(
            `./assets/${imageClass}.png`,
            window.location.href
        ).href;

        link.dataset.text = link.textContent.trim();
        link.style.setProperty("--hover-bg", `url("${imageUrl}")`);
    });
}

initContentLinksImages();

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

initPageTransitions();

function initMenuReturnToIndex() {
    document.addEventListener(
        "click",
        (e) => {
            const indexLink = e.target.closest(
                'a[href="index.html"], a[href="./index.html"]'
            );

            const menuBlock = e.target.closest(".menu-block");

            if (indexLink || (!hasContentLinks && menuBlock)) {
                sessionStorage.setItem("recStudioSkipIntro", "true");
            }
        },
        true
    );
}

initMenuReturnToIndex();