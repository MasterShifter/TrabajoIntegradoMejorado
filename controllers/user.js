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

  var errorsList = userValidator(user)
  if (errorsList.length > 0) return res.status(500).send({message: errorsList})


  User.findOne({nickname: user.nickname}, '-_id nickname', (err, userCoincidence) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (userCoincidence != null)
    return res.status(200).send({message: `Apodo ya en uso`})

    User.findOne({email: user.email}, '-_id email', (err, userCoincidence) => {
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      if (userCoincidence != null)
      return res.status(200).send({message: `Email ya en uso`})

      user.save((err, userCreated) => {
        if (err) return res.status(500).send({message: `Error al crear el usuario ${err}`})
        var skaos = service.createToken(user)

        return res.status(200).send({ message: 'LOGGUED', token: service.createToken(user), id: userCreated._id })
      })
    })
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

  User.findById(userId, '-password', (err, user) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!user) return res.status(404).send({message: `El usuario no existe`})

    User.populate(user, {path: "role"},function(err, user){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      res.status(200).send({ user })
    })
  })
}


function getUsers (req, res){
  User.find({}, '-password', (err, users) => {
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

  var errorsList = userValidatorUpdate(update)
  if (errorsList.length > 0) return res.status(500).send({message: errorsList})

  User.findById(userId, '-_id nickname email', (err, oldUser) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!oldUser) return res.status(404).send({message: `No existe el usuario a actualizar`})

    User.findOne({nickname: update.nickname}, '-_id nickname', (err, userCoincidence) => {
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      if (userCoincidence != null && !(oldUser.nickname === update.nickname))
      return res.status(200).send({message: `Apodo ya en uso`})

      User.findOne({email: update.email}, '-_id email', (err, userCoincidence) => {
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        if (userCoincidence != null && !(oldUser.email === update.email))
        return res.status(200).send({message: `Email ya en uso`})

        User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
          if (err) return res.status(500).send({message: `Error al actualizar en la base de datos: ${err}`})

          res.status(200).send({user: userUpdated})
        })
      })
    })
  })

}

function getUsersByEvent (req, res){
  var eventId = req.params.eventId

  Userjoined.find({event: eventId}, '-password', (err, userjoined) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!userjoined) return res.status(404).send({message: `No existen apuntados`})

    Userjoined.populate(userjoined, {path: 'user', select: 'nickname displayName avatar'},function(err, userjoined){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      Userjoined.populate(userjoined, {path: 'event', select: 'name'},function(err, userjoined){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        res.status(200).send({ userjoined })
      });
    });
  })
}


function userValidator(user){
  var errorsList = new Array()

  if (user.nickname == null || user.displayName == null || user.email == null || user.birthdate == null || user.password == null || user.genre == null){
    errorsList.push('Faltan campos necesarios')
    return errorsList
  }

  if (user.nickname === "" || user.displayName === "" || user.email === "" || user.birthdate === "" || user.password === "" || user.genre === ""){
    errorsList.push('Faltan campos necesarios')
    return errorsList
  }

  if (user.nickname.length > 20){
    errorsList.push('El apodo excede de los 20 carácteres')
  }

  if (user.displayName.length > 45){
    errorsList.push('El nombre excede de los 45 carácteres')
  }

  if (!(/^([A-Za-z0-9_])\w+$/.test(user.nickname))){
    errorsList.push('El apodo no cumple el formato indicado')
  }

  if (!(/^([a-zA-Záéíóúñm,-]+[ ]*)+$/.test(user.displayName))){
    errorsList.push('El nombre no cumple el formato indicado')
  }

  if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(user.email))){
    errorsList.push('El email no cumple el formato indicado')
  }

  if (user.email.length > 50){
    errorsList.push('El email excede de los 50 carácteres')
  }

  var birthdate = new Date(user.birthdate);
  var cur = new Date();
  var diff = cur-birthdate; // This is the difference in milliseconds
  var age = Math.floor(diff/31557600000); // Divide by 1000*60*60*24*365.25

  if (age < 18){
    errorsList.push('El usuario es menor de edad')
  }

  if (user.password.length < 4){
    errorsList.push('La contraseña debe tener al menos 4 carácteres')
  } else if (user.password.length > 50){
    errorsList.push('La contraseña no puede pasar de 50 carácteres')
  }

  if (!(user.genre === 'Hombre') && !(user.genre === 'Mujer') && !(user.genre === 'No especificado')){
    errorsList.push('Género no válido')
  }

  return errorsList
}


