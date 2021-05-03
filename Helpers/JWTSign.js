const jwt = require('jsonwebtoken')

// Import .env
require('dotenv').config()

const jwtSign = (data) => {
    return jwt.sign({uid: data[0].uid, role: data[0].role}, process.env.JWT_SECRETKEY)
}

module.exports = jwtSign