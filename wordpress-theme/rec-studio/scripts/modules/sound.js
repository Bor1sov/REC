import { state } from "./state.js";
import { dom } from "./dom.js";
import { getAssetUrl } from "./runtime.js";

let clickSound = null;

function getClickSound() {
    if (!clickSound) {
        clickSound = new Audio(getAssetUrl("assets/click-sound.mp3"));
        clickSound.volume = 0.5;
        clickSound.preload = "none";
    }

    return clickSound;
}

export function playSound() {
    if (!state.isSoundEnabled) return;

    const sound = getClickSound();

    sound.currentTime = 0;
    sound.play().catch((e) => console.log("Sound error:", e));
}

function updateVolumeIcon() {
    if (!dom.volumeIcon) return;

    if (state.isSoundEnabled) {
        dom.volumeIcon.src = getAssetUrl("assets/sound-on.png");
        dom.volumeIcon.style.opacity = "0.7";
        dom.volumeIcon.style.filter = "brightness(0) invert(1)";
    } else {
        dom.volumeIcon.src = getAssetUrl("assets/sound-off.png");
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
