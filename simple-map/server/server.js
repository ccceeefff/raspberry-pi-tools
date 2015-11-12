import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import serveFavicon from 'serve-favicon'
import http from 'http'
import socketio from 'socket.io'

import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../shared/components/App'

const app = express()
const server = http.Server(app)
const io = socketio(server)

let memstore = {}

app.set('env', process.env.NODE_ENV || 'development')
app.set('host', process.env.HOST || '0.0.0.0')
app.set('port', process.env.PORT || 3000)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(bodyParser.json())
//app.use(serveFavicon(`${assetsPath}/assets/favicon.png`))
app.use(express.static(path.join(__dirname, '../assets')))

app.post('/api/v1/submit', (req, res) => {
  const payload = req.body

  if (memstore[payload.gatewayId]) {
    const gateway = memstore[payload.gatewayId]

    payload.entries.map(entry => {
      if (gateway.nodes[entry.nodeId]) {
        gateway.nodes[entry.nodeId].value = entry.rawValue
      } else {
        gateway.nodes[entry.nodeId] = {
          value: entry.rawValue
        }
      }
    })
  } else {
    memstore[payload.gatewayId] = {
      lat: payload.locLat,
      lng: payload.locLong,
      nodes: {}
    }

    payload.entries.map(node => {
      memstore[payload.gatewayId].nodes[node.nodeId] = {
        value: node.rawValue
      }
    })
  }

  let coordinates = []

  for (let gatewayName in memstore) {
    if (memstore.hasOwnProperty(gatewayName)) {
      const gateway = memstore[gatewayName]
      const nodes = gateway.nodes

      for (let nodeId in nodes) {
        if (nodes.hasOwnProperty(nodeId)) {
          const node = nodes[nodeId]

          if (node.value > 20) {
            coordinates.push([gateway.lng, gateway.lat])
          }
        }
      }
    }
  }

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
