function getEpisodesText(duration) {
    if (!duration) return "";

    const match = duration.match(/(\d+\s*сер(?:ия|ии|ий))/i);

    if (match) {
        return match[1];
    }

    return duration;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getTitleSizeClass(title) {
    const cleanTitle = title.trim();
    const titleLength = cleanTitle.length;
    const wordsCount = cleanTitle.split(/\s+/).filter(Boolean).length;

    if (titleLength > 42 || wordsCount >= 5) {
        return " is-ultra-long";
    }

    if (titleLength > 30 || wordsCount >= 4) {
        return " is-extra-long";
    }

    if (titleLength > 18 || wordsCount >= 3) {
        return " is-long";
    }

    return "";
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
        const titleSizeClass = getTitleSizeClass(title);

        const hover = document.createElement("div");
        hover.className = "project-card__hover";

        hover.innerHTML = `
            <div class="project-card__hover-top">
                <span>${escapeHtml(episodes)}</span>
                <span>${escapeHtml(age)}</span>
            </div>

            <div class="project-card__hover-bottom">
                <h3 class="project-card__hover-title${titleSizeClass}">
                    ${escapeHtml(title)}
                </h3>

                <p class="project-card__hover-genre">${escapeHtml(genre)}</p>
            </div>

        `;

        card.appendChild(hover);
    });
}