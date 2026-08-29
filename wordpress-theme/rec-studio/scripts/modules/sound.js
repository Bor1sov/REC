import { state } from "./state.js";
import { dom } from "./dom.js";
import { getAssetUrl } from "./runtime.js";

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

export function playSound({ force = false } = {}) {
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

export function initSound() {
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
