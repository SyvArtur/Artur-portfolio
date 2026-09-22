/* =========================================================
   CONFIGURATION
   ========================================================= */

/*
    Cloudflare R2 Public Development URL.
    Обязательно "/" в конце.
*/

const VIDEO_BASE_URL =
    "https://pub-d7fafa9766c64daaae78694b140637c2.r2.dev/";

/*
    Папки внутри R2.
*/

const PREVIEW_FOLDER =
    "previews/";

const VIDEO_FOLDER =
    "videos/";

/*
    Сколько видео показывать одновременно.
*/

const VIDEOS_PER_PAGE =
    4;

// =========================================================
// LANGUAGE
// =========================================================

/*
    Определяем язык страницы.
    /ru/          -> ru
    всё остальное -> en
*/

const PAGE_LANGUAGE =
    window.location.pathname.includes("/ru/")
        ? "ru"
        : "en";

const MANIFEST_URL =
    PAGE_LANGUAGE === "ru"
        ? "../assets/videos.json"
        : "assets/videos.json";
		
// =========================================================
// STATE
// =========================================================

let videos = [];

let currentPage = 1;

let currentVideoIndex = -1;


// =========================================================
// DOM
// =========================================================

// Video grid

const grid = document.getElementById(
    "portfolioVideoGrid"
);


// Pagination

const pagination = document.getElementById(
    "portfolioVideoPagination"
);

const previousPageButton = document.getElementById(
    "portfolioVideoPrevious"
);

const nextPageButton = document.getElementById(
    "portfolioVideoNext"
);

const pageInfo = document.getElementById(
    "portfolioVideoPageInfo"
);


// Player

const player = document.getElementById(
    "portfolioPlayer"
);

const playerVideo = document.getElementById(
    "portfolioPlayerVideo"
);

const playerCounter = document.getElementById(
    "portfolioPlayerCounter"
);

const playerTitle = document.getElementById(
    "portfolioPlayerTitle"
);

const playerDescription = document.getElementById(
    "portfolioPlayerDescription"
);

const playerClose = document.getElementById(
    "portfolioPlayerClose"
);

const playerPrevious = document.getElementById(
    "portfolioPlayerPrevious"
);

const playerNext = document.getElementById(
    "portfolioPlayerNext"
);


// =========================================================
// GET LOCALIZED TEXT
// =========================================================

function getVideoText(video) {

    if (!video) {

        return {
            title: "",
            description: ""
        };

    }


    /*
        Берём язык текущей страницы.

        Например:

        EN:
        video.en

        RU:
        video.ru

        Если по какой-то причине выбранного языка нет,
        используем английский как запасной вариант.
    */

    const languageData =
        video[PAGE_LANGUAGE] ||
        video.en ||
        {};


    return {

        title:
            languageData.title ||
            "",

        description:
            languageData.description ||
            ""

    };

}


// =========================================================
// INIT
// =========================================================

init();


async function init() {

    try {

        const response =
            await fetch(MANIFEST_URL);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}: ${response.url}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data.videos)) {

            throw new Error(
                "В manifest отсутствует массив videos."
            );

        }


        videos =
            data.videos;


        renderPage();

        updatePagination();


    } catch (error) {

        console.error(
            "Video portfolio error:",
            error
        );


        if (grid) {

            grid.innerHTML = `
                <p class="portfolio-videos__error">
                    Не удалось загрузить список видео.
                </p>
            `;

        }

    }

}


// =========================================================
// RENDER PAGE
// =========================================================

function renderPage() {

    if (!grid) {

        console.error(
            "Не найден #portfolioVideoGrid"
        );

        return;

    }


    closePlayer(false);


    grid.innerHTML = "";


    const startIndex =
        (currentPage - 1) *
        VIDEOS_PER_PAGE;


    const endIndex =
        startIndex +
        VIDEOS_PER_PAGE;


    const pageVideos =
        videos.slice(
            startIndex,
            endIndex
        );


    pageVideos.forEach(
        (video, localIndex) => {

            const globalIndex =
                startIndex +
                localIndex;


            const card =
                createVideoCard(
                    video,
                    globalIndex
                );


            grid.appendChild(card);

        }
    );

}


