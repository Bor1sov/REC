const main = document.querySelector(".main-container");
const logoWrapper = document.querySelector(".logo-wrapper");
const logo = document.querySelector(".main__container__logo");
const menuSection = document.querySelector(".menu");

const clickSound = new Audio('./assets/звук кнопки.mp3');
clickSound.volume = 0.5;
clickSound.preload = 'auto';

let isSoundEnabled = true;

function playSound() {
    if (!isSoundEnabled) return;
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log('Sound error:', e));
}

const volumeBtn = document.querySelector('.settings__valume-btn');
const volumeIcon = document.querySelector('.settings__valume-btn__img');

function updateVolumeIcon() {
    if (!volumeIcon) return;
    
    if (isSoundEnabled) {
        volumeIcon.src = './assets/ЗВУК.png';
        volumeIcon.style.opacity = '0.7';
        volumeIcon.style.filter = 'brightness(0) invert(1)';
    } else {
        volumeIcon.src = './assets/ЗВУКOFF.png';
        volumeIcon.style.opacity = '0.7';
        volumeIcon.style.filter = 'brightness(0) invert(1)';
    }
}

if (volumeBtn) {
    volumeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isSoundEnabled = !isSoundEnabled;
        updateVolumeIcon();
    });
}

updateVolumeIcon();

main.classList.add("show");
main.classList.add("ui-hidden");
main.classList.remove("hidden");

let progress = 0;
let targetProgress = 0;
let isUIVisible = false;
let clickCount = 0;
let isLogoInMenu = false;

function syncImagesPosition(move) {
    const aboutImg = document.querySelector('.about__img');
    const aboutTitle = document.querySelector('.about__title');
    
    if (aboutImg) {
        const scale = 1 + move * 0.2;
        aboutImg.style.transform = `translateY(${move}px) scale(${scale})`;
    }
    
    if (aboutTitle) {
        const viewportHeight = window.innerHeight;
        const baseOffset = viewportHeight * 0.35;
        const scrollOffset = move * 80;
        aboutTitle.style.backgroundPosition = `calc(50% - 15px) -${baseOffset + scrollOffset}px`;
        aboutTitle.style.backgroundSize = '120% auto';
    }
}

function setInitialImagePosition() {
    const aboutTitle = document.querySelector('.about__title');
    if (aboutTitle) {
        const viewportHeight = window.innerHeight;
        const baseOffset = viewportHeight * 0.10;
        aboutTitle.style.backgroundPosition = `calc(50% - 15px) -${baseOffset}px`;
        aboutTitle.style.backgroundSize = '122% auto';
    }
}

setInitialImagePosition();

window.addEventListener('resize', () => {
    setInitialImagePosition();
    syncImagesPosition(progress);
});

function setImageSize(percent) {
    const aboutTitle = document.querySelector('.about__title');
    if (aboutTitle) {
        aboutTitle.style.backgroundSize = `${percent}% auto`;
    }
}

function setImagePosition(percentFromTop) {
    const aboutTitle = document.querySelector('.about__title');
    if (aboutTitle) {
        const viewportHeight = window.innerHeight;
        const offset = viewportHeight * (percentFromTop / 100);
        aboutTitle.style.backgroundPosition = `calc(50%) -${offset}px`;
        return offset;
    }
    return null;
}

function setImageLeftOffset(pixels) {
    const aboutTitle = document.querySelector('.about__title');
    if (aboutTitle) {
        const currentPos = aboutTitle.style.backgroundPosition;
        const match = currentPos.match(/-?\d+px/);
        const yValue = match ? match[0] : '-0px';
        aboutTitle.style.backgroundPosition = `calc(50% - ${pixels}px) ${yValue}`;
    }
}

setImageLeftOffset(50);

let currentSize = 200;
let currentPosition = 5;

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        currentLeftOffset = Math.max(0, currentLeftOffset - 10);
        setImageLeftOffset(currentLeftOffset);
        console.log(`Left offset: ${currentLeftOffset}px`);
    } else if (e.key === 'ArrowRight') {
        currentLeftOffset = currentLeftOffset + 10;
        setImageLeftOffset(currentLeftOffset);
        console.log(`Left offset: ${currentLeftOffset}px`);
    } else if (e.key === 'ArrowUp') {
        currentPosition = Math.max(0, currentPosition - 5);
        setImagePosition(currentPosition);
        console.log(`Position: ${currentPosition}%`);
    } else if (e.key === 'ArrowDown') {
        currentPosition = Math.min(50, currentPosition + 5);
        setImagePosition(currentPosition);
        console.log(`Position: ${currentPosition}%`);
    } else if (e.key === '+') {
        currentSize = Math.min(500, currentSize + 25);
        setImageSize(currentSize);
        console.log(`Size: ${currentSize}%`);
    } else if (e.key === '-') {
        currentSize = Math.max(100, currentSize - 25);
        setImageSize(currentSize);
        console.log(`Size: ${currentSize}%`);
    }
});

let currentLeftOffset = 50;

