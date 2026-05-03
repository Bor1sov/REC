import { dom } from "./dom.js";

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
            const indexLink = e.target.closest(
                'a[href="index.html"], a[href="./index.html"]'
            );

            const menuBlock = e.target.closest(".menu-block");

            if (indexLink || (!dom.hasContentLinks && menuBlock)) {
                sessionStorage.setItem("recStudioSkipIntro", "true");
            }
        },
        true
    );
}