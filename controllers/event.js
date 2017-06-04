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
  event.tag = req.body.tag
  event.description = req.body.description
  event.user = req.body.user

  event.save((err, eventStored) => {
    if (err) res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

    res.status(200).send({event: eventStored})
  })
}


function updateEvent (req, res){
  let  eventId = req.params.eventId
  let update = req.body

  Event.findByIdAndUpdate(eventId, update, (err, eventUpdated) => {
    if (err) res.status(500).send({message: `Error al actualizar en la base de datos: ${err}`})

    res.status(200).send({event: eventUpdated})
  })
}

function deleteEvent (req, res){
  let  eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})

    Eventmessage.find({event: eventId}, (err, messages) => {
      if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      messages.remove(err => {
        if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      })
    })

    Userjoined.find({event: eventId}, (err, joins) => {
      if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      joins.remove(err => {
        if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      })
    })

    event.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
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
    if (err) res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

    res.status(200).send({event: eventmessageStored})
  })
}


function saveUserjoined (req, res){

  let userjoined = new Userjoined()
  userjoined.user = req.body.user
  userjoined.event = req.body.event

  userjoined.save((err, userjoinedStored) => {
    if (err) res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

    res.status(200).send({event: userjoinedStored})
  })
}

function deleteUserjoined (req, res){
  let user = req.body.user
  let event = req.body.event

  Userjoined.findOne({user: user, event: event}, (err, userjoined) => {
    if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})

    userjoined.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      res.status(200).send({correcto: 'true'})
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

    Userjoined.populate(userjoined, {path: 'user', select: 'nickname avatar'},function(err, userjoined){
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


/* VIEWS------------------------------------------------------------------------------------------------- */

function showEvent (req, res){
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

            res.render('event', {event: event})
          })
        })
      })
    })
  })
}



function showHome (req, res){
  Event.find({}, (err, events) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!events) return res.status(404).send({message: `No existen eventos`})

    Event.populate(events, {path: "tag", select: 'name'},function(err, events){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})

      Event.populate(events, {path: "user", select: 'nickname displayName avatar'},function(err, events){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        res.render('home', {events: events})
      })
    })
  })
}



function showEvents (req, res){
  Event.find({}, (err, events) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!events) return res.status(404).send({message: `No existen eventos`})

    Event.populate(events, {path: "tag", select: 'name'},function(err, events){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})

      Event.populate(events, {path: "user", select: 'nickname displayName avatar'},function(err, events){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        res.render('events', {events: events})
      })
    })
  })
}

function editScreen (req, res){
  let  eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!event) return res.status(404).send({message: `No existe el evento`})

    res.render('editevent', {event: event})
  })
}

function deleteScreen (req, res){
  let  eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!event) return res.status(404).send({message: `No existe el evento`})

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
  showEvent,
  showHome,
  saveUserjoined,
  deleteUserjoined,
  getUserjoined,
  showEvents,
  getEventsByUser,
  editScreen,
  deleteScreen
}
