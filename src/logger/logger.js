const express = require('express');
const router = express.Router();
const BookController= require("../Controller/bookController")
const UserController= require("../Controller/userController")
const Authentication = require("../middleWare/auth")

//First API -: To register a user by POST method
router.post("/register", UserController.createUser)

//Second API -: To login a user by POST method
router.post("/login" , UserController.loginUser)

//Third API-: To create a book for a user by POST method
router.post("/books" ,Authentication.authentication, BookController.createBook)

//Fourth API -: 
router.get("/books" , Authentication.authentication , BookController.viewYourBooks)

//Fifth API -: 
router.get("/book" , Authentication.authentication , BookController.viewAllBooks)

module.exports = router;