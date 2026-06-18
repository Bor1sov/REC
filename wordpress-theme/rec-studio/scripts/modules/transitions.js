import { dom } from "./dom.js";
import { getPageUrl } from "./runtime.js";

export function initPageTransitions() {
    const links = document.querySelectorAll(".content__links__item");

    links.forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            e.preventDefault();

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
            const indexLink = link && link.href === getPageUrl("home");

            const menuBlock = e.target.closest(".menu-block");

            if (indexLink || (!dom.hasContentLinks && menuBlock)) {
                sessionStorage.setItem("recStudioSkipIntro", "true");
            }
        },
        true
    );
}
