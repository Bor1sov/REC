import { updatePageScrollbar } from "./page-scrollbar.js";

const ABOUT_NEWS_REVEAL_START = 6.62;
const ABOUT_NEWS_START = 6.85;
const ABOUT_NEWS_MAX = 3.4;

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
        section: document.querySelector(".about-news-section"),
        stage: document.querySelector(".about-news-section .news-stage"),
        arrow: document.querySelector(".about-news-section .news-arrow"),

        listSection: document.querySelector(".about-news-section .news-list-section"),
        listContent: document.querySelector(".about-news-section .news-list-section__content"),
        newsList: document.querySelector(".about-news-section .news-list"),
        listItems: document.querySelectorAll(".about-news-section .news-list__item"),
        listScrollbar: document.querySelector(".about-news-section .news-list-scrollbar"),
        listScrollbarFill: document.querySelector(".about-news-section .news-list-scrollbar__fill"),

        articles: document.querySelectorAll(".about-news-section .news-article"),
        relatedItems: document.querySelectorAll(".about-news-section .news-related__item"),
        scrollToTopButtons: document.querySelectorAll(".about-news-section .news-scroll-to-top")
    };
}

function getOffsetTopInside(parent, child) {
    let offset = 0;
    let element = child;

    while (element && element !== parent) {
        offset += element.offsetTop;
        element = element.offsetParent;
    }

    return offset;
}

function getStageBottomShift(stage) {
    if (!stage) return 0;

    const listSection = document.querySelector(".about-news-section .news-list-section");

    if (!listSection) return 0;

    const bottomInsideStage =
        getOffsetTopInside(stage, listSection) + listSection.offsetHeight;

    return Math.max(0, bottomInsideStage - window.innerHeight - 10);
}

function normalizeNewsContent(root) {
    if (!root) return;

    root.querySelectorAll(
        ".menu, .settings, script, link, style"
    ).forEach((node) => {
        node.remove();
    });

    root.querySelectorAll(
        ".news-tabs, .news-tabs__list, .news-tabs__item, .news-tab, .news-filter, .news-filters"
    ).forEach((node) => {
        node.remove();
    });

    root.querySelectorAll(".news-article").forEach((article) => {
        article.classList.remove("is-active");
        article.style.display = "";
    });

    root.querySelectorAll(".news-list-section").forEach((section) => {
        section.classList.remove(
            "is-hidden",
            "is-disabled",
            "is-inactive",
            "hidden"
        );

        section.removeAttribute("hidden");
        section.removeAttribute("aria-hidden");

        section.style.display = "";
        section.style.visibility = "";
        section.style.opacity = "";
    });

    root.querySelectorAll(".news-list").forEach((list) => {
        list.classList.remove(
            "is-hidden",
            "is-disabled",
            "is-inactive",
            "hidden"
        );

        list.removeAttribute("hidden");
        list.removeAttribute("aria-hidden");

        list.style.display = "";
        list.style.visibility = "";
        list.style.opacity = "";
    });

    root.querySelectorAll(".news-list__item").forEach((item) => {
        item.classList.remove(
            "is-hidden",
            "is-disabled",
            "is-inactive",
            "hidden"
        );

        item.removeAttribute("hidden");
        item.removeAttribute("aria-hidden");

        item.style.display = "";
        item.style.visibility = "";
        item.style.opacity = "";
        item.style.pointerEvents = "";
    });

    root.querySelectorAll(".news-list-scrollbar").forEach((scrollbar) => {
        scrollbar.remove();
    });
}

function ensureNewsListScrollbar() {
    const {
        listContent,
        newsList
    } = getElements();

    if (!listContent || !newsList) return;

    if (listContent.querySelector(".news-list-scrollbar")) return;

    const scrollbar = document.createElement("div");
    scrollbar.className = "news-list-scrollbar";

    const scrollbarFill = document.createElement("div");
    scrollbarFill.className = "news-list-scrollbar__fill";

    const scrollbarArrow = document.createElement("div");
    scrollbarArrow.className = "news-list-scrollbar__arrow";

    scrollbar.appendChild(scrollbarFill);
    scrollbar.appendChild(scrollbarArrow);

    listContent.appendChild(scrollbar);
}

function ensureAllNewsButton() {
    const bottom = document.querySelector(
        ".about-news-section .news-list-section__bottom"
    );

    if (!bottom) return;
    if (bottom.querySelector(".about-news-all-link")) return;

    const link = document.createElement("a");
    link.className = "about-news-all-link";
    link.href = "./news.html";
    link.textContent = "Все новости";

    bottom.prepend(link);
}

function updateNewsListScrollbar() {
    const {
        newsList,
        listScrollbar,
        listScrollbarFill
    } = getElements();

    if (!newsList || !listScrollbar || !listScrollbarFill) return;

    const maxScroll = newsList.scrollHeight - newsList.clientHeight;

    if (maxScroll <= 0) {
        listScrollbar.style.opacity = "0";
        listScrollbarFill.style.height = "0%";
        return;
    }

    listScrollbar.style.opacity = "1";

    const progress = newsList.scrollTop / maxScroll;
    const fill = Math.max(0, Math.min(100, progress * 100));

    listScrollbarFill.style.height = `${fill}%`;
}

