'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = Schema({
  name: String, default: "",
  picture: String, default: "/public/img/blank-picture.png",
  date: { type: Date, default: Date.now() },
  dateCreated: { type: Date, default: Date.now() },
  tag: { type: Schema.Types.ObjectId, ref: 'Tag' },
  user: { type: Schema.Types.ObjectId, ref: 'User'},
  description: String, default: "",
  eventmessage: [ {type : Schema.Types.ObjectId, ref : 'Eventmessage'} ],
  userjoined: [ {type : Schema.Types.ObjectId, ref : 'Userjoined'} ]
})

module.exports = mongoose.model('Event', EventSchema)
