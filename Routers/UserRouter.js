const express = require('express')
const Router = express.Router()

// Import Controller
const userController = require('./../Controllers/UserController')

// Import JWTVerify
const JWTVerify = require('./../Middleware/JWTVerify')

Router.post('/register', userController.register)
Router.post('/login', userController.login)
Router.patch('/deactive', JWTVerify, userController.deactive)
Router.get('/search', userController.searchData)

module.exports = Router