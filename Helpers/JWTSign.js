const jwt = require('jsonwebtoken')

// Import .env
require('dotenv').config()

const jwtSign = (data) => {
    jwt.sign({uid: data[0].uid, role: data[0].role}, process.env.JWT_SECRETKEY, (err, token) => {
        try {
            if(err) throw (err)
            
            return token
        } catch (error) {
            return res.status(500).send({
                error: true,
                detail: 'Error Server',
                message: 'Error Generate Token'
            })
        }
    })
}

module.exports = jwtSign