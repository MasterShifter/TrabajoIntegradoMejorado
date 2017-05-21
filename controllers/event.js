'use strict'

const Event = require('../models/event')

function getEvent (req, res){
  let  eventId = req.params.eventId

  Event.findById(eventId, (err, event) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!event) return res.status(404).send({message: `El evento no existe`})

    res.status(200).send({event})
  })
}

function getEvents (req, res){
  Event.find({}, (err, events) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!events) return res.status(404).send({message: `No existen eventos`})
    res.status(200).send( { events })
  })
}

function saveEvent (req, res){

  let event = new Event()
  event.name = req.body.name
  event.picture = req.body.picture
  event.date = req.body.date
  event.category = req.body.category
  event.description = req.body.description


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

    event.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      res.status(200).send({message: 'El evento ha sido eliminado'})
    })
  })
}

module.exports = {
  getEvent,
  getEvents,
  saveEvent,
  updateEvent,
  deleteEvent
}
