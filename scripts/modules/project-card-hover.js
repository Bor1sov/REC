function getEpisodesText(duration) {
    if (!duration) return "";

    const match = duration.match(/(\d+\s*сер(?:ия|ии|ий))/i);

    if (match) {
        return match[1];
    }

    return duration;
}

export function initProjectCardHover() {
    const cards = document.querySelectorAll(".project-card");

    cards.forEach((card) => {
        if (card.querySelector(".project-card__hover")) return;

        const title = card.dataset.projectTitle || "";
        const genre = card.dataset.projectGenre || "";
        const age = card.dataset.projectAge || "";
        const duration = card.dataset.projectDuration || "";

        const episodes = getEpisodesText(duration);

        const hover = document.createElement("div");
        hover.className = "project-card__hover";

        hover.innerHTML = `
            <div class="project-card__hover-top">
                <span>${episodes}</span>
                <span>${age}</span>
            </div>

            <div class="project-card__hover-bottom">
                <h3 class="project-card__hover-title">${title}</h3>
                <p class="project-card__hover-genre">${genre}</p>
            </div>

            <div class="project-card__hover-line"></div>
        `;

        card.appendChild(hover);
    });
}