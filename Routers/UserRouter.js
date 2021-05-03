const express = require('express')
const Router = express.Router()

// Import Controller
const userController = require('./../Controllers/UserController')

Router.post('/register', userController.register)
Router.post('/login', userController.login)

module.exports = Router