// =========================================================
// CREATE VIDEO CARD
// =========================================================

function createVideoCard(
    video,
    index
) {

    const card =
        document.createElement("article");


    card.className =
        "portfolio-video-card";


    // -----------------------------------------------------
    // Получаем перевод
    // -----------------------------------------------------

    const text =
        getVideoText(video);


    // -----------------------------------------------------
    // Preview
    // -----------------------------------------------------

    const preview =
        document.createElement("div");


    preview.className =
        "portfolio-video-card__preview";


    const image =
        document.createElement("img");


    image.loading =
        "lazy";


    image.alt =
        text.title ||
        "Video preview";


    image.src =
        VIDEO_BASE_URL +
        PREVIEW_FOLDER +
        video.preview;


    const playButton =
        document.createElement("span");


    playButton.className =
        "portfolio-video-card__play";


    playButton.textContent =
        "▶";


    preview.appendChild(image);

    preview.appendChild(playButton);


    preview.addEventListener(
        "click",
        () => openPlayer(index)
    );


    // -----------------------------------------------------
    // Title
    // -----------------------------------------------------

    const title =
        document.createElement("h3");


    title.className =
        "portfolio-video-card__title";


    title.textContent =
        text.title;


    // -----------------------------------------------------
    // Description
    // -----------------------------------------------------

    const description =
        document.createElement("p");


    description.className =
        "portfolio-video-card__description";


    description.textContent =
        text.description;


    // -----------------------------------------------------
    // Card
    // -----------------------------------------------------

    card.appendChild(preview);

    card.appendChild(title);

    card.appendChild(description);


    return card;

}


// =========================================================
// OPEN PLAYER
// =========================================================

function openPlayer(index) {

    if (
        index < 0 ||
        index >= videos.length
    ) {

        return;

    }


    currentVideoIndex =
        index;


    const video =
        videos[index];


    // -----------------------------------------------------
    // Получаем перевод
    // -----------------------------------------------------

    const text =
        getVideoText(video);


    // -----------------------------------------------------
    // Скрываем grid и pagination
    // -----------------------------------------------------

    grid.style.display =
        "none";

    pagination.style.display =
        "none";


    // -----------------------------------------------------
    // Показываем player
    // -----------------------------------------------------

    player.classList.add(
        "is-open"
    );


    player.setAttribute(
        "aria-hidden",
        "false"
    );


    // -----------------------------------------------------
    // Counter
    // -----------------------------------------------------

    playerCounter.textContent =
        `${index + 1} / ${videos.length}`;


    // -----------------------------------------------------
    // Title
    // -----------------------------------------------------

    playerTitle.textContent =
        text.title;


    // -----------------------------------------------------
    // Description
    // -----------------------------------------------------

    playerDescription.textContent =
        text.description;


    // -----------------------------------------------------
    // Video URL
    // -----------------------------------------------------

    const videoURL =
        VIDEO_BASE_URL +
        VIDEO_FOLDER +
        video.file;


    // -----------------------------------------------------
    // Сбрасываем старое видео
    // -----------------------------------------------------

    playerVideo.pause();


    playerVideo.removeAttribute(
        "src"
    );


    playerVideo.load();


    // -----------------------------------------------------
    // Загружаем новое видео
    // -----------------------------------------------------

    playerVideo.src =
        videoURL;


    playerVideo.load();


    // -----------------------------------------------------
    // Автоматически запускаем видео
    // -----------------------------------------------------

    playerVideo.play().catch(
        error => {

            console.warn(
                "Autoplay was blocked:",
                error
            );

        }
    );


    // -----------------------------------------------------
    // Navigation
    // -----------------------------------------------------

    updatePlayerNavigation();


    // -----------------------------------------------------
    // Scroll
    // -----------------------------------------------------

    requestAnimationFrame(() => {

        player.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    });

}


// =========================================================
// CLOSE PLAYER
// =========================================================