function initCustomNewsScroll() {
    const {
        listSection,
        newsList
    } = getElements();

    if (!listSection || !newsList) return;
    if (newsList.dataset.aboutNewsScrollbarReady === "true") return;

    ensureNewsListScrollbar();

    newsList.addEventListener("scroll", updateNewsListScrollbar);

    listSection.addEventListener(
        "wheel",
        (event) => {
            const maxScroll = newsList.scrollHeight - newsList.clientHeight;

            if (maxScroll <= 0) return;

            const delta = event.deltaY;

            const atTop = newsList.scrollTop <= 0;
            const atBottom = newsList.scrollTop >= maxScroll - 1;

            const canScrollInside =
                (delta < 0 && !atTop) ||
                (delta > 0 && !atBottom);

            if (canScrollInside) {
                event.preventDefault();
                event.stopPropagation();

                newsList.scrollTop += delta;
                updateNewsListScrollbar();
            }
        },
        { passive: false }
    );

    window.addEventListener("resize", updateNewsListScrollbar);

    newsList.dataset.aboutNewsScrollbarReady = "true";

    requestAnimationFrame(updateNewsListScrollbar);
    setTimeout(updateNewsListScrollbar, 150);
    setTimeout(updateNewsListScrollbar, 600);
}

function setActiveArticle(articleKey) {
    const {
        articles,
        listItems,
        stage
    } = getElements();

    let hasTargetArticle = false;

    articles.forEach((article) => {
        const isActive = article.dataset.newsArticle === articleKey;

        if (isActive) {
            hasTargetArticle = true;
        }

        article.classList.toggle("is-active", isActive);
    });

    if (!hasTargetArticle) return;

    listItems.forEach((item) => {
        item.classList.toggle(
            "is-active",
            item.dataset.newsTarget === articleKey
        );
    });

    if (stage) {
        stage.style.transform = "translateY(0)";
    }

    document.body.classList.add("about-news-article-open");
}

function showNewsListOnly() {
    const {
        articles,
        listItems,
        newsList,
        stage
    } = getElements();

    document.body.classList.remove("about-news-article-open");

    articles.forEach((article) => {
        article.classList.remove("is-active");
    });

    listItems.forEach((item) => {
        item.classList.remove("is-active");
    });

    if (newsList) {
        newsList.scrollTop = 0;
    }

    if (stage) {
        stage.style.transform = "translateY(0)";
    }

    requestAnimationFrame(updateNewsListScrollbar);
}

function initInteractions() {
    const {
        listItems,
        relatedItems,
        scrollToTopButtons
    } = getElements();

    listItems.forEach((item) => {
        if (item.dataset.aboutNewsReady === "true") return;

        item.addEventListener("click", () => {
            const target = item.dataset.newsTarget || "sales";
            setActiveArticle(target);
        });

        item.dataset.aboutNewsReady = "true";
    });

    relatedItems.forEach((item) => {
        if (item.dataset.aboutNewsRelatedReady === "true") return;

        item.addEventListener("click", () => {
            const target = item.dataset.newsTarget || "sales";
            setActiveArticle(target);
        });

        item.dataset.aboutNewsRelatedReady = "true";
    });

    scrollToTopButtons.forEach((button) => {
        if (button.dataset.aboutNewsScrollTopReady === "true") return;

        button.addEventListener("click", () => {
            const { stage } = getElements();

            if (stage) {
                stage.style.transform = "translateY(0)";
            }
        });

        button.dataset.aboutNewsScrollTopReady = "true";
    });
}

async function loadNewsContent() {
    const { section } = getElements();

    if (!section || isLoading || isReady) return;

    isLoading = true;

    try {
        const response = await fetch("./news.html");
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        normalizeNewsContent(doc);

        const sourceNodes = [
            doc.querySelector(".news-stage"),
            doc.querySelector(".news-arrow")
        ].filter(Boolean);

        section.innerHTML = "";

        sourceNodes.forEach((node) => {
            const clone = node.cloneNode(true);
            normalizeNewsContent(clone);
            section.appendChild(clone);
        });

        normalizeNewsContent(section);
        ensureNewsListScrollbar();
        ensureAllNewsButton();
        initInteractions();
        initCustomNewsScroll();

        isReady = true;
        isLoading = false;

        showNewsListOnly();
        updateAboutNewsSection(0);
    } catch (error) {
        console.error("About news load error:", error);

        section.innerHTML = `
            <div class="about-news-section__loader">
                Не удалось загрузить новости
            </div>
        `;

        isLoading = false;
    }
}

export function initAboutNewsSection() {
    if (!document.body.classList.contains("about-page")) return;

    loadNewsContent();
}

export function updateAboutNewsSection(globalProgress) {
    if (!document.body.classList.contains("about-page")) return;

    const {
        section,
        stage,
        arrow
    } = getElements();

    if (!section) return;

    const revealY = mapRange(
        globalProgress,
        ABOUT_NEWS_REVEAL_START,
        ABOUT_NEWS_START,
        100,
        0
    );

    const localProgress = clamp(
        globalProgress - ABOUT_NEWS_START,
        0,
        ABOUT_NEWS_MAX
    );

    section.style.transform = `translateY(${revealY}vh)`;

    if (!isReady) {
        updatePageScrollbar(globalProgress);
        return;
    }

    if (stage) {
        if (document.body.classList.contains("about-news-article-open")) {
            const maxStageShift = getStageBottomShift(stage);

            const stageY = mapRange(
                localProgress,
                0,
                ABOUT_NEWS_MAX,
                0,
                -maxStageShift
            );

            stage.style.transform = `translateY(${stageY}px)`;
        } else {
            stage.style.transform = "translateY(0)";
        }
    }

    if (arrow) {
        arrow.style.opacity = "0";
        arrow.style.pointerEvents = "none";
    }

    updateNewsListScrollbar();
    updatePageScrollbar(globalProgress);
}