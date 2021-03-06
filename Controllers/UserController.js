// Import Library
const util = require('util')
const validator = require('validator')
const jwt = require('jsonwebtoken')

// Import Connection
const db = require('./../Connection/Connection')
const query = util.promisify(db.query).bind(db)

// Import Password Validator
const passwordValidator = require('./../Helpers/PasswordValidator')

// Import Hash Password
const hashPassword = require('./../Helpers/Hash')

// Import JWTSign
const jwtSign = require('./../Helpers/JWTSign')

const register = async(req, res) => {
    const data = req.body

    let query1 = 'SELECT * FROM users WHERE email = ?'
    let query2 = 'INSERT INTO users SET ?'
    let query3 = 'SELECT * FROM users WHERE id = ?'
    try {
        if(!data.username || !data.email || !data.password) throw { status: 406, detail: 'Error Validation', message: 'Data Can\'t Null' }
        if(data.username.length < 6 || data.password.length < 6) throw { status: 406, detail: 'Error Validation', message: 'Username / Password Contains Minimum 6 Characters' }
        if(!(validator.isEmail(data.email))) throw { status: 406, detail: 'Error Validation', message: 'Email Invalid' }
        if(passwordValidator(data.password) === false) throw { status: 406, detail: 'Error Validation', message: 'Password Mus\'t Contains A Number Or Special Character' }

        await query('Start Transaction')

        const emailExist = await query(query1, data.email)
        .catch((error) => {
            error.status = 500
            error.detail = 'Error Server'
            throw error
        })

        if(emailExist.length >= 1){
            return res.status(200).send({
                error: true,
                detail: 'Error Validation',
                message: 'Email Already Exist'
            })
        }

        // Hash Password
        data.password = hashPassword(data.password)

        let dataToSend = {
            uid: Date.now(),
            ...data
        }
        
        const insertData = await query(query2, dataToSend)
        .catch((error) => {
            error.status = 500
            error.detail = 'Error Server'
            throw error
        })

        const getDataUser = await query(query3, insertData.insertId)
        .catch((error) => {
            error.status = 500
            error.detail = 'Error Server'
            throw error
        })

        const token = jwtSign(getDataUser)
        
        await query('Commit')
        res.status(200).send({
            error: false,
            detail: 'Register Success',
            data: {
                id: getDataUser[0].id,
                uid: getDataUser[0].uid,
                username: getDataUser[0].username,
                email: getDataUser[0].email,
                token: token
            }
        })
    } catch (error) {
        console.log(error)
        res.status(error.status).send({
            error: true,
            detail: error.detail,
            message: error.message
        })
    }
}

const login = (req, res) => {
    const data = req.body

    try {
        if(!data.usernameEmail || !data.password) throw { message: 'Data Can\'t Null' }
        let isEmail = validator.isEmail(data.usernameEmail)
        // Hash Password
        data.password = hashPassword(data.password)

        let query = ''
        if(isEmail){
            query = 'SELECT * FROM users WHERE email = ? AND password = ?'
        }else{
            query = 'SELECT * FROM users WHERE username = ? AND password = ?'
        }

        db.query(query + ' AND status = 1', [data.usernameEmail, data.password], (err, result) => {
            try {
                if(err) throw err

                if(result.length === 0){
                    return res.status(200).send({
                        error: true,
                        detail: 'Login Failed',
                        message: 'Username / Email & Password Not Found'
                    })
                }
                jwt.sign({uid: result[0].uid, role: result[0].role}, process.env.JWT_SECRETKEY, (err, token) => {
                    try {
                        if(err) throw (err)
                        
                        res.status(200).send({
                            error: false,
                            detail: 'Login Success',
                            data: {
                                id: result[0].id,
                                uid: result[0].uid,
                                username: result[0].username,
                                email: result[0].email,
                                token: token
                            }
                        })
                    } catch (error) {
                        return res.status(500).send({
                            error: true,
                            detail: 'Error Server',
                            message: 'Error Generate Token'
                        })
                    }
                })
            } catch (error) {
                res.status(500).send({
                    error: true,
                    detail: 'Error Server',
                    message: error.message
                })
            }
        })
    } catch (error) {
        res.status(406).send({
            error: true,
            detail: 'Error Validation',
            message: error.message
        })
    }
}

const deactive = (req, res) => {
    const data = req.dataToken

    db.query('SELECT * FROM users WHERE uid = ? AND status = 1', data.uid, (err, result) => {
        try {
            if(err) throw err

            if(result.length === 0) return res.status(200).send({error: true, detail: 'Error When Deactive Account', message: 'Your Account Already Deactive Or Closed'})
            
            db.query('UPDATE users SET status = 2 WHERE uid = ?', data.uid, (err, result) => {
                try {
                    if(err) throw err

                    db.query('SELECT u.uid, s.status FROM users u JOIN status s ON s.id = u.status WHERE uid = ?;', data.uid, (err, result) => {
                        try {
                            if(err) throw err

                            res.status(200).send({
                                error: false,
                                detail: 'Deactive Succes',
                                data: {
                                    uid: result[0].uid,
                                    status: result[0].status
                                }
                            })
                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                detail: 'Error Server',
                                message: error.message
                            })
                        }
                    })
                } catch (error) {
                    res.status(500).send({
                        error: true,
                        detail: 'Error Server',
                        message: error.message
                    })
                }
            })
        } catch (error) {
            res.status(500).send({
                error: true,
                detail: 'Error Server',
                message: error.message
            })
        }
    })
}

const searchData = (req, res) => {
    let data = req.query

    try {
        
        let mainQuery = `SELECT name, release_date, release_month, release_year, duration_min, genre, description, ms.status, l.location, st.time FROM movies m JOIN
        movie_status ms ON ms.id = m.status JOIN
        schedules s ON s.movie_id = m.id JOIN
        locations l ON l.id = s.location_id JOIN
        show_times st ON st.id = s.time_id WHERE ms.status != 'has shown'`

        if(data.status){
            var status = data.status.replace('%', ' ')
            mainQuery += ` AND ms.status = "${status}" `
        }
        if(data.time){
            var time = data.time.replace('%', ' ')
            mainQuery += ` AND st.time = "${time}" `
        }
        if(data.location){
            var location = data.location
            mainQuery += ` AND l.location = "${location}" `
        }

        db.query(mainQuery, (err, result) => {
            try {
                if(err) throw err

                res.status(200).send({
                    error: false,
                    detail: 'Search Success',
                    data: result
                })
            } catch (error) {
                console.log(error)
            }
        })
    } catch (error) {
        res.status(406).send({
            error: true,
            detail: 'Error Validation',
            message: error.message
        })
    }
}

module.exports = {
    register: register,
    login: login,
    deactive: deactive,
    searchData: searchData
}

// Join Table 2.1
// SELECT name, release_date, release_month, release_year, duration_min, genre, description, ms.status, l.location, st.time FROM movies m JOIN
// movie_status ms ON ms.id = m.status JOIN
// schedules s ON s.movie_id = m.id JOIN
// locations l ON l.id = s.location_id JOIN
// show_times st ON st.id = s.time_id;