function userValidatorUpdate(user){
  var errorsList = new Array()

  if (user.nickname == null || user.displayName == null || user.email == null || user.birthdate == null || user.genre == null){
    errorsList.push('Faltan campos necesarios')
    return errorsList
  }

  if (user.nickname === "" || user.displayName === "" || user.email === "" || user.birthdate === "" || user.genre === ""){
    errorsList.push('Faltan campos necesarios')
    return errorsList
  }

  if (user.nickname.length > 20)
  errorsList.push('El apodo excede de los 20 carácteres')

  if (user.displayName.length > 45)
  errorsList.push('El nombre excede de los 45 carácteres')

  if (user.email.length > 50)
  errorsList.push('El email excede de los 50 carácteres')

  if (!(/^([A-Za-z0-9_])\w+$/.test(user.nickname))){
    errorsList.push('El apodo no cumple el formato indicado')
  }

  if (!(/^([a-zA-Záéíóúñm,-]+[ ]*)+$/.test(user.displayName))){
    errorsList.push('El nombre no cumple el formato indicado')
  }

  if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(user.email))){
    errorsList.push('El email no cumple el formato indicado')
  }

  var birthdate = new Date(user.birthdate);
  var cur = new Date();
  var diff = cur-birthdate; // This is the difference in milliseconds
  var age = Math.floor(diff/31557600000); // Divide by 1000*60*60*24*365.25
  if (age < 18)
  errorsList.push('El usuario es menor de edad')

  if (!(user.genre === 'Hombre') && !(user.genre === 'Mujer') && !(user.genre === 'No especificado'))
  errorsList.push('Género no válido')

  if (user.avatar != null && user.avatar.length > 100)
  errorsList.push('El avatar excede de los 100 carácteres')

  if (user.description != null && user.description.length > 500)
  errorsList.push('La descripción excede de los 500 carácteres')

  return errorsList
}


function checkNickname (req, res){
  let  nickname = req.params.nickname

  User.findOne({nickname: nickname}, '-_id nickname', (err, user) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!user) return res.status(200).send({message: `No`})
    res.status(200).send({message: `Yes`})
  })
}

function checkEmail (req, res){
  let  email = req.params.email

  User.findOne({email: email}, '-_id email', (err, user) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!user) return res.status(200).send({message: `No`})
    res.status(200).send({message: `Yes`})
  })
}

/* VIEWS--------------------------------------------------------------------------------------------------------------------- */

function profileByNick (req, res){
  let  userNick = req.params.userNick

  User.findOne({nickname: userNick}, '-password', (err, user) => {
    if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
    if (!user) return res.render('error', {message: 'No existe el usuario especificado'})

    User.populate(user, {path: "role"},function(err, user){
      if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})

      res.render('user', {user: user})
    });
  })
}


function profileList (req, res){
  User.find({}, 'nickname displayName avatar genre birthdate -_id -password', (err, users) => {
    if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
    if (!users) return res.render('error', {message: 'No existe el usuario especificado'})

    User.populate(users, {path: "role"},function(err, users){
      if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
      res.render('users', {users: users})
    });
  })
}

function editScreen (req, res){
  let  userId = req.params.userId

  User.findById(userId, (err, user) => {
    if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
    if (!user) return res.render('error', {message: 'No existe el usuario especificado'})

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
  getUsersByEvent,
  checkNickname,
  checkEmail
}
