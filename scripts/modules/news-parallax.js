import { state } from "./state.js";
import { updatePageScrollbar } from "./page-scrollbar.js";

const newsState = {
    progress: 0,
    targetProgress: 0,
    maxProgress: 1,
    isReady: false
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
        listItems: document.querySelectorAll(".news-list__item"),
        relatedItems: document.querySelectorAll(".news-related__item"),
        backButtons: document.querySelectorAll(".news-back-to-list"),
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

    newsState.progress +=
        (newsState.targetProgress - newsState.progress) * 0.08;

    if (Math.abs(newsState.targetProgress - newsState.progress) < 0.0005) {
        newsState.progress = newsState.targetProgress;
    }

    updateNewsScene(newsState.progress);

    requestAnimationFrame(animateNews);
}

function showNewsListOnly() {
    const { articles, listItems } = getNewsElements();

    document.body.classList.remove("news-article-open");

    articles.forEach((article) => {
        article.classList.remove("is-active");
    });

    listItems.forEach((item) => {
        item.classList.remove("is-active");
    });

    lockNativeScroll();
    resetNewsProgress();
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

function initShowMore() {
    const { listSection, showMoreButton } = getNewsElements();

    if (!listSection || !showMoreButton) return;
    if (showMoreButton.dataset.showMoreReady === "true") return;

    showMoreButton.addEventListener("click", () => {
        const isExpanded = listSection.classList.toggle("is-expanded");

        showMoreButton.textContent = isExpanded
            ? "Свернуть"
            : "Показать еще";

        lockNativeScroll();
        resetNewsProgress();
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

            const direction = event.deltaY > 0 ? 1 : -1;
            const speed = 0.16;

            newsState.targetProgress = clamp(
                newsState.targetProgress + direction * speed,
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
    });

    document.body.dataset.newsResizeReady = "true";
}

function initNewsPage() {
    if (!document.body.classList.contains("news-page")) return;
    if (newsState.isReady) return;

    newsState.isReady = true;

    lockNativeScroll();

    initNewsList();
    initRelatedNews();
    initBackButtons();
    initShowMore();
    initNewsWheel();
    initNewsArrow();
    initNewsResize();

    showNewsListOnly();

    requestAnimationFrame(() => {
        newsState.maxProgress = getMaxProgress();
        updateNewsScene(0);
        animateNews();
    });
}

document.addEventListener("DOMContentLoaded", initNewsPage);