export function initContentLinksImages() {
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