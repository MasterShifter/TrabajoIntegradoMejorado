'use strict'

const mongoose = require('mongoose')
const User = require('../models/user')
const service = require('../services')
const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')

const Userjoined = require('../models/userjoined')

function signUp(req, res){
  const user = new User({
    email: req.body.email,
    nickname: req.body.nickname,
    displayName: req.body.displayName,
    password: req.body.password,
    birthdate: req.body.birthdate,
    genre: req.body.genre
  })

  user.save((err) => {
    if (err) return res.status(500).send({message: `Error al crear el usuario ${err}`})

    var skaos = service.createToken(user)
    return res.status(200).send({ token: service.createToken(user) })
  })
}


function signIn(req, res){
  let formData = req.body

  User.findOne({email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send({message: `Error al loguear el usuario ${err}`})
    if (!user || user.length === 0) return res.status(404).send({message: `Usuario o contraseña incorrecta ${req.body.email}`})

    req.user = user

    bcrypt.compare(req.body.password, req.user.password, function(err, matches) {
      if (err) return res.status(404).send({message: `Error en la conexión ${req.body.email}`})
      else if (matches)  {
        res.status(200).send({
          message: 'LOGGUED',
          token: service.createToken(req.user),
          id: req.user._id
        })
      } else {
        return res.status(404).send({message: `Usuario o contraseña incorrecta ${req.body.email}`})
      }
    })
  })
}


function getUser (req, res){
  let  userId = req.params.userId

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!user) return res.status(404).send({message: `El usuario no existe`})

    User.populate(user, {path: "role"},function(err, user){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      res.status(200).send({ user })
    })
  })
}


function getUsers (req, res){
  User.find({}, '', (err, users) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!users) return res.status(404).send({message: `No existen usuarios`})

    User.populate(users, {path: "role"},function(err, users){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})

      res.status(200).send({ users })
    });
  })
}

function updateUser (req, res){
  let userId = req.params.userId
  let update = req.body

  if (req.body.avatar != null){
    if (req.body.avatar == ""){
      const md5 = crypto.createHash('md5').update(req.body.email).digest('hex')
      req.body.avatar = `https://gravatar.com/avatar/${md5}?s=200&d=retro`;
    }
  }

  User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
    if (err) res.status(500).send({message: `Error al actualizar en la base de datos: ${err}`})

    res.status(200).send({event: userUpdated})
  })
}

function getUsersByEvent (req, res){
  var eventId = req.params.eventId

  Userjoined.find({event: eventId}, (err, userjoined) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!userjoined) return res.status(404).send({message: `No existen apuntados`})

    Userjoined.populate(userjoined, {path: 'user', select: 'nickname avatar'},function(err, userjoined){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      Userjoined.populate(userjoined, {path: 'event', select: 'name'},function(err, userjoined){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        res.status(200).send({ userjoined })
      });
    });
  })
}




/* VIEWS--------------------------------------------------------------------------------------------------------------------- */

function profileByNick (req, res){
  let  userNick = req.params.userNick

  User.findOne({nickname: userNick}, '', (err, user) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!user) return res.status(404).send({message: `No existen usuarios`})

    User.populate(user, {path: "role"},function(err, user){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})

      res.render('user', {user: user})
    });
  })
}


function profileList (req, res){
  User.find({}, 'nickname displayName avatar genre birthdate -_id', (err, users) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!users) return res.status(404).send({message: `No existen usuarios`})

    User.populate(users, {path: "role"},function(err, users){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      res.render('users', {users: users})
    });
  })
}

function editScreen (req, res){
  console.log('HA ENTRADO AQUI')
  let  userId = req.params.userId

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!user) return res.status(404).send({message: `No existen usuarios`})

    res.render('edituser', {user: user})
  })
}







module.exports = {
  signUp,
  signIn,
  getUser,
  getUsers,
  updateUser,
  profileByNick,
  profileList,
  editScreen,
  getUsersByEvent
}
