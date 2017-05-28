'use strict'

const mongoose = require('mongoose')
const User = require('../models/user')
const service = require('../services')
const bcrypt = require('bcrypt-nodejs')

function signUp(req, res){
  const user = new User({
    email: req.body.email,
    nickname: req.body.nickname,
    displayName: req.body.displayName,
    password: req.body.password,
    birthdate: req.body.birthdate
  })

  user.save((err) => {
    if (err) return res.status(500).send({message: `Error al crear el usuario ${err}`})

    var skaos = service.createToken(user)
    return res.status(200).send({ token: service.createToken(user) })
  })
}


function signIn(req, res){
  let formData = req.body

  User.find({email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send({message: `Error al loguear el usuario ${err}`})
    if (!user || user.length === 0) return res.status(404).send({message: `Usuario o contraseña incorrecta ${req.body.email}`})

    req.user = user[0]

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
    });
  })
}

function getUsers (req, res){
  User.find({}, (err, users) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!users) return res.status(404).send({message: `No existen usuarios`})

    User.populate(users, {path: "role"},function(err, users){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        res.status(200).send({ users })
    });
  })
}



module.exports = {
  signUp,
  signIn,
  getUser,
  getUsers
}
