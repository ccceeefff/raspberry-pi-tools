import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import serveFavicon from 'serve-favicon'
import http from 'http'
import socketio from 'socket.io'

import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../shared/components/App'
import Memstore from './utils/Memstore'

const app = express()
const server = http.Server(app)
const io = socketio(server)

const memstore = new Memstore()
const SENSOR_THRESHOLD = 20

app.set('env', process.env.NODE_ENV || 'development')
app.set('host', process.env.HOST || '0.0.0.0')
app.set('port', process.env.PORT || 3000)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(bodyParser.json())
//app.use(serveFavicon(`${assetsPath}/assets/favicon.png`))
app.use(express.static(path.join(__dirname, '../assets')))

app.get('/api/v1/get', (req, res) => {
  let coordinates = memstore.getAllCoordinates(SENSOR_THRESHOLD)

  res.json(coordinates)
})

app.post('/api/v1/reset', (req, res) => {
  memstore.clear()
})

app.post('/api/v1/submit', (req, res) => {
  const payload = req.body
  memstore.update(payload)

  let coordinates = memstore.getAllCoordinates(SENSOR_THRESHOLD)

  io.emit('update', coordinates)
  res.send('OK')
})

app.get('*', (req, res) => {
  const InitialComponent = (
    <App />
  )

  const component = renderToString(InitialComponent)

  res.render('index', {
    component: component
  })
})

app.use((err, req, res, next) => {
  console.log('Error on request %s %s', req.method, req.url)
  console.log(err)
  console.log(err.stack)
  res.status(500).send('Internal server error')
})

server.listen(app.get('port'), () => {
  const host = server.address().address
  const port = server.address().port

  console.log(`Server is running at http://${host}:${port}`)
})
