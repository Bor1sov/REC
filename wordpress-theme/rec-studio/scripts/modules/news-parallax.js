import { state } from "./state.js";
import { updatePageScrollbar } from "./page-scrollbar.js";

const NEWS_SCROLL_EASE = 0.045;
const WHEEL_DELTA_LIMIT = 120;
const WHEEL_PROGRESS_STEP = 0.0011;
const NEWS_OLD_BUTTON_LABEL = "▲ Старые";
const NEWS_NEW_BUTTON_LABEL = "▼ Новые";

const newsState = {
    progress: 0,
    targetProgress: 0,
    maxProgress: 1,
    isReady: false,
    listScrollbar: null,
    listScrollbarFill: null
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getNewsElements() {
    return {
        stage: document.querySelector(".news-stage"),
        arrow: document.querySelector(".news-arrow"),
        articles: document.querySelectorAll(".news-article"),
        listSection: document.querySelector(".news-list-section"),
        newsList: document.querySelector(".news-list"),
        tabs: document.querySelectorAll(".news-tabs__item"),
        listItems: document.querySelectorAll(".news-list__item"),
        relatedItems: document.querySelectorAll(".news-related__item"),
        backButtons: document.querySelectorAll(".news-back-to-list"),
        scrollToTopButtons: document.querySelectorAll(".news-scroll-to-top"),
        showMoreButton: document.querySelector(".news-show-more")
    };
}

function lockNativeScroll() {
    document.documentElement.classList.add("news-html");

    document.documentElement.style.height = "100%";
    document.documentElement.style.overflow = "hidden";

    document.body.style.position = "fixed";
    document.body.style.inset = "0";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";
}

function getMaxProgress() {
    const { stage } = getNewsElements();

    if (!stage) return 1;

    const totalHeight = stage.scrollHeight;
    const viewportHeight = window.innerHeight;

    return Math.max(1, (totalHeight - viewportHeight) / viewportHeight);
}

function updateNewsScene(progressValue) {
    if (!document.body.classList.contains("news-page")) return;

    const { stage, arrow } = getNewsElements();

    const isListMode = !document.body.classList.contains("news-article-open");

    if (isListMode) {
        newsState.progress = 0;
        newsState.targetProgress = 0;
        newsState.maxProgress = 1;

        state.pageProgressMax = 1;
        state.progress = 0;
        state.targetProgress = 0;

        if (stage) {
            stage.style.transform = "translateY(0)";
        }

        if (arrow) {
            arrow.style.opacity = "0";
            arrow.style.pointerEvents = "none";
        }

        updatePageScrollbar(0);
        return;
    }

    newsState.maxProgress = getMaxProgress();

    const p = clamp(progressValue, 0, newsState.maxProgress);

    if (stage) {
        stage.style.transform = `translateY(${-p * window.innerHeight}px)`;
    }

    if (arrow) {
        const isEnd = p >= newsState.maxProgress - 0.04;

        arrow.style.opacity = isEnd ? "0" : "1";
        arrow.style.pointerEvents = isEnd ? "none" : "auto";
    }

    state.pageProgressMax = newsState.maxProgress;
    state.progress = p;
    state.targetProgress = p;

    updatePageScrollbar(p);
}

function resetNewsProgress() {
    newsState.progress = 0;
    newsState.targetProgress = 0;
    newsState.maxProgress = getMaxProgress();

    requestAnimationFrame(() => {
        newsState.maxProgress = getMaxProgress();
        updateNewsScene(0);
    });
}

function animateNews() {
    if (!document.body.classList.contains("news-page")) return;

    if (!document.body.classList.contains("news-article-open")) {
        newsState.progress = 0;
        newsState.targetProgress = 0;

        updateNewsScene(0);

        requestAnimationFrame(animateNews);
        return;
    }

    newsState.progress +=
        (newsState.targetProgress - newsState.progress) * NEWS_SCROLL_EASE;

    if (Math.abs(newsState.targetProgress - newsState.progress) < 0.0005) {
        newsState.progress = newsState.targetProgress;
    }

    updateNewsScene(newsState.progress);

    requestAnimationFrame(animateNews);
}

function updateNewsListScrollbar() {
    const { newsList } = getNewsElements();

    if (!newsList || !newsState.listScrollbar || !newsState.listScrollbarFill) return;

    const maxScroll = newsList.scrollHeight - newsList.clientHeight;

    if (maxScroll <= 0) {
        newsState.listScrollbar.style.opacity = "0";
        newsState.listScrollbarFill.style.height = "0%";
        return;
    }

    newsState.listScrollbar.style.opacity = "1";

    const progress = newsList.scrollTop / maxScroll;
    const fill = Math.max(0, Math.min(100, progress * 100));

    newsState.listScrollbarFill.style.height = `${fill}%`;
}

function initNewsListScrollbar() {
    const { listSection, newsList } = getNewsElements();

    if (!listSection || !newsList) return;
    if (newsList.dataset.customScrollbarReady === "true") return;

    const content = listSection.querySelector(".news-list-section__content");

    if (!content) return;

    newsState.listScrollbar = document.createElement("div");
    newsState.listScrollbar.className = "news-list-scrollbar";

    newsState.listScrollbarFill = document.createElement("div");
    newsState.listScrollbarFill.className = "news-list-scrollbar__fill";

    const arrow = document.createElement("div");
    arrow.className = "news-list-scrollbar__arrow";

    newsState.listScrollbar.appendChild(newsState.listScrollbarFill);
    newsState.listScrollbar.appendChild(arrow);

    content.appendChild(newsState.listScrollbar);

    newsList.addEventListener("scroll", updateNewsListScrollbar);
    window.addEventListener("resize", updateNewsListScrollbar);

    newsList.dataset.customScrollbarReady = "true";

    requestAnimationFrame(updateNewsListScrollbar);
}

function showNewsListOnly() {
    const { articles, listItems, newsList, stage } = getNewsElements();

    document.body.classList.remove("news-article-open");

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

    lockNativeScroll();
    resetNewsProgress();

    requestAnimationFrame(updateNewsListScrollbar);
}

function setActiveArticle(articleKey) {
    const { articles, listItems } = getNewsElements();

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

    document.body.classList.add("news-article-open");

    lockNativeScroll();
    resetNewsProgress();
}

function getNewsItemTags(item) {
    return (item.dataset.newsTags || "")
        .split(/\s+/)
        .filter(Boolean);
}

function applyNewsFilter(filter = "all") {
    const { listItems, newsList, listSection, showMoreButton } = getNewsElements();
    const activeFilter = filter || "all";

    listItems.forEach((item) => {
        const tags = getNewsItemTags(item);
        const isVisible =
            activeFilter === "all" ||
            (activeFilter === "new" && !tags.includes("old")) ||
            tags.includes(activeFilter);

        item.classList.toggle("is-filtered-out", !isVisible);
        item.classList.remove("is-active");
    });

    if (listSection && activeFilter !== "all") {
        listSection.classList.remove("is-expanded");
    }

    if (showMoreButton && activeFilter !== "all") {
        showMoreButton.textContent = "Показать еще";
    }

    if (newsList) {
        newsList.scrollTop = 0;
    }

    requestAnimationFrame(updateNewsListScrollbar);
}

function isNewsAgeToggle(tab) {
    return tab.dataset.newsFilter === "old" || tab.dataset.newsFilter === "new";
}

function resetNewsAgeToggle(tab) {
    if (!isNewsAgeToggle(tab)) return;

    tab.dataset.newsFilter = "old";
    tab.textContent = NEWS_OLD_BUTTON_LABEL;
}

function getNextNewsAgeFilter(tab) {
    if (!isNewsAgeToggle(tab)) {
        return tab.dataset.newsFilter || "all";
    }

    return tab.dataset.newsFilter === "old" ? "old" : "new";
}

function updateNewsAgeToggle(tab, filter) {
    if (!isNewsAgeToggle(tab)) return;

    if (filter === "old") {
        tab.dataset.newsFilter = "new";
        tab.textContent = NEWS_NEW_BUTTON_LABEL;
        return;
    }

    tab.dataset.newsFilter = "old";
    tab.textContent = NEWS_OLD_BUTTON_LABEL;
}
function initNewsTabs() {
    const { tabs } = getNewsElements();

    if (!tabs.length) return;

    const activeTab =
        Array.from(tabs).find((tab) => tab.classList.contains("is-active")) ||
        tabs[0];

    applyNewsFilter(isNewsAgeToggle(activeTab) ? "old" : activeTab.dataset.newsFilter || "all");

    tabs.forEach((tab) => {
        if (tab.dataset.tabReady === "true") return;

        tab.addEventListener("click", () => {
            const nextFilter = getNextNewsAgeFilter(tab);

            tabs.forEach((item) => {
                item.classList.toggle("is-active", item === tab);

                if (item !== tab) {
                    resetNewsAgeToggle(item);
                }
            });

            applyNewsFilter(nextFilter);
            updateNewsAgeToggle(tab, nextFilter);
        });

        tab.dataset.tabReady = "true";
    });
}
function initNewsList() {
    const { listItems } = getNewsElements();

    listItems.forEach((item) => {
        if (item.dataset.newsReady === "true") return;

        item.addEventListener("click", () => {
            const target = item.dataset.newsTarget || "sales";
            setActiveArticle(target);
        });

        item.dataset.newsReady = "true";
    });
}

function initRelatedNews() {
    const { relatedItems } = getNewsElements();

    relatedItems.forEach((item) => {
        if (item.dataset.relatedReady === "true") return;

        item.addEventListener("click", () => {
            const target = item.dataset.newsTarget || "sales";
            setActiveArticle(target);
        });

        item.dataset.relatedReady = "true";
    });
}

function buildNewsFooterControls() {
    const articles = document.querySelectorAll(".news-article");

    articles.forEach((article) => {
        if (article.dataset.footerControlsReady === "true") return;

        const share = article.querySelector(".news-share");
        const scrollToTop = article.querySelector(".news-scroll-to-top");

        if (!share || !scrollToTop) return;

        const bar = document.createElement("div");
        bar.className = "news-footer-bar";

        const controls = document.createElement("div");
        controls.className = "news-footer-controls";

        const backButton = document.createElement("button");
        backButton.className = "news-back-to-list";
        backButton.type = "button";
        backButton.setAttribute("aria-label", "Вернуться к списку новостей");

        share.before(bar);
        bar.appendChild(share);
        bar.appendChild(controls);
        controls.appendChild(backButton);
        controls.appendChild(scrollToTop);

        article.dataset.footerControlsReady = "true";
    });
}

function initBackButtons() {
    const { backButtons } = getNewsElements();

    backButtons.forEach((button) => {
        if (button.dataset.backReady === "true") return;

        button.addEventListener("click", () => {
            showNewsListOnly();
        });

        button.dataset.backReady = "true";
    });
}

function initScrollToTopButtons() {
    const { scrollToTopButtons } = getNewsElements();

    scrollToTopButtons.forEach((button) => {
        if (button.dataset.scrollTopReady === "true") return;

        button.addEventListener("click", () => {
            if (!document.body.classList.contains("news-article-open")) return;

            newsState.targetProgress = 0;
            newsState.progress = 0;

            updateNewsScene(0);
        });

        button.dataset.scrollTopReady = "true";
    });
}

function initShowMore() {
    const { listSection, showMoreButton } = getNewsElements();

    if (!listSection || !showMoreButton) return;
    if (showMoreButton.dataset.showMoreReady === "true") return;

    showMoreButton.addEventListener("click", () => {
        const isExpanded = listSection.classList.toggle("is-expanded");

        showMoreButton.textContent = isExpanded
            ? "Свернуть"
            : "Показать еще";

        resetNewsProgress();

        requestAnimationFrame(updateNewsListScrollbar);
    });

    showMoreButton.dataset.showMoreReady = "true";
}

function initNewsWheel() {
    if (document.body.dataset.newsWheelReady === "true") return;

    window.addEventListener(
        "wheel",
        (event) => {
            if (!document.body.classList.contains("news-page")) return;

            event.preventDefault();

            const { newsList } = getNewsElements();

            if (!document.body.classList.contains("news-article-open")) {
                newsState.progress = 0;
                newsState.targetProgress = 0;

                state.progress = 0;
                state.targetProgress = 0;

                if (!newsList) return;

                const normalizedListDelta = Math.sign(event.deltaY) *
                    Math.min(Math.abs(event.deltaY), WHEEL_DELTA_LIMIT);

                newsList.scrollTop += normalizedListDelta;

                updateNewsListScrollbar();
                updateNewsScene(0);

                return;
            }            const normalizedDelta = Math.sign(event.deltaY) *
                Math.min(Math.abs(event.deltaY), WHEEL_DELTA_LIMIT);

            newsState.targetProgress = clamp(
                newsState.targetProgress + normalizedDelta * WHEEL_PROGRESS_STEP,
                0,
                newsState.maxProgress
            );
        },
        {
            passive: false
        }
    );

    document.body.dataset.newsWheelReady = "true";
}

function initNewsArrow() {
    const { arrow } = getNewsElements();

    if (!arrow || arrow.dataset.newsArrowReady === "true") return;

    arrow.addEventListener("click", () => {
        if (!document.body.classList.contains("news-article-open")) return;

        newsState.targetProgress = clamp(
            newsState.targetProgress + 0.8,
            0,
            newsState.maxProgress
        );
    });

    arrow.dataset.newsArrowReady = "true";
}

function initNewsResize() {
    if (document.body.dataset.newsResizeReady === "true") return;

    window.addEventListener("resize", () => {
        if (!document.body.classList.contains("news-page")) return;

        lockNativeScroll();

        if (!document.body.classList.contains("news-article-open")) {
            newsState.progress = 0;
            newsState.targetProgress = 0;
            newsState.maxProgress = 1;

            updateNewsScene(0);
            updateNewsListScrollbar();

            return;
        }

        newsState.maxProgress = getMaxProgress();

        newsState.progress = clamp(
            newsState.progress,
            0,
            newsState.maxProgress
        );

        newsState.targetProgress = clamp(
            newsState.targetProgress,
            0,
            newsState.maxProgress
        );

        updateNewsScene(newsState.progress);
        updateNewsListScrollbar();
    });

    document.body.dataset.newsResizeReady = "true";
}

function initNewsPage() {
    if (!document.body.classList.contains("news-page")) return;
    if (newsState.isReady) return;

    newsState.isReady = true;

    lockNativeScroll();

    initNewsList();
    initNewsTabs();
    initRelatedNews();
    buildNewsFooterControls();
    initBackButtons();
    initScrollToTopButtons();
    initNewsListScrollbar();
    initNewsWheel();
    initNewsArrow();
    initNewsResize();

    showNewsListOnly();

    requestAnimationFrame(() => {
        newsState.maxProgress = getMaxProgress();
        updateNewsScene(0);
        updateNewsListScrollbar();
        animateNews();
    });
}

document.addEventListener("DOMContentLoaded", initNewsPage);
