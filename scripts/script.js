const main = document.querySelector(".main-container");
const logoWrapper = document.querySelector(".logo-wrapper");
const logo = document.querySelector(".main__container__logo");
const menuLogo = document.querySelector(".menu__logo");

// ---------- ЗВУК ----------
const clickSound = new Audio('./assets/звук кнопки.mp3');
clickSound.volume = 0.5;
clickSound.preload = 'auto';

let isSoundEnabled = true; // Флаг включен ли звук

function playSound() {
    if (!isSoundEnabled) return; // Если звук выключен - не играем
    
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log('Sound error:', e));
}

// ---------- УПРАВЛЕНИЕ ЗВУКОМ ЧЕРЕЗ КНОПКУ ГРОМКОСТИ ----------
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
        console.log(isSoundEnabled ? 'Sound ON' : 'Sound OFF');
    });
}

updateVolumeIcon();

main.classList.add("show");
main.classList.add("ui-hidden");
main.classList.remove("hidden");

let progress = 0;
let targetProgress = 0;
let isUIVisible = false;
let clickCount = 0; // Счетчик кликов для анимации перемещения

// ---------- ФУНКЦИЯ ДЛЯ ПЕРЕМЕЩЕНИЯ ЛОГОТИПА В ЛЕВЫЙ ВЕРХНИЙ УГОЛ ----------
function moveLogoToCorner() {
    // Добавляем стили для перемещения
    logoWrapper.style.transition = "all 0.8s cubic-bezier(0.7, 0, 0.2, 1)";
    logoWrapper.style.position = "fixed";
    logoWrapper.style.top = "20px";
    logoWrapper.style.left = "20px";
    logoWrapper.style.transform = "translate(0, 0) scale(0.5)";
    logoWrapper.style.zIndex = "10000";
    
    // Также анимируем сам логотип
    logo.style.transition = "all 0.8s cubic-bezier(0.7, 0, 0.2, 1)";
    logo.style.width = "50px";
    logo.style.height = "50px";
    logo.style.borderWidth = "15px";
    
    // Скрываем текст логотипа при перемещении
    const logoText = document.querySelector(".logo-text");
    if (logoText) {
        logoText.style.opacity = "0";
        logoText.style.maxWidth = "0";
    }
    
    console.log("Logo moved to corner");
}

// ---------- ФУНКЦИЯ ДЛЯ ВОЗВРАЩЕНИЯ ЛОГОТИПА В ЦЕНТР ----------
function resetLogoPosition() {
    logoWrapper.style.transition = "all 0.8s cubic-bezier(0.7, 0, 0.2, 1)";
    logoWrapper.style.position = "absolute";
    logoWrapper.style.top = "50%";
    logoWrapper.style.left = "50%";
    logoWrapper.style.transform = "translate(-50%, -50%) scale(1)";
    
    logo.style.transition = "all 0.8s cubic-bezier(0.7, 0, 0.2, 1)";
    logo.style.width = "75px";
    logo.style.height = "75px";
    logo.style.borderWidth = "25px";
    
    console.log("Logo reset to center");
}

/* ---------- UI ---------- */
function showUI() {
    if (!isUIVisible) {
        main.classList.remove("ui-hidden");
        main.classList.add("ui-visible");
        isUIVisible = true;
    }
}

/* ---------- RESET ---------- */
function resetScene() {
    main.classList.remove("ui-visible");
    main.classList.add("ui-hidden");

    logoWrapper.classList.remove("active");

    progress = 0;
    targetProgress = 0;
    isUIVisible = false;
    clickCount = 0; // Сбрасываем счетчик кликов
    
    // Возвращаем логотип в центр при сбросе
    resetLogoPosition();

    updateScene(0);
}

/* ---------- ЭЛЕМЕНТЫ ---------- */
function getSceneElements() {
    return {
        baseImg: document.querySelector(".about__img"),
        paralaxText: document.querySelector(".paralax-text"),
        infoBlock: document.querySelector(".about-info"),
        title: document.querySelector(".about__title")
    };
}

/* ---------- СЦЕНА ---------- */
function updateScene(p) {
    const { baseImg, paralaxText, infoBlock, title } = getSceneElements();

    if (baseImg) {
        const move = p * 80;
        const scale = 1 + p * 0.2;

        baseImg.style.transform = `translateY(${move}px) scale(${scale})`;

        if (title) {
            title.style.backgroundPositionY = `${-move}px`;
        }
    }

    if (paralaxText) {
        paralaxText.style.transform = `translateY(${100 - p * 100}%)`;
    }

    if (infoBlock) {
        if (p > 0.5) {
            infoBlock.style.opacity = (p - 0.5) * 2;
        } else {
            infoBlock.style.opacity = 0;
        }
    }
}

/* ---------- АНИМАЦИЯ ---------- */
function animate() {
    progress += (targetProgress - progress) * 0.08;
    updateScene(progress);
    requestAnimationFrame(animate);
}
animate();

/* ---------- СКРОЛЛ ---------- */
window.addEventListener("wheel", (e) => {
    showUI();
    targetProgress += e.deltaY * 0.002;
    targetProgress = Math.max(0, Math.min(1, targetProgress));
});

/* ---------- КЛИК ПО ЛОГОТИПУ С АНИМАЦИЕЙ ПЕРЕМЕЩЕНИЯ ---------- */
logo.addEventListener("click", (e) => {
    e.stopPropagation();
    
    // Воспроизводим звук
    playSound();
    
    // Увеличиваем счетчик кликов
    clickCount++;
    console.log("Click count:", clickCount);
    
    // При третьем клике - перемещаем логотип в угол
    if (clickCount === 3) {
        moveLogoToCorner();
        return;
    }
    
    // если UI открыт → reset
    if (isUIVisible) {
        resetScene();
        return;
    }

    // показать текст
    if (!logoWrapper.classList.contains("active")) {
        logoWrapper.classList.add("active");
        return;
    }

    // Показываем UI
    showUI();
    targetProgress += 0.05;
});

/* ---------- КЛИК ПО MENU LOGO ---------- */
if (menuLogo) {
    menuLogo.addEventListener("click", (e) => {
        e.stopPropagation();
        playSound();
        menuLogo.classList.toggle("red-logo");
        
        menuLogo.style.transform = 'scale(0.9)';
        setTimeout(() => {
            menuLogo.style.transform = 'scale(1)';
        }, 150);
    });
}

// ---------- ДОПОЛНИТЕЛЬНО: ВОЗВРАТ ЛОГОТИПА ПРИ КЛИКЕ НА НЕГО В УГЛУ ----------
logo.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    // При двойном клике возвращаем логотип в центр
    resetLogoPosition();
    clickCount = 0;
    console.log("Logo position reset by double click");
});