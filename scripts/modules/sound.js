import { state } from "./state.js";
import { dom } from "./dom.js";

const clickSound = new Audio("./assets/звук кнопки.mp3");
clickSound.volume = 0.5;
clickSound.preload = "auto";

export function playSound() {
    if (!state.isSoundEnabled) return;

    clickSound.currentTime = 0;
    clickSound.play().catch((e) => console.log("Sound error:", e));
}

function updateVolumeIcon() {
    if (!dom.volumeIcon) return;

    if (state.isSoundEnabled) {
        dom.volumeIcon.src = "./assets/ЗВУК.png";
        dom.volumeIcon.style.opacity = "0.7";
        dom.volumeIcon.style.filter = "brightness(0) invert(1)";
    } else {
        dom.volumeIcon.src = "./assets/ЗВУКOFF.png";
        dom.volumeIcon.style.opacity = "0.7";
        dom.volumeIcon.style.filter = "brightness(0) invert(1)";
    }
}

export function initSound() {
    if (dom.volumeBtn) {
        dom.volumeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            state.isSoundEnabled = !state.isSoundEnabled;
            updateVolumeIcon();
        });
    }

    updateVolumeIcon();
}