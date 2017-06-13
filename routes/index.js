'use strict'

const express = require('express')
const eventCtrl = require('../controllers/event')
const tagCtrl = require('../controllers/tag')
const userCtrl = require('../controllers/user')
const auth = require('../middlewares/auth')
const api = express.Router()

let multer = require('multer')
let upload = multer()

api.get('/eventmessages', eventCtrl.getEventmessages)
api.post('/eventmessages', upload.fields([]), auth.isAuth, eventCtrl.saveEventmessage)
api.delete('/eventmessages/:commentId', upload.fields([]), auth.canEditTheComment, eventCtrl.deleteEventmessage)

api.get('/event', eventCtrl.getEvents)
api.get('/event/:eventId', eventCtrl.getEvent)
api.post('/event', upload.fields([]), auth.isAuth, eventCtrl.saveEvent)
api.put('/event/:eventId', upload.fields([]), auth.canEditTheEvent, eventCtrl.updateEvent)
api.delete('/event/:eventId', auth.canEditTheEvent, eventCtrl.deleteEvent)
api.post('/eventsFiltered', upload.fields([]), eventCtrl.getEventsFiltered)

api.get('/user', userCtrl.getUsers)
api.get('/user/:userId', userCtrl.getUser)
api.put('/user/edit/:userId', upload.fields([]), auth.canEditTheUser, userCtrl.updateUser)
api.get('/user/nick/:nickname', userCtrl.checkNickname)
api.get('/user/email/:email', userCtrl.checkEmail)

api.get('/tag', tagCtrl.getTags)
api.get('/tag/:tagId', tagCtrl.getTag)

api.get('/userjoined', eventCtrl.getUserjoined)
api.post('/userjoined/', upload.fields([]), eventCtrl.saveUserjoined)
api.delete('/userjoined/', upload.fields([]), eventCtrl.deleteUserjoined)
api.get('/eventsbyuser/:userId', eventCtrl.getEventsByUser)
api.get('/usersbyevent/:eventId', userCtrl.getUsersByEvent)

api.post('/signup', upload.fields([]), userCtrl.signUp)
api.post('/signin', upload.fields([]), userCtrl.signIn)

api.get('/private', auth.isAuth, (req, res) => {
  res.status(200).send({message: 'Tienes acceso'})
})

api.get('/admin', auth.isAdmin, (req, res) => {
  res.status(200).send({message: 'Tienes acceso'})
})

module.exports = api
