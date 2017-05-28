'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoleSchema = Schema({
  name: String
})

module.exports = mongoose.model('Role', RoleSchema)
