const config = window.recTheme || {};
const themeBase = new URL("../../", import.meta.url).href;

export function getAssetUrl(path) {
    if (!path) return "";
    const normalizedPath = String(path || "")
        .replace(/^\.\//, "")
        .replace(/^\/+/, "");

    const base = config.assetBase || themeBase;

    const key = normalizedPath.split("?")[0];
    if (Object.prototype.hasOwnProperty.call(config.assetOverrides || {}, key)) {
        return config.assetOverrides[key];
    }

    return new URL(normalizedPath, base).href;
}

export function getLabel(key, fallback = "") {
    return config.labels?.[key] ?? fallback;
}

export function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export function setDownloadLink(selector, url) {
    const link = document.querySelector(selector);
    if (!link) return;
    link.href = url || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.hidden = !url;
}

export function openContentFile(url) {
    if (url && /^https?:\/\//i.test(url)) window.open(url, "_blank", "noopener,noreferrer");
}

export function getPageUrl(slug) {
    const pages = config.pages || {};

    if (pages[slug]) return pages[slug];
    if (slug === "home") return `${window.location.origin}/`;
    if (window.location.hostname === "dev.recstudio.biz") {
        const url = new URL("/", window.location.origin);
        url.searchParams.set("pagename", slug);

        return url.href;
    }

    return new URL(`/${slug}/`, window.location.origin).href;
}
