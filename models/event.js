'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = Schema({
  name: String,
  picture: String,
  date: { type: Date, default: Date.now() },
  dateCreated: { type: Date, default: Date.now() },
  category: { type: String, enum: ['salir', 'aficiones', 'grupos'] },
  description: String
})

module.exports = mongoose.model('Event', EventSchema)
