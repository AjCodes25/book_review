const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user. Username and password required." });
});

// Task 1 & Task 10: Get the book list available in the shop using async-await / Promise
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject(new Error("Unable to fetch books"));
    }
  });

  getBooks.then((bookList) => {
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  }).catch((err) => {
    return res.status(500).json({ message: "Error fetching book list", error: err.message });
  });
});

// Task 2 & Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});
  
// Task 3 & Task 12: Get book details based on author using Promises / async-await
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    let booksByAuthor = [];
    let keys = Object.keys(books);
    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        booksByAuthor.push(books[key]);
      }
    });

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject({ status: 404, message: "No books found by this author" });
    }
  });

  getBooksByAuthor
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Task 4 & Task 13: Get all books based on title using Promises / async-await
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    let booksByTitle = [];
    let keys = Object.keys(books);
    keys.forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        booksByTitle.push(books[key]);
      }
    });

    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject({ status: 404, message: "No books found with this title" });
    }
  });

  getBooksByTitle
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// ============================================================================
// Methods using Axios with Async/Await or Promises (Tasks 10 - 13)
// ============================================================================

// Task 10: Getting the list of books available in the shop using async/await with Axios
const getBookListAxios = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error.message);
    throw error;
  }
};

// Task 11: Getting the book details based on ISBN using Promise callbacks with Axios
const getBookByISBNAxios = (isbn) => {
  return axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
      throw error;
    });
};

// Task 12: Getting the book details based on Author using async/await with Axios
const getBooksByAuthorAxios = async (author) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error.message);
    throw error;
  }
};

// Task 13: Getting the book details based on Title using async/await with Axios
const getBooksByTitleAxios = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by title ${title}:`, error.message);
    throw error;
  }
};

module.exports.general = public_users;
module.exports.getBookListAxios = getBookListAxios;
module.exports.getBookByISBNAxios = getBookByISBNAxios;
module.exports.getBooksByAuthorAxios = getBooksByAuthorAxios;
module.exports.getBooksByTitleAxios = getBooksByTitleAxios;
