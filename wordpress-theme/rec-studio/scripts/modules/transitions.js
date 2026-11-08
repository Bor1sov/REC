import { dom } from "./dom.js";
import { getPageUrl } from "./runtime.js";
function normalizeUrl(url) {
    const parsed = new URL(url, window.location.href);

    parsed.hash = "";
    parsed.search = "";

    return parsed.href.replace(/\/+$/, "");
}

function isHomeHref(href) {
    return normalizeUrl(href) === normalizeUrl(getPageUrl("home"));
}

function prepareHomeReturn(href) {
    if (!isHomeHref(href)) return;

    sessionStorage.setItem("recStudioSkipIntro", "true");
    sessionStorage.setItem("recStudioStartAboutDescription", "true");
}

export function initPageTransitions() {
    const links = document.querySelectorAll(".content__links__item");

    links.forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            e.preventDefault();
            prepareHomeReturn(href);

            document.body.classList.add("page-leaving");

            setTimeout(() => {
                window.location.href = href;
            }, 500);
        });
    });
}

export function initMenuReturnToIndex() {
    document.addEventListener(
        "click",
        (e) => {
            const link = e.target.closest("a[href]");
            const menuLink = link && link.href === getPageUrl("menu");

            const menuBlock = e.target.closest(".menu-block");

            if (menuLink || (!dom.hasContentLinks && menuBlock)) {
                sessionStorage.setItem("recStudioSkipIntro", "true");
            }
        },
        true
    );
}
