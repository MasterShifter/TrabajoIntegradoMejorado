'use strict'

const services = require('../services')
const User = require('../models/user')
const Event = require('../models/event')

function isAuth (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: 'No tienes autorización' })
  }

  const token = req.headers.authorization.split(' ')[1]

  var decode = services.decodeToken(token)

  decode.then(response => {
    req.user = response
    next()
  })
  .catch(response => {
    res.status(response.status)
  })
}

function isAdmin (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: 'No tienes autorización administrativa' })
  }

  const token = req.headers.authorization.split(' ')[1]

  var decode = services.decodeToken(token)

  decode.then(response => {
    req.user = response
    User.findById(req.user, (err, user) => {
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      if (!user) return res.status(404).send({message: `El usuario no existe`})

      User.populate(user, {path: "role"},function(err, user){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        if (user.role.name == "Administrador"){
          next()
        } else {
          return res.status(404).send({message: `El usuario no es admin`})
        }
      });
    })
  })
  .catch(response => {
    res.status(response.status)
  })
}


function canEditTheUser (req, res, next) {
  let userId = req.params.userId

  if (!req.headers.authorization) {
    return res.status(403).send({ message: 'No tienes autorización administrativa' })
  }

  const token = req.headers.authorization.split(' ')[1]

  var decode = services.decodeToken(token)
  decode.then(response => {
    req.user = response
    User.findById(req.user, (err, user) => {
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      if (!user) return res.status(404).send({message: `El usuario no existe`})

      User.populate(user, {path: "role"},function(err, user){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})

        if (user.role.name == "Administrador" || user._id.equals(userId)){
          next()
        } else {
          return res.status(404).send({message: `El usuario no es admin ni el mismo usuario`})
        }
      });
    })
  })
  .catch(response => {
    res.status(response.status)
  })
}



function canEditTheEvent (req, res, next) {
  let eventId = req.params.eventId

  if (!req.headers.authorization) {
    return res.status(403).send({ message: 'No tienes autorización administrativa' })
  }

  const token = req.headers.authorization.split(' ')[1]

  var decode = services.decodeToken(token)
  decode.then(response => {
    req.user = response
    console.log("usuario de la peticion: "+req.user)
    User.findById(req.user, (err, user) => {
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      if (!user) return res.status(404).send({message: `El usuario no existe`})

      User.populate(user, {path: "role"},function(err, user){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})

          console.log("usuario de la peticion obtenido: "+user.nickname+" "+user.role.name)
        Event.findById(eventId, (err, event) => {
          if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
          if (!event) return res.status(404).send({message: `El evento no existe`})
              console.log("usuario del evento: "+event.user)
          if (user.role.name == "Administrador" || user._id.equals(event.user)){
            next()
          } else {
            return res.status(404).send({message: `El usuario no es admin ni el creador del evento`})
          }
        });
      });
    })
  })
  .catch(response => {
    res.status(response.status)
  })
}

module.exports = {
  isAuth,
  isAdmin,
  canEditTheUser,
  canEditTheEvent
}
