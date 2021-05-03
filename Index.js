// Initialize All Library
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

// Initialize Body Parser
app.use(express.json())

// Import Router
const userRouter = require('./Routers/UserRouter')

// Initialize PORT
const PORT = 5000

// Route
app.get('/', (req, res) => {
    res.status(200).send(
        '<h1> Exam API </h1>'
    )
})

app.use('/user', userRouter)

app.listen(PORT, ()=> console.log('API Running On PORT ' + PORT))