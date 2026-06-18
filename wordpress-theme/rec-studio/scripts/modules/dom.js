export const dom = {
    main: document.querySelector(".main-container"),
    logoWrapper: document.querySelector(".logo-wrapper"),
    logo: document.querySelector(".main__container__logo"),
    menuSection: document.querySelector(".menu"),

    hasContentLinks: document.querySelector(".content__links"),
    contentPage: document.querySelector(".content--page"),
    aboutInfoText: document.querySelector(".about-info-text"),

    volumeBtn: document.querySelector(".settings__valume-btn"),
    volumeIcon: document.querySelector(".settings__valume-btn__img")
};

export const isContactsPage =
    document.body.classList.contains("contacts-page") ||
    document.querySelector(".contacts");

export function getSceneElements() {
    return {
        baseImg: document.querySelector(".about__img"),
        paralaxText: document.querySelector(".paralax-text"),
        infoBlock: document.querySelector(".about-info"),
        title: document.querySelector(".about__title")
    };
}