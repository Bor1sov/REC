const config = window.recTheme || {};
const themeBase = new URL("../../", import.meta.url).href;

export function getAssetUrl(path) {
    const normalizedPath = String(path || "")
        .replace(/^\.\//, "")
        .replace(/^\/+/, "");

    const base = config.assetBase || themeBase;

    return new URL(normalizedPath, base).href;
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
