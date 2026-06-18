export const state = {
    isSoundEnabled: true,

    progress: 0,
    targetProgress: 0,
    pageProgressMax: 1,
    pageProgressStops: null,
    pageProgressInstantSegments: null,

    isUIVisible: false,
    clickCount: 0,

    isLogoInMenu: false,
    isLogoMovingToMenu: false,
    aboutTitleEntryProgress: 0,
    aboutTitleEntryDone: false,
    aboutTitleScrollIntroComplete: false,

    currentSize: 200,
    currentPosition: 5,
    currentLeftOffset: 50,

    pageScrollbar: null,
    pageScrollbarThumb: null,
    scrollbarTimer: null,

    aboutTextScrollbar: null,
    aboutTextScrollbarFill: null,

    shouldSkipIntro: false
};
