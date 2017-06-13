'use strict'

const Event = require('../models/event')
const Eventmessage = require('../models/eventmessage')
const Userjoined = require('../models/userjoined')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

function getEvent (req, res){
  let  eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!event) return res.status(404).send({message: `El evento no existe 1`})

    Event.populate(event, {path: "user", select: 'nickname displayName avatar'},function(err, event){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      Event.populate(event, {path: "tag", select: 'name'},function(err, event){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        Eventmessage.find({event: event._id}, (err, eventmessage) => {
          if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
          if (!eventmessage) return res.status(404).send({message: `El evento no existe 2`})
          Eventmessage.populate(eventmessage, {path: "user", select: 'nickname avatar'},function(err, eventmessage){
            if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})

            event.eventmessage = eventmessage

            res.status(200).send({ event })
          })
        })
      })
    })
  })
}

function getEvents (req, res){
  Event.find({}, (err, events) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!events) return res.status(404).send({message: `No existen eventos`})

    Event.populate(events, {path: "tag", select: 'name'},function(err, events){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})

      Event.populate(events, {path: "user", select: 'nickname displayName avatar'},function(err, events){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        res.status(200).send({ events })
      })
    })
  })
}

function getEventsFiltered (req, res){
  let coincidence = req.body.coincidence
  let tag = req.body.tag.toString()
  let order = req.body.order
  let past = req.body.past
  let limit = req.body.limit

  var regex = new RegExp(coincidence, "i")
  var query = Event.find({name : regex})

  if (!(tag === 'cualquiera')){
    query.where('tag').equals(tag)
  }

  if (past === "true"){
    query.where('date').gt(Date.now())
  }

  if (order === 'created'){
    query.sort('dateCreated')
  } else {
    query.sort('date')
  }

  query.exec((err, events) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!events) return res.status(404).send({message: `No existen eventos`})

    Event.populate(events, {path: "tag", select: 'name'},function(err, events){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})

      Event.populate(events, {path: "user", select: 'nickname displayName avatar'},function(err, events){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        res.status(200).send({ events })
      })
    })
  })
}


function getEventmessages (req, res){
  Eventmessage.find({}, (err, eventmessages) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!eventmessages) return res.status(404).send({message: `No existen eventos`})

    Eventmessage.populate(eventmessages, {path: 'user', select: 'nickname avatar'},function(err, eventmessages){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      Eventmessage.populate(eventmessages, {path: 'event', select: 'name'},function(err, eventmessages){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        res.status(200).send({ eventmessages })
      });
    });

  })
}


function saveEvent (req, res){

  let event = new Event()
  event.name = req.body.name
  event.picture = req.body.picture
  event.date = req.body.date
  event.dateCreated = new Date()
  event.tag = req.body.tag
  event.description = req.body.description
  event.user = req.body.user

  if (event.picture == null || event.picture === "")
    event.picture = "/public/img/blank-picture.png"

  var errorsList = eventValidator(event)
  if (errorsList.length > 0)
  return res.status(200).send({message: errorsList})

  event.save((err, eventStored) => {
    if (err) return res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

    res.status(200).send({event: eventStored})
  })
}


function updateEvent (req, res){
  let  eventId = req.params.eventId
  let update = req.body

  if (req.body.picture === ""){
    req.body.picture = "/public/img/blank-picture.png";
  }

  var errorsList = eventUpdateValidator(update)
  if (errorsList.length > 0)
  return res.status(200).send({message: errorsList})

  Event.findByIdAndUpdate(eventId, update, (err, eventUpdated) => {
    if (err) return res.status(500).send({message: `Error al actualizar en la base de datos: ${err}`})

    res.status(200).send({event: eventUpdated})
  })
}

function deleteEvent (req, res){
  let  eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})

    Eventmessage.find({event: eventId}, (err, messages) => {
      if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      messages.map(message => {
        message.remove(err => {
          if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
        })
      })
    })

    Userjoined.find({event: eventId}, (err, joins) => {
      if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})

      joins.map(join => {
        join.remove(err => {
          if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
        })
      })
    })

    event.remove(err => {
      if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      res.status(200).send({message: 'El evento ha sido eliminado'})
    })
  })
}



function saveEventmessage (req, res){

  let eventmessage = new Eventmessage()
  eventmessage.content = req.body.content
  eventmessage.user = req.body.user
  eventmessage.event = req.body.event

  eventmessage.save((err, eventmessageStored) => {
    if (err) return res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

    res.status(200).send({event: eventmessageStored})
  })
}


function deleteEventmessage (req, res){
  let  commentId = req.params.commentId

  Eventmessage.findById(commentId, (err, message) => {
    if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
    message.remove(err => {
      if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      res.status(200).send({success: 'true'})
    })
  })
}


function saveUserjoined (req, res){

  let userjoined = new Userjoined()
  userjoined.user = req.body.user
  userjoined.event = req.body.event

  userjoined.save((err, userjoinedStored) => {
    if (err) return res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

    res.status(200).send({event: userjoinedStored})
  })
}

function deleteUserjoined (req, res){
  let user = req.body.user
  let event = req.body.event

  Userjoined.findOne({user: user, event: event}, (err, userjoined) => {
    if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})

    userjoined.remove(err => {
      if (err) return res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      res.status(200).send({success: 'true'})
    })
  })
}