function addGlowAnimation(element) {
    if (!element) return;
    
    element.classList.add('menu__logo-cont');
    
    const style = document.createElement('style');
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

function moveLogoToMenuTop() {
    if (isLogoInMenu) return;
    
    isLogoInMenu = true;
    
    const logoRect = logo.getBoundingClientRect();
    const menuRect = menuSection.getBoundingClientRect();
    
    const targetTop = menuRect.top + 20;
    const targetLeft = menuRect.left + (menuRect.width / 2) - 20;
    
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
        
        const oldMenuLogo = document.querySelector('.menu__logo-cont');
        if (oldMenuLogo) oldMenuLogo.remove();
        
        const newMenuLogo = document.createElement('div');
        newMenuLogo.className = 'menu__logo-cont red-glow';
        newMenuLogo.style.width = "40px";
        newMenuLogo.style.height = "40px";
        newMenuLogo.style.border = "12px solid rgb(255, 0, 0)";
        newMenuLogo.style.borderRadius = "50%";
        newMenuLogo.style.margin = "20px auto 10px auto";
        newMenuLogo.style.opacity = "0.8";
        newMenuLogo.style.cursor = "pointer";
        newMenuLogo.style.display = "block";
        newMenuLogo.style.position = "relative";
        newMenuLogo.style.flexShrink = "0";
        
        addGlowAnimation(newMenuLogo);
        
        newMenuLogo.addEventListener("click", (e) => {
            e.stopPropagation();
            playSound();
            
            if (newMenuLogo.style.border === "12px solid rgb(255, 0, 0)") {
                newMenuLogo.style.border = "12px solid rgb(255, 255, 255)";
                newMenuLogo.classList.remove('red-glow');
                newMenuLogo.classList.add('white-glow');
            } else {
                newMenuLogo.style.border = "12px solid rgb(255, 0, 0)";
                newMenuLogo.classList.remove('white-glow');
                newMenuLogo.classList.add('red-glow');
            }
            
            newMenuLogo.style.transform = 'scale(0.9)';
            setTimeout(() => {
                newMenuLogo.style.transform = 'scale(1)';
            }, 150);
        });
        
        newMenuLogo.addEventListener("mouseenter", () => {
            if (newMenuLogo.style.border === "12px solid rgb(255, 0, 0)") {
                newMenuLogo.style.boxShadow = '0 0 25px rgba(255, 0, 0, 1)';
            } else {
                newMenuLogo.style.boxShadow = '0 0 25px rgba(255, 255, 255, 1)';
            }
        });
        
        newMenuLogo.addEventListener("mouseleave", () => {
            newMenuLogo.style.boxShadow = '';
        });
        
        const menuBlock = menuSection.querySelector('.menu-block');
        if (menuBlock) {
            menuSection.insertBefore(newMenuLogo, menuBlock);
        } else {
            menuSection.insertBefore(newMenuLogo, menuSection.firstChild);
        }
        
        if (logo) {
            logo.style.display = "none";
        }
        
        const logoText = document.querySelector(".logo-text");
        if (logoText) {
            logoText.style.transition = "opacity 0.5s ease";
            logoText.style.opacity = "0";
        }
        
        logoWrapper.style.pointerEvents = "none";
        
        console.log("Logo moved inside menu with glow animation");
    }, 800);
}

function resetLogoPosition() {
    if (!isLogoInMenu) return;
    
    isLogoInMenu = false;
    
    const menuLogo = document.querySelector('.menu__logo-cont');
    if (menuLogo && menuLogo.remove) {
        menuLogo.remove();
    }
    
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
    if (!isUIVisible) {
        main.classList.remove("ui-hidden");
        main.classList.add("ui-visible");
        isUIVisible = true;
    }
}

function resetScene() {
    main.classList.remove("ui-visible");
    main.classList.add("ui-hidden");

    logoWrapper.classList.remove("active");

    progress = 0;
    targetProgress = 0;
    isUIVisible = false;
    clickCount = 0;
    
    resetLogoPosition();

    updateScene(0);
}

function getSceneElements() {
    return {
        baseImg: document.querySelector(".about__img"),
        paralaxText: document.querySelector(".paralax-text"),
        infoBlock: document.querySelector(".about-info"),
        title: document.querySelector(".about__title")
    };
}

function updateScene(p) {
    const { baseImg, paralaxText, infoBlock, title } = getSceneElements();

    if (baseImg) {
        const move = p * 80;
        const scale = 1 + p * 0.2;
        baseImg.style.transform = `translateY(${move}px) scale(${scale})`;
        
        if (title) {
            const viewportHeight = window.innerHeight;
            const baseOffset = viewportHeight * 0.35;
            const scrollOffset = move;
            title.style.backgroundPosition = `calc(50% - 15px) -${baseOffset + scrollOffset}px`;
        }
    }

    if (paralaxText) {
        const textMove = p * 100;
        paralaxText.style.transform = `translateY(${100 - textMove}%)`;
    }

    if (infoBlock) {
        if (p > 0.5) {
            infoBlock.style.opacity = (p - 0.5) * 2;
        } else {
            infoBlock.style.opacity = 0;
        }
    }
}

function animate() {
    progress += (targetProgress - progress) * 0.08;
    updateScene(progress);
    requestAnimationFrame(animate);
}
animate();

window.addEventListener("wheel", (e) => {
    showUI();
    targetProgress += e.deltaY * 0.002;
    targetProgress = Math.max(0, Math.min(1, targetProgress));
});

logo.addEventListener("click", (e) => {
    e.stopPropagation();
    
    playSound();
    clickCount++;
    
    if (clickCount === 2 && !isLogoInMenu) {
        moveLogoToMenuTop();
        showUI();
        targetProgress = 0.3;
        return;
    }
    
    if (isUIVisible) {
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