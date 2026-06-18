import { updatePageScrollbar } from "./page-scrollbar.js";
import { getPageUrl } from "./runtime.js";
import {
    ABOUT_CONTACTS_REVEAL_START,
    ABOUT_CONTACTS_START
} from "./about-timeline.js";

let isReady = false;
let isLoading = false;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    const progress = clamp((value - inMin) / (inMax - inMin), 0, 1);
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

export function initAboutContactsSection() {
    if (!document.body.classList.contains("about-page")) return;

    loadContactsContent();
}

export function updateAboutContactsSection(globalProgress) {
    if (!document.body.classList.contains("about-page")) return;

    const { section } = getElements();

    if (!section) return;

    const revealY = mapRange(
        globalProgress,
        ABOUT_CONTACTS_REVEAL_START,
        ABOUT_CONTACTS_START,
        100,
        0
    );

    section.style.transform = `translateY(${revealY}vh)`;

    updatePageScrollbar(globalProgress);
}