function closePlayer(
    scrollBack = true
) {

    if (
        !player.classList.contains(
            "is-open"
        )
    ) {

        return;

    }


    playerVideo.pause();


    playerVideo.removeAttribute(
        "src"
    );


    playerVideo.load();


    player.classList.remove(
        "is-open"
    );


    player.setAttribute(
        "aria-hidden",
        "true"
    );


    currentVideoIndex =
        -1;


    // Показываем grid

    grid.style.display =
        "";


    // Показываем pagination

    pagination.style.display =
        "";


    // Возвращаем прокрутку

    if (scrollBack) {

        requestAnimationFrame(() => {

            document
                .getElementById(
                    "portfolioVideos"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });

        });

    }

}


// =========================================================
// LOAD VIDEO
// =========================================================

function loadPlayerVideo(index) {

    if (
        index < 0 ||
        index >= videos.length
    ) {

        return;

    }


    currentVideoIndex =
        index;


    const video =
        videos[index];


    // -----------------------------------------------------
    // Получаем перевод
    // -----------------------------------------------------

    const text =
        getVideoText(video);


    // -----------------------------------------------------
    // Counter
    // -----------------------------------------------------

    playerCounter.textContent =
        `${index + 1} / ${videos.length}`;


    // -----------------------------------------------------
    // Title
    // -----------------------------------------------------

    playerTitle.textContent =
        text.title;


    // -----------------------------------------------------
    // Description
    // -----------------------------------------------------

    playerDescription.textContent =
        text.description;


    // -----------------------------------------------------
    // Video
    // -----------------------------------------------------

    playerVideo.pause();


    playerVideo.removeAttribute(
        "src"
    );


    playerVideo.load();


    playerVideo.src =
        VIDEO_BASE_URL +
        VIDEO_FOLDER +
        video.file;


    playerVideo.load();


    // -----------------------------------------------------
    // Автоматически запускаем новое видео
    // -----------------------------------------------------

    playerVideo.play().catch(
        error => {

            console.warn(
                "Autoplay was blocked:",
                error
            );

        }
    );


    // -----------------------------------------------------
    // Navigation
    // -----------------------------------------------------

    updatePlayerNavigation();

}


// =========================================================
// PLAYER NAVIGATION
// =========================================================

function updatePlayerNavigation() {

    playerPrevious.disabled =
        currentVideoIndex <= 0;


    playerNext.disabled =
        currentVideoIndex >=
        videos.length - 1;

}


function showPreviousVideo() {

    if (
        currentVideoIndex <= 0
    ) {

        return;

    }


    loadPlayerVideo(
        currentVideoIndex - 1
    );

}


function showNextVideo() {

    if (
        currentVideoIndex < 0 ||
        currentVideoIndex >=
        videos.length - 1
    ) {

        return;

    }


    loadPlayerVideo(
        currentVideoIndex + 1
    );

}


// =========================================================
// PAGINATION
// =========================================================

function updatePagination() {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                videos.length /
                VIDEOS_PER_PAGE
            )
        );


    pageInfo.textContent =
        `${currentPage} / ${totalPages}`;


    previousPageButton.disabled =
        currentPage <= 1;


    nextPageButton.disabled =
        currentPage >= totalPages;


    pagination.style.display =
        totalPages > 1
            ? ""
            : "none";

}


function goToPreviousPage() {

    if (
        currentPage <= 1
    ) {

        return;

    }


    currentPage--;


    renderPage();

    updatePagination();

}


function goToNextPage() {

    const totalPages =
        Math.ceil(
            videos.length /
            VIDEOS_PER_PAGE
        );


    if (
        currentPage >= totalPages
    ) {

        return;

    }


    currentPage++;


    renderPage();

    updatePagination();

}


// =========================================================
// EVENTS
// =========================================================

previousPageButton.addEventListener(
    "click",
    goToPreviousPage
);


nextPageButton.addEventListener(
    "click",
    goToNextPage
);


playerClose.addEventListener(
    "click",
    () => closePlayer()
);


playerPrevious.addEventListener(
    "click",
    showPreviousVideo
);


playerNext.addEventListener(
    "click",
    showNextVideo
);


// =========================================================
// KEYBOARD
// =========================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            !player.classList.contains(
                "is-open"
            )
        ) {

            return;

        }


        switch (event.key) {

            case "Escape":

                closePlayer();

                break;


            case "ArrowLeft":

                showPreviousVideo();

                break;


            case "ArrowRight":

                showNextVideo();

                break;

        }

    }
);