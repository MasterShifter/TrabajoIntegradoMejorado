'use strict'

const express = require('express')
const eventCtrl = require('../controllers/event')
const tagCtrl = require('../controllers/tag')
const userCtrl = require('../controllers/user')
const auth = require('../middlewares/auth')
const api = express.Router()

let multer = require('multer');
let upload = multer();

api.get('/eventmessages', eventCtrl.getEventmessages)
api.post('/eventmessages', upload.fields([]), auth, eventCtrl.saveEventmessage)

api.get('/event', eventCtrl.getEvents)
api.get('/event/:eventId', eventCtrl.getEvent)
api.post('/event', upload.fields([]), auth, eventCtrl.saveEvent)
api.put('/event/:eventId', upload.fields([]), auth, eventCtrl.updateEvent)
api.delete('/event/:eventId', auth, eventCtrl.deleteEvent)

api.get('/user', userCtrl.getUsers)
api.get('/user/:userId', userCtrl.getUser)

api.get('/tag', tagCtrl.getTags)
api.get('/tag/:tagId', tagCtrl.getTag)

api.post('/signup', upload.fields([]), userCtrl.signUp)
api.post('/signin', upload.fields([]), userCtrl.signIn)

api.get('/private', auth, (req, res) => {
  res.status(200).send({message: 'Tienes acceso'})
})

module.exports = api
