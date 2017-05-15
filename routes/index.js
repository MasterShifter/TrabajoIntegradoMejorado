'use strict'

const express = require('express')
const eventCtrl = require('../controllers/event')
const userCtrl = require('../controllers/user')
const auth = require('../middlewares/auth')
const api = express.Router()

api.get('/event', eventCtrl.getEvents)
api.get('/event/:eventId', eventCtrl.getEvent)
api.post('/event', auth, eventCtrl.saveEvent)
api.put('/event/:eventId', auth, eventCtrl.updateEvent)
api.delete('/event/:eventId', auth, eventCtrl.deleteEvent)

api.post('/signup', userCtrl.signUp)
api.post('/signin', userCtrl.signIn)

api.get('/private', auth, (req, res) => {
  res.status(200).send({message: 'Tienes acceso'})
})

module.exports = api
