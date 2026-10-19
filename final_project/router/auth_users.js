const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Checks if a given username already exists in the registered users list.
 * @param {string} username - Username to validate.
 * @returns {boolean} True if username already exists, false otherwise.
 */
const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
};

/**
 * Verifies if the provided username and password match any registered user.
 * @param {string} username - The username credential.
 * @param {string} password - The password credential.
 * @returns {boolean} True if credentials match, false otherwise.
 */
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
};

/**
 * Route: POST /customer/login
 * Authenticates a registered user and establishes an authorized session with JWT.
 */
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in: username and password required" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT Access Token valid for 1 hour
        let accessToken = jwt.sign({
            data: password,
            username: username
        }, 'access', { expiresIn: 60 * 60 });

        // Save session authorization with token and username
        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).json({ message: "Customer successfully logged in" });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

/**
 * Route: PUT /customer/auth/review/:isbn
 * Adds a new review or modifies an existing review for a specified book.
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review || req.body.review;
    const username = (req.session && req.session.authorization && req.session.authorization.username) 
        ? req.session.authorization.username 
        : (req.user ? req.user.username : null);

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    if (books[isbn]) {
        let book = books[isbn];
        book.reviews[username] = review;
        return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.\nReviews: ${JSON.stringify(book.reviews)}`);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

/**
 * Route: DELETE /customer/auth/review/:isbn
 * Deletes the current user's review for a specified book.
 */
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = (req.session && req.session.authorization && req.session.authorization.username) 
        ? req.session.authorization.username 
        : (req.user ? req.user.username : null);

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (books[isbn]) {
        let book = books[isbn];
        if (book.reviews && book.reviews[username]) {
            delete book.reviews[username];
            return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
        } else {
            return res.status(404).json({ message: `No review found for user ${username} on book with ISBN ${isbn}` });
        }
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
