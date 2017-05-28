'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventmessageSchema = Schema({
  content: String,
  dateCreated: { type: Date, default: Date.now() },
  user: { type: Schema.Types.ObjectId, ref: 'User', default: '5925957c62561434d9fd18e2'},
  event: { type: Schema.Types.ObjectId, ref: 'Event', default: '5918e9d60631a221f0da739d'}
})

module.exports = mongoose.model('Eventmessage', EventmessageSchema)
