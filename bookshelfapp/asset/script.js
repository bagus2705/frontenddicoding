const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "Book_apps";

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser tidak mendukung local storage");
    return false;
  }
  return true;
}
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});
const simpanForm = document.getElementById("formDataBuku");
simpanForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addBook();
});
const searchForm = document.getElementById("bookSearch");
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchBook();
});
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBook = document.getElementById("belumDibaca");
  uncompletedBook.innerHTML = "";

  const completedBook = document.getElementById("sudahDibaca");
  completedBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completedBook.appendChild(bookElement);
    } else {
      uncompletedBook.appendChild(bookElement);
    }
  }
});
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}
function generateId() {
  return +new Date();
}
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: parseInt(year, 10),
    isComplete,
  };
}
const addBook = () => {
  const bookTitle = document.getElementById("judul").value;
  const bookAuthor = document.getElementById("penulis").value;
  const bookYear = document.getElementById("tahun").value;
  const bookHasFinished = document.getElementById("isComplete");

  const bookStatus = bookHasFinished.checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookStatus
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};
function makeBook(bookObject) {
  const bookTitle = document.createElement("h2");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = bookObject.author;

  const bookDate = document.createElement("p");
  bookDate.innerText = bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(bookTitle, bookAuthor, bookDate);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${bookObject.id}`);
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");

  deleteButton.addEventListener("click", function () {
    removeBook(bookObject.id);
  });

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });
    container.append(undoButton, deleteButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addBooktoCompleted(bookObject.id);
    });
    container.append(checkButton, deleteButton);
  }

  return container;
}
function addBooktoCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}
function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  const overlay = document.getElementById("overlay");
  overlay.style.display = "block";

  const confirmDialog = document.getElementById("confirmDialog");
  confirmDialog.style.display = "block";

  const confirmButton = document.getElementById("confirmButton");
  const cancelButton = document.getElementById("cancelButton");

  const confirmDeletion = () => {
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    overlay.style.display = "none";
    confirmDialog.style.display = "none";

    confirmButton.removeEventListener("click", confirmDeletion);
    cancelButton.removeEventListener("click", onCancel);
  };

  const onCancel = () => {
    overlay.style.display = "none";
    confirmDialog.style.display = "none";

    confirmButton.removeEventListener("click", confirmDeletion);
    cancelButton.removeEventListener("click", onCancel);
  };

  confirmButton.addEventListener("click", confirmDeletion);
  cancelButton.addEventListener("click", onCancel);
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}
const searchBook = () => {
  const searchInput = document.getElementById("pencarian").value.toLowerCase();
  const bookItems = document.querySelectorAll(".item");

  for (const bookItem of bookItems) {
    const titleText = bookItem.querySelector("h2").innerText.toLowerCase();
    const isTitleMatch = titleText.includes(searchInput);
    bookItem.classList.toggle("hidden", !isTitleMatch);
  }
};
