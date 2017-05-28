'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('express-handlebars')
const app = express()
const api = require('./routes')
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
app.get('/login', upload.fields([]), (req, res) => {
  res.render('login')
})
app.get('/register', upload.fields([]), (req, res) => {
  res.render('register')
})
app.get('/', (req, res) => {
  res.render('events')
})

app.get('/event', (req, res) => {
  res.render('event')
})

app.get('/newEvent', (req, res) => {
  res.render('newEvent')
})

module.exports = app
