'use strict'

const Tag = require('../models/tag')

function getTag (req, res){
  let  tagId = req.params.tagId

  Tag.findById(tagId, (err, tag) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!tag) return res.status(404).send({message: `La etiqueta no existe`})

    res.status(200).send({tag})
  })
}

function getTags (req, res){
  Tag.find({}, (err, tags) => {
    if (err) return res.status(500).send({message: `Error al realizar la peticion: ${err}`})
    if (!tags) return res.status(404).send({message: `No existen etiquetas`})
    res.status(200).send( { tags })
  })
}

function saveTag (req, res){

  let tag = new Tag()
  tag.name = req.body.name

  tag.save((err, tagStored) => {
    if (err) res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

    res.status(200).send({tag: tagStored})
  })
}

function updateTag (req, res){
  let  tagId = req.params.tagId
  let update = req.body

  Tag.findByIdAndUpdate(tagId, update, (err, tagUpdated) => {
    if (err) res.status(500).send({message: `Error al actualizar en la base de datos: ${err}`})

    res.status(200).send({tag: tagUpdated})
  })
}

function deleteTag (req, res){
  let  tagId = req.params.tagId

  Tag.findById(tagId, (err, tag) => {
    if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})

    tag.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar en la base de datos: ${err}`})
      res.status(200).send({message: 'La etiqueta ha sido eliminada'})
    })
  })
}

module.exports = {
  getTag,
  getTags,
  saveTag,
  updateTag,
  deleteTag
}