function getUserjoined (req, res){
  Userjoined.find({}, (err, userjoined) => {
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


function getEventsByUser (req, res){
  var userId = req.params.userId

  Userjoined.find({user: userId}, (err, userjoined) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!userjoined) return res.status(404).send({message: `No existen apuntados`})

    Userjoined.populate(userjoined, {path: 'user', select: ' displayName nickname avatar'},function(err, userjoined){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      Userjoined.populate(userjoined, {path: 'event'},function(err, userjoined){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        Userjoined.populate(userjoined, {path: 'event.user', model: 'User', select: 'nickname displayName'},function(err, userjoined){
          if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
          Userjoined.populate(userjoined, {path: 'event.tag', model: 'Tag', select: '-_id'},function(err, userjoined){
            if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
            res.status(200).send({ userjoined })
          });
        });
      });
    });
  })
}



function eventValidator(event){
  var errorsList = new Array()

  if (event.name == null || event.description == null || event.date == null || event.user == null || event.tag == null){
      errorsList.push('Faltan campos necesarios')
      return errorsList
  }

  if (event.name === "" || event.description === "" || event.date === "" || event.user === "" || event.tag === ""){
      errorsList.push('Faltan campos necesarios')
      return errorsList
  }

  if (event.name.length < 8)
  errorsList.push('El nombre debe tener al menos 8 carácteres')

  else if (event.name.length > 30)
  errorsList.push('El nombre excede de 30 carácteres')

  var date = new Date(event.date);
  var cur = new Date();

  if (date < cur){
    errorsList.push('El evento debe ocurrir en el futuro')
  }

  if (event.description.length < 50)
  errorsList.push('La descripción debe tener al menos 50 carácteres')

  else if (event.description.length > 500)
  errorsList.push('La descripción excede de 500 carácteres')

  if (event.picture != null && event.picture.length > 100)
  errorsList.push('La imagen no puede exceder de 100 carácteres')

  return errorsList
}




function eventUpdateValidator(event){
  var errorsList = new Array()

  if (event.name == null || event.description == null || event.date == null || event.tag == null){
      errorsList.push('Faltan campos necesarios')
      return errorsList
  }

  if (event.name === "" || event.description === "" || event.date === "" || event.tag === ""){
      errorsList.push('Faltan campos necesarios')
      return errorsList
  }

  if (event.name.length < 8)
  errorsList.push('El nombre debe tener al menos 8 carácteres')

  else if (event.name.length > 30)
  errorsList.push('El nombre excede de 30 carácteres')

  var date = new Date(event.date);
  var cur = new Date();

  if (date < cur){
    errorsList.push('El evento debe ocurrir en el futuro')
  }

  if (event.description.length < 50)
  errorsList.push('La descripción debe tener al menos 50 carácteres')

  else if (event.description.length > 500)
  errorsList.push('La descripción excede de 500 carácteres')

  if (event.picture != null && event.picture.length > 100)
  errorsList.push('La imagen no puede exceder de 100 carácteres')

  return errorsList
}



/* VIEWS------------------------------------------------------------------------------------------------- */

function showEvent (req, res){
  let  eventId = req.params.eventId

  if (!eventId) return res.render('error', {message: `Evento no válido`})
  Event.findById(eventId, (err, event) => {
    if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
    if (!event) return res.render('error', {message: `El evento especificado no existe`})

    Event.populate(event, {path: "user", select: 'nickname displayName avatar'},function(err, event){
      if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
      Event.populate(event, {path: "tag", select: 'name'},function(err, event){
        if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
        Eventmessage.find({event: event._id}, (err, eventmessage) => {
          if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
          if (!eventmessage) return res.render('error', {message: `El evento especificado no existe`})
          Eventmessage.populate(eventmessage, {path: "user", select: 'nickname displayName avatar'},function(err, eventmessage){
            if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})

            event.eventmessage = eventmessage

            res.render('event', {event: event})
          })
        })
      })
    })
  })
}



function showHome (req, res){
  Event.find({}).
  where('date').gt(Date.now()).
  limit(5).
  sort('date').
  exec((err, events) => {
    if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
    if (!events) return res.render('error', {message: `No existen eventos para mostrar`})

    Event.populate(events, {path: "tag", select: 'name'},function(err, events){
      if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})

      Event.populate(events, {path: "user", select: 'nickname displayName avatar'},function(err, events){
        if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
        res.render('home', {events: events})
      })
    })
  });

}



function showEvents (req, res){
  Event.find({}, (err, events) => {
    if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
    if (!events) return res.render('error', {message: `No existen eventos`})

    Event.populate(events, {path: "tag", select: 'name'},function(err, events){
      if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})

      Event.populate(events, {path: "user", select: 'nickname displayName avatar'},function(err, events){
        if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
        res.render('events', {events: events})
      })
    })
  })
}

function editScreen (req, res){
  let  eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
    if (!event) return res.render('error', {message: `No existe el evento`})

    res.render('editevent', {event: event})
  })
}

function deleteScreen (req, res){
  let  eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) return res.render('error', {message: `Error al realizar la peticion: ${err}`})
    if (!event) return res.render('error', {message: `No existe el evento`})

    res.render('deleteevent', {event: event})
  })
}


module.exports = {
  getEventmessages,
  getEvent,
  getEvents,
  saveEvent,
  updateEvent,
  deleteEvent,
  saveEventmessage,
  deleteEventmessage,
  showEvent,
  showHome,
  saveUserjoined,
  deleteUserjoined,
  getUserjoined,
  showEvents,
  getEventsByUser,
  editScreen,
  deleteScreen,
  getEventsFiltered
}
