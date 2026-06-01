const MENU_ITEMS = [
    { title: "О НАС", href: "about.html" },
    { title: "НАШИ ПРОЕКТЫ", href: "projects.html" },
    { title: "УСЛУГИ", href: "index.html#services" },
    { title: "НОВОСТИ", href: "news.html" },
    { title: "КОНТАКТЫ", href: "contacts.html" }
];

function createOverlay() {
    let overlay = document.querySelector(".site-menu-overlay");

    if (overlay) return overlay;

    overlay = document.createElement("nav");
    overlay.className = "site-menu-overlay";
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML = `
        <div class="site-menu-overlay__inner">
            <button class="site-menu-overlay__close" type="button" aria-label="Закрыть меню">×</button>

            <div class="site-menu-overlay__links">
                ${MENU_ITEMS.map((item) => `
                    <a class="site-menu-overlay__link" href="${item.href}">
                        ${item.title}
                    </a>
                `).join("")}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    return overlay;
}

function openOverlay(overlay) {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("site-menu-is-open");
}

function closeOverlay(overlay) {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("site-menu-is-open");
}

export function initMenuOverlay() {
    const overlay = createOverlay();
    const menuBlocks = document.querySelectorAll(".menu-block");
    const closeButton = overlay.querySelector(".site-menu-overlay__close");

    menuBlocks.forEach((menuBlock) => {
        if (menuBlock.dataset.overlayReady === "true") return;

        menuBlock.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (overlay.classList.contains("is-open")) {
                closeOverlay(overlay);
            } else {
                openOverlay(overlay);
            }
        });

        menuBlock.dataset.overlayReady = "true";
    });

    if (closeButton && closeButton.dataset.closeReady !== "true") {
        closeButton.addEventListener("click", () => {
            closeOverlay(overlay);
        });

        closeButton.dataset.closeReady = "true";
    }

    overlay.querySelectorAll(".site-menu-overlay__link").forEach((link) => {
        if (link.dataset.linkReady === "true") return;

        link.addEventListener("click", () => {
            closeOverlay(overlay);
        });

        link.dataset.linkReady = "true";
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("is-open")) {
            closeOverlay(overlay);
        }
    });
}