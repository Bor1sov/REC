import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const themeDir = path.resolve(toolsDir, "..");
const projectDir = path.resolve(themeDir, "..", "..");

const pages = [
    {
        source: "index.html",
        target: "front-page.php",
        templateName: null
    },
    {
        source: "about.html",
        target: "page-about.php",
        templateName: "REC About"
    },
    {
        source: "projects.html",
        target: "page-projects.php",
        templateName: "REC Projects"
    },
    {
        source: "help.html",
        target: "page-help.php",
        templateName: "REC Help"
    },
    {
        source: "news.html",
        target: "page-news.php",
        templateName: "REC News"
    },
    {
        source: "contacts.html",
        target: "page-contacts.php",
        templateName: "REC Contacts"
    }
];

const routeMap = {
    "index.html": "home",
    "about.html": "about",
    "projects.html": "projects",
    "help.html": "help",
    "news.html": "news",
    "contacts.html": "contacts"
};

const assetPathMap = {
    "Comics_oscar.jpg": "comics-oscar.jpg",
    "Comics_people.jpg": "comics-people.jpg",
    "Comics_revolver.jpg": "comics-revolver.jpg",
    "Marketing.jpg": "marketing.jpg",
    "Max_logo_white.png": "max-logo-white.png",
    "Movie_book.jpg": "movie-book.jpg",
    "Movie_scene.jpg": "movie-scene.jpg",
    "Odnoklassniki white.png": "odnoklassniki-white.png",
    "Scenarists.jpg": "scenarists.jpg",
    "pic 1.jpg": "pic-1.jpg",
    "pic 2.jpg": "pic-2.jpg",
    "pic 3.jpg": "pic-3.jpg",
    "pic 4.jpg": "pic-4.jpg",
    "pic 5.jpg": "pic-5.jpg",
    "Алчность.jpg": "alchnost.jpg",
    "Атаманка.jpg": "atamanka.jpg",
    "Вещественные.jpg": "veshchestvennye.jpg",
    "Видеосъемка.png": "video-production.png",
    "Генезис.jpg": "genesis.jpg",
    "Дикая дивизия.jpg": "dikaya-diviziya.jpg",
    "Дорога в.jpg": "doroga-v.jpg",
    "ЗВУК.png": "sound-on.png",
    "Золото Белогорского монастыря.jpg": "zoloto-belogorskogo-monastyrya.jpg",
    "Изоляция.jpg": "izolyatsiya.jpg",
    "Любимое дело.jpg": "lyubimoe-delo.jpg",
    "Любит не любит.jpg": "lyubit-ne-lyubit.jpg",
    "Наши мамаши.jpg": "nashi-mamashi.jpg",
    "Наши проекты Моб.jpg": "projects-mobile.jpg",
    "О-нас-Моб.png": "about-mobile.jpg",
    "Семейный патруль.jpg": "semeyny-patrul.jpg",
    "СпецНаз.jpg": "spetsnaz.jpg",
    "Сторож.jpg": "storozh.jpg",
    "Сыщик.jpg": "syschik.jpg",
    "Тайна молебки.jpg": "tayna-molebki.jpg",
    "Узнавайка.jpg": "uznavayka.jpg",
    "Фигура 3.png": "social-vk.png",
    "Фигура 4 копия.png": "social-telegram.png",
    "Фигура 5.png": "social-facebook.png",
    "Шапиро.jpg": "shapiro.jpg",
    "рекламный департамент.jpg": "advertising-department.jpg",
    "сопровождение проектов.jpg": "project-support.jpg",
    "три в одном.jpg": "tri-v-odnom.jpg"
};

function phpSingleQuoted(value) {
    return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

function transformAssets(content) {
    return content.replace(
        /(src|href)="\.\/assets\/([^"]+)"/g,
        (_, attribute, assetPath) => {
            const normalizedAssetPath = assetPathMap[assetPath] || assetPath;
            const themePath = `assets/${phpSingleQuoted(normalizedAssetPath)}`;

            return `${attribute}="<?php echo esc_url( rec_theme_asset( '${themePath}' ) ); ?>"`;
        }
    );
}

