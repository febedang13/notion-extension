chrome.tabs.onActivated.addListener((activeInfo) => {
    displayButton(activeInfo.tabId);
});
chrome.tabs.onUpdated.addListener(async (tabId) => {
    await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
    });
    displayButton(tabId);
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "open")
            chrome.sidePanel.open({ tabId: request.tabId });
        sendResponse({ message: "opened" });
    }
);

async function displayButton(tabId) {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url.includes("goodreads.com/book/show")) {
        return;
    }

    await chrome.sidePanel.setOptions({
        tabId,
        path: 'sidepanel/index.html',
        enabled: true
    });
    // const bookId = tab.url.substring(36).split("?")[0];
    await chrome.scripting.executeScript({
        target: { tabId },
        func: bookLoaded,
        args: [tabId]
    });
}

function bookLoaded(tabId) {
    const notionBtn = document.getElementsByClassName("notion-btn")[0];

    if (!notionBtn) {
        const notionBtn = document.createElement("img");

        notionBtn.src = chrome.runtime.getURL("assets/notion-icon48.png");
        notionBtn.className = "notion-btn";
        notionBtn.title = "click to add to notion";
        notionBtn.style.width = "30px";
        notionBtn.style.height = "30px";
        notionBtn.style.cursor = "pointer";

        bookShareSection = document.getElementsByClassName("BookPageTitleSection__share")[0];
        bookShareSection.firstChild.style.alignItems = "center";

        bookShareSection.firstChild.appendChild(notionBtn);
        notionBtn.addEventListener("click", (e) => {
            chrome.runtime.sendMessage({ message: "open", tabId: tabId })
        });

        const bookContainer = document.querySelector("div.BookPage__gridContainer");
        const cover = document.querySelector("div.BookCover__image img").src;
        const title = bookContainer.querySelector("div.BookPageTitleSection__title h1").innerText;
        const authorList = bookContainer.querySelectorAll("div.BookPageMetadataSection__contributor span.ContributorLink__name");
        const authorNames = Array.from(authorList, a => a.innerText);
        const blurb = bookContainer.querySelector("div.BookPageMetadataSection__description span").innerText;
        const genreList = bookContainer.querySelectorAll("div.BookPageMetadataSection__genres span.BookPageMetadataSection__genreButton span.Button__labelItem");
        const genres = Array.from(genreList, g => g.innerText);
        const pages = bookContainer.querySelector("div.FeaturedDetails p").innerText.split(" ")[0];
        const rating = bookContainer.querySelector("div.BookRatingStars span").getAttribute("aria-label").split(" ")[1];
        
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                const elements = {
                    cover: cover, title: title, authors: authorNames, blurb: blurb, genres: genres, pages: pages, rating: rating
                };
                sendResponse(elements);
            }
        );


    }
};