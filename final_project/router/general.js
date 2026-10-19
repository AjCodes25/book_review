const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * Register a new user in the system.
 * Validates that username and password are provided and that the username does not already exist.
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Unable to register user. Both username and password are required." });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ============================================================================
// TASK 1 & TASK 10: Get the list of all books available in the shop
// Implemented using async/await with Axios and Promise callback patterns
// ============================================================================

/**
 * Helper function to retrieve all books asynchronously using a Promise.
 * Simulates asynchronous data fetching or calls the books database.
 * @returns {Promise<Object>} Resolves with the books collection.
 */
const fetchAllBooks = () => {
  return new Promise((resolve, reject) => {
    try {
      if (books) {
        resolve(books);
      } else {
        reject(new Error("No books available in the database"));
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Route: GET /
 * Retrieves the complete list of available books.
 * Uses async/await with asynchronous Promise resolution.
 */
public_users.get('/', async function (req, res) {
  try {
    const bookList = await fetchAllBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ 
      message: "Error retrieving the list of books", 
      error: error.message 
    });
  }
});

// ============================================================================
// TASK 2 & TASK 11: Get book details based on ISBN
// Implemented using Promise callbacks with Axios / asynchronous patterns
// ============================================================================

/**
 * Helper function to fetch book details by ISBN using a Promise.
 * @param {string|number} isbn - The ISBN identifier of the book.
 * @returns {Promise<Object>} Resolves with book details or rejects with 404.
 */
const fetchBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
    }
  });
};

/**
 * Route: GET /isbn/:isbn
 * Retrieves book details by ISBN using Promise callbacks (.then / .catch).
 */
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  fetchBookByISBN(isbn)
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((error) => {
      const statusCode = error.status || 500;
      return res.status(statusCode).json({ message: error.message });
    });
});

// ============================================================================
// TASK 3 & TASK 12: Get book details based on Author
// Implemented using async/await with Promise-based asynchronous filtering
// ============================================================================

/**
 * Helper function to filter books by author name asynchronously.
 * Performs case-insensitive matching across all available book records.
 * @param {string} author - The author name to search for.
 * @returns {Promise<Array>} Resolves with an array of matching books.
 */
const fetchBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const normalizedAuthor = author.trim().toLowerCase();
    const matchingBooks = [];
    const keys = Object.keys(books);

    keys.forEach((key) => {
      if (books[key].author && books[key].author.toLowerCase() === normalizedAuthor) {
        matchingBooks.push(books[key]);
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ status: 404, message: `No books found for author: ${author}` });
    }
  });
};

/**
 * Route: GET /author/:author
 * Retrieves books written by a specific author using async/await.
 */
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const results = await fetchBooksByAuthor(author);
    return res.status(200).json(results);
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({ message: error.message });
  }
});

// ============================================================================
// TASK 4 & TASK 13: Get all books based on Title
// Implemented using async/await with Promise-based asynchronous filtering
// ============================================================================

/**
 * Helper function to filter books by title asynchronously.
 * Performs case-insensitive matching across all available book records.
 * @param {string} title - The title of the book to search for.
 * @returns {Promise<Array>} Resolves with an array of matching books.
 */
const fetchBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const normalizedTitle = title.trim().toLowerCase();
    const matchingBooks = [];
    const keys = Object.keys(books);

    keys.forEach((key) => {
      if (books[key].title && books[key].title.toLowerCase() === normalizedTitle) {
        matchingBooks.push(books[key]);
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ status: 404, message: `No books found with title: ${title}` });
    }
  });
};

/**
 * Route: GET /title/:title
 * Retrieves books by title using async/await.
 */
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const results = await fetchBooksByTitle(title);
    return res.status(200).json(results);
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({ message: error.message });
  }
});

// ============================================================================
// TASK 5: Get book review based on ISBN
// ============================================================================

/**
 * Route: GET /review/:isbn
 * Retrieves reviews for a specific book by its ISBN.
 */
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// ============================================================================
// AXIOS CLIENT IMPLEMENTATIONS (Tasks 10 - 13)
// Explicit async/await and Promise implementations using Axios HTTP library
// ============================================================================

const BASE_URL = 'http://localhost:5000';

/**
 * Task 10: Retrieve all books using Axios with Async/Await.
 * Sends an HTTP GET request to the root endpoint.
 * @returns {Promise<Object>} The response data containing all books.
 */
const getBookListWithAxios = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Axios error in getBookListWithAxios:", error.message);
    throw error;
  }
};

/**
 * Task 11: Retrieve book details by ISBN using Axios with Promise callbacks (.then / .catch).
 * @param {string|number} isbn - ISBN of the book.
 * @returns {Promise<Object>} The book details.
 */
const getBookByISBNWithAxios = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Axios error in getBookByISBNWithAxios for ISBN ${isbn}:`, error.message);
      throw error;
    });
};

/**
 * Task 12: Retrieve book details by Author using Axios with Async/Await.
 * @param {string} author - Author name to search.
 * @returns {Promise<Array>} List of books by the specified author.
 */
const getBooksByAuthorWithAxios = async (author) => {
  try {
    const encodedAuthor = encodeURIComponent(author);
    const response = await axios.get(`${BASE_URL}/author/${encodedAuthor}`);
    return response.data;
  } catch (error) {
    console.error(`Axios error in getBooksByAuthorWithAxios for author ${author}:`, error.message);
    throw error;
  }
};

/**
 * Task 13: Retrieve book details by Title using Axios with Async/Await.
 * @param {string} title - Title to search.
 * @returns {Promise<Array>} List of books matching the title.
 */
const getBooksByTitleWithAxios = async (title) => {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await axios.get(`${BASE_URL}/title/${encodedTitle}`);
    return response.data;
  } catch (error) {
    console.error(`Axios error in getBooksByTitleWithAxios for title ${title}:`, error.message);
    throw error;
  }
};

module.exports.general = public_users;
module.exports.getBookListWithAxios = getBookListWithAxios;
module.exports.getBookByISBNWithAxios = getBookByISBNWithAxios;
module.exports.getBooksByAuthorWithAxios = getBooksByAuthorWithAxios;
module.exports.getBooksByTitleWithAxios = getBooksByTitleWithAxios;
