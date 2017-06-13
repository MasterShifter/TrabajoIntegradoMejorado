'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('express-handlebars')
const app = express()
const api = require('./routes')
const userCtrl = require('./controllers/user')
const eventCtrl = require('./controllers/event')
const auth = require('./middlewares/auth')
var path = require('path')

let multer = require('multer');
let upload = multer();

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use("/public", express.static(path.join(__dirname, 'public')))

app.engine('.hbs', hbs({
  defaultLayout: 'default',
  extname: '.hbs'
}))
app.set('view engine', '.hbs')



app.use('/api', api)

//Home
app.get('/', eventCtrl.showHome)

//About
app.get('/about', (req, res) => {
  res.render('about')
})

//Login screen
app.get('/login', upload.fields([]), (req, res) => {
  res.render('login')
})

//Register screen
app.get('/register', upload.fields([]), (req, res) => {
  res.render('register')
})

//Edit profile
app.get('/edituser/:userId', userCtrl.editScreen)

//Show event
app.get('/event/:eventId', eventCtrl.showEvent)

//Edit event
app.get('/editevent/:eventId', eventCtrl.editScreen)

//Delete event
app.get('/deleteevent/:eventId', eventCtrl.deleteScreen)

//Show events
app.get('/events', eventCtrl.showEvents)

//Create new event
app.get('/newevent', (req, res) => {
  res.render('newevent')
})

//Show user list
app.get('/users', (req, res) => {
  res.render('users')
})

//Show profile
app.get('/user/:userNick', userCtrl.profileByNick)

//Edit profile
app.get('/edituser/:userId', userCtrl.editScreen)

module.exports = app
