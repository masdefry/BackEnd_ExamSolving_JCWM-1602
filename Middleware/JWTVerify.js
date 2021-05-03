const jwt = require('jsonwebtoken')

require('dotenv').config()

const jwtVerify = (req, res, next) => {
    const token = req.body.token

    if(!token) return res.status(406).send({ error: true, detail: 'Error Token', message: 'Token Not Found' })

    jwt.verify(token, process.env.JWT_SECRETKEY, (err, dataToken) => {
        try {
            if(err) throw err

            req.dataToken = dataToken
            next()
        } catch (error) {
            res.status(500).send({
                error: true,
                detail: 'Error Server',
                message: error.message
            })
        }
    })
}

module.exports = jwtVerify