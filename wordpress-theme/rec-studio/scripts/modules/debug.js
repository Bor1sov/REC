import { state } from "./state.js";
import { getSceneElements } from "./dom.js";

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

export function initDebugControls() {
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