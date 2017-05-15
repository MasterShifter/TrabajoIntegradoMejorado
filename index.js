'use strict'

const mongoose = require('mongoose')
const app = require('./app')
const port = process.env.PORT || 3000
const config = require('./config')

mongoose.Promise = global.Promise
mongoose.connect(config.db, (err, res) => {
  if (err) {
    return console.log(`Error al conectar a la base de datos: ${err}`)
  }
  console.log('Conexion a la abase de datos establecida...')

  app.listen(port, () => {
    console.log(`API REST corriendo en http://localhost:${config.port}`)
  })
})
