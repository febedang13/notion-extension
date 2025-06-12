import saveToNotion from "../utils/saveToNotion.js";
// import uploadFile from "../utils/notionCover.js";
// import ColorThief from '../node_modules/colorthief/dist/color-thief.mjs'

let bookElements, selectedGenre, grURL;
let selectedSubgenres = [];

// const colorThief = new ColorThief();

const coverElement = document.getElementById("cover");
const titleElement = document.getElementById("title");
const authorElement = document.getElementById("authors");
const pagesElement = document.getElementById("pages");
const dateElement = document.getElementById("finished");
const blurbElement = document.getElementById("blurb");
const scoreElement = document.getElementById("score");

const ficGenre = document.getElementById("fic");
ficGenre.addEventListener("click", (e) => genreClick(e.target));
const nonficGenre = document.getElementById("nonfic");
nonficGenre.addEventListener("click", (e) => genreClick(e.target));

const subGenreContainer = document.getElementById("sgenre-container");
const subgenreList = ["Biography", "Contemporary", "Essays", "Fantasy", "Historical Fiction", "History", "Horror",
    "Literary", "Magical Realism", "Memoir", "Mystery", "Psychology", "Romance", "Sci-fi", "Short Stories", "Sociology",
    "Speculative Fiction", "Thriller", "True Crime", "Young Adult"];

document.getElementById("notion-add").addEventListener("click", addToNotion);

for (const sgenre of subgenreList) {
    const button = document.createElement("button");
    button.className = "btn-custom";
    button.innerText = sgenre;
    button.addEventListener("click", (e) => subgenreClick(e.target));
    subGenreContainer.appendChild(button);
}

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    grURL = tabs[0].url;
    chrome.tabs.sendMessage(tabs[0].id, { data: "hello" }, response => {
        bookElements = response;
        initializePanel();
    });
});

function initializePanel() {
    const coverImg = document.createElement("img");
    coverImg.src = bookElements.cover;
    coverElement.appendChild(coverImg);

    titleElement.value = bookElements.title;
    authorElement.value = String(bookElements.authors).replaceAll(",", ", ");
    pagesElement.value = bookElements.pages;
    blurbElement.value = bookElements.blurb;
    scoreElement.value = bookElements.rating;
    dateElement.valueAsDate = new Date();

    if (bookElements.genres.includes("Fiction")) {
        ficGenre.classList.add("select");
        selectedGenre = "Fiction";
    } else {
        nonficGenre.classList.add("select");
        selectedGenre = "Nonfiction";
    }
}

function genreClick(genre) {
    if (genre.id == "fic" && !ficGenre.classList.contains("select")) {
        ficGenre.classList.add("select");
        nonficGenre.classList.remove("select");
        selectedGenre = "Fiction";
    }
    if (genre.id == "nonfic" && !nonficGenre.classList.contains("select")) {
        nonficGenre.classList.add("select");
        ficGenre.classList.remove("select");
        selectedGenre = "Nonfiction";
    }
}

function subgenreClick(subgenre) {
    if (selectedSubgenres.includes(subgenre.innerText)) {
        const i = selectedSubgenres.findIndex(x => x == subgenre.innerText);
        selectedSubgenres.splice(i, 1);
        subgenre.classList.remove("select");
    } else {
        selectedSubgenres.push(subgenre.innerText);
        subgenre.classList.add("select");
    }
}

// async function createCover(pageId) {
//     let url = bookElements.cover;

//     const canvas = document.createElement('canvas');
//     canvas.width = 1500;
//     canvas.height = 600;
//     const image = new Image();
//     image.src = bookElements.cover;
//     image.crossOrigin = 'anonymous';
//     image.onload = function () {
//         const color = colorThief.getColor(image);
//         canvas.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
//         const cxt = canvas.getContext('2d');
//         cxt.drawImage(image,
//             canvas.width / 2 - image.width / 2,
//             0,
//             600 * image.width / image.height,
//             600
//         );
//     };
//     const blob = await new Promise(resolve => canvas.toBlob(resolve));
//     const fileStream = blob.stream();
//     const form = new FormData();
//     form.append('file', blob);

//     try {
//         const response = await uploadFile(
//             form,
//             process.env.NOTION_KEY,
//             pageId
//         );
//     } catch (error) {
//         console.error("Failed to upload cover", error);
//     }

// }

async function addToNotion() {
    let bodyData = {
        "cover": {
            "external": {
                "url": bookElements.cover
            }
        },
        "icon": {
            "external": {
                "url": bookElements.cover
            }
        },
        "parent": {
            "database_id": process.env.NOTION_DATABASE_ID
        },
        "properties": {
            "Pages": {
                "number": parseInt(pagesElement.value)
            },
            "Goodreads": {
                "url": grURL
            },
            "Blurb": {
                "rich_text": [
                    {
                        "text": {
                            "content": blurbElement.value
                        }
                    }
                ]
            },
            "Finished": {
                "date": {
                    "start": dateElement.value
                }
            },
            "Sub-genre": {
                "multi_select": subgenreFormat(selectedSubgenres)
            },
            "Author(s)": {
                "multi_select": authorFormat(authorElement.value)
            },
            "Genre": {
                "select": {
                    "name": selectedGenre
                }
            },
            "Title": {
                "title": [
                    {
                        "text": {
                            "content": titleElement.value
                        }
                    }
                ]
            }
        }
    };

    if (scoreElement.options[scoreElement.selectedIndex]) {
        const newProps = {
            ...bodyData.properties,
            "Score /5": {
                "select": {
                    "id": scoreElement.options[scoreElement.selectedIndex].id
                }
            }
        };
        bodyData.properties = newProps;
    }

    try {
        const response = await saveToNotion(
            bodyData,
            process.env.NOTION_KEY
        );
        // const coverResponse = await createCover(response.id);
        const modal = document.querySelector("div.modal-background");
        modal.querySelector("span").innerText = titleElement.value;
        modal.style.display = "block";
        setTimeout(function () {
            window.close();
        }, 2000);
    } catch (error) {
        console.error("Failed to save book to Notion:", error);
    }
}

function authorFormat(list) {
    const newList = [];
    for (const elem of list.split(", ")) {
        const propObject = { "name": elem };
        newList.push(propObject);
    }

    return newList;
}

function subgenreFormat(list) {
    const newList = [];
    for (const elem of list) {
        const propObject = { "name": elem };
        newList.push(propObject);
    }

    return newList;
}