function transformRoutes(content) {
    let result = content;

    for (const [fileName, slug] of Object.entries(routeMap)) {
        const escapedFile = fileName.replace(".", "\\.");
        const routeExpression =
            slug === "home"
                ? "<?php echo esc_url( home_url( '/' ) ); ?>"
                : `<?php echo esc_url( rec_theme_page_url( '${slug}' ) ); ?>`;

        result = result.replace(
            new RegExp(`href="(?:\\./)?${escapedFile}"`, "g"),
            `href="${routeExpression}"`
        );
    }

    const homeExpression = "<?php echo esc_url( home_url( '/' ) ); ?>";

    result = result.replace(
        /onclick="window\.location\.href\s*=\s*'index\.html'"/g,
        `onclick="window.location.href='${homeExpression}'"`
    );

    return result;
}

function transformHelpDetailControls(content) {
    let result = content;

    result = result.replace(
        /\s*<button class="help-detail__close"[\s\S]*?<\/button>\s*/i,
        "\n"
    );

    result = result.replace(
        /(<div class="help-detail__breadcrumbs">\s*)[^<]*?&gt;\s*(<button\s+class="help-detail__breadcrumbs-current")/i,
        `$1<button
              class="help-detail__breadcrumbs-home"
              type="button"
              aria-label="Перейти на страницу услуг"
            >Услуги</button>
            <span class="help-detail__breadcrumbs-separator">&gt;</span>
            $2`
    );

    result = result.replace(
        /<span class="help-detail__breadcrumbs-current"><\/span>/i,
        `<button
              class="help-detail__breadcrumbs-current"
              type="button"
              aria-label="Переключить набор услуг"
            ></button>`
    );

    result = result.replace(
        /<div class="help-detail__downloads">\s*(?!<button[^>]+help-detail__back)/i,
        `<div class="help-detail__downloads">
            <button
              class="help-detail__back"
              type="button"
              aria-label="Вернуться к списку услуг"
            ></button>

            `
    );

    result = result
        .replace(/Скачать\s+презентацию/gi, "Презентация")
        .replace(/Скачать\s+прайс/gi, "Прайс");

    return result;
}

function transformImagePerformanceAttrs(content) {
    return content.replace(/<img\b[^>]*>/gi, (tag) => {
        const isHeroImage =
            /\bclass="[^"]*\b(?:about__img|projects-bg__img|help-bg__img)\b/i.test(tag);
        const isUiIcon = /\bclass="[^"]*\bsettings__valume-btn__img\b/i.test(tag);
        let result = tag;

        if (!/\bdecoding=/.test(result)) {
            result = result.replace(/<img\b/i, '<img decoding="async"');
        }

        if (isHeroImage && !/\bfetchpriority=/.test(result)) {
            result = result.replace(/\s*\/?>$/, ' fetchpriority="high"$&');
        }

        if (!isHeroImage && !isUiIcon && !/\bloading=/.test(result)) {
            result = result.replace(/<img\b/i, '<img loading="lazy"');
        }

        return result;
    });
}

function extractBody(html, sourceName) {
    const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);

    if (!bodyMatch) {
        throw new Error(`Body not found in ${sourceName}`);
    }

    return bodyMatch[1]
        .replace(
            /\s*<script\b[^>]*src="\.\/scripts\/[^"]+"[^>]*><\/script>\s*/gi,
            "\n"
        )
        .trim();
}

function buildTemplate(content, templateName) {
    const docblock = templateName
        ? `/**\n * Template Name: ${templateName}\n *\n * @package RecStudio\n */`
        : `/**\n * Front page template.\n *\n * @package RecStudio\n */`;

    return `<?php
${docblock}

get_header();
?>
${content}
<?php
get_footer();
`;
}

for (const page of pages) {
    const sourcePath = path.join(projectDir, page.source);
    const targetPath = path.join(themeDir, page.target);
    const html = await fs.readFile(sourcePath, "utf8");

    let content = extractBody(html, page.source);
    content = transformAssets(content);
    content = transformRoutes(content);
    content = transformImagePerformanceAttrs(content);

    if (page.source === "help.html") {
        content = transformHelpDetailControls(content);
    }

    await fs.writeFile(
        targetPath,
        buildTemplate(content, page.templateName),
        "utf8"
    );
}

console.log(`Generated ${pages.length} WordPress page templates.`);
