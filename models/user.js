'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')
const Role = require('./role')

const UserSchema = new Schema({
  email: { type: String, index: { unique: true }, lowercase: true },
  nickname: { type: String, index: { unique: true } },
  displayName: { type: String, index: { unique: false } },
  avatar: { type: String, default: "" },
  password: { type: String },
  birthdate: { type: Date },
  signUpDate: { type: Date, default: Date.now() },
  lastLogin: { type: Date, default: Date.now() },
  role: { type: Schema.Types.ObjectId, ref: 'Role', default: "59242f497a441778fcec423b" },
  genre: { type: String, enum : ['No especificado', 'Hombre', 'Mujer'], default: 'No especificado'},
  description: { type: String, default: "" }
})

UserSchema.pre('save', function (next) {
  let user = this
  if (!user.isModified('password')) return next()
  bcrypt.genSalt(10, (err, salt) =>{
    if (err) return next()
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err)
      
      user.password = hash

      if (!this.avatar){
        const md5 = crypto.createHash('md5').update(this.email).digest('hex')
        this.avatar = `https://gravatar.com/avatar/${md5}?s=200&d=retro`;
      }
      next()
    })
  })
})

module.exports = mongoose.model('User', UserSchema)
