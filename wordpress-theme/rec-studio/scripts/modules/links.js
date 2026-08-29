import { getAssetUrl } from "./runtime.js";
import { decodeMojibake } from "./text-normalize.js";

const LINK_IMAGES = {
    faq: "faq.jpg",
    projects: "b.jpg",
    help: "a.jpg",
    news: "news.jpg",
    contact: "contact.png"
};

export function initContentLinksImages() {
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
