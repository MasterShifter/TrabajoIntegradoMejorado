'use strict'

const Event = require('../models/event')
const Eventmessage = require('../models/eventmessage')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

function getEvent (req, res){
  let  eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!event) return res.status(404).send({message: `El evento no existe 1`})

    Event.populate(event, {path: "user", select: 'nickname displayName email avatar'},function(err, event){
      if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
      Event.populate(event, {path: "tag", select: 'name'},function(err, event){
        if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
        Eventmessage.find({event: event._id}, (err, eventmessage) => {
          if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
          if (!eventmessage) return res.status(404).send({message: `El evento no existe 2`})
          Eventmessage.populate(eventmessage, {path: "user", select: 'nickname email avatar'},function(err, eventmessage){
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

    Eventmessage.populate(eventmessages, {path: 'user', select: 'nickname email avatar'},function(err, eventmessages){
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

  console.log(req.body)

  event.save((err, eventStored) => {
    if (err) res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

    res.status(200).send({event: eventStored})
  })
}

function saveEventmessage (req, res){

  let eventmessage = new Eventmessage()
  eventmessage.content = req.body.content
  eventmessage.user = req.body.user
  eventmessage.event = req.body.event

  console.log(req.body)

  eventmessage.save((err, eventmessageStored) => {
    if (err) res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

    res.status(200).send({event: eventmessageStored})
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

    event.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      res.status(200).send({message: 'El evento ha sido eliminado'})
    })
  })
}

module.exports = {
  getEventmessages,
  getEvent,
  getEvents,
  saveEvent,
  updateEvent,
  deleteEvent,
  saveEventmessage
}
