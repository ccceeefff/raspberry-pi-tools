import React from 'react'
import request from 'superagent'
import Map from './Map'

class App extends React.Component {

  constructor(props) {
    super(props)

    let initialGeoJSON = {
      type: 'FeatureCollection',
      features: []
    }

    this.state = { geoJSON: initialGeoJSON }
  }

  generateGeoJSON(coordinates) {
    let geoJSON = {
      type: 'FeatureCollection',
      features: []
    }

    coordinates.map(coordinate => geoJSON.features.push(
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinate
        }
      }
    ))

    return geoJSON
  }

  handleReceiveData(data) {
    const geoJSON = this.generateGeoJSON(data)
    this.setState({ geoJSON: geoJSON })
  }

  componentDidMount() {
    const socket = io()

    socket.on('update', (coordinates) => {
      this.handleReceiveData(coordinates)
    })

    request
      .get('/api/v1/get')
      .end((err, res) => {
        if (res.ok) {
          this.handleReceiveData(res.body)
        }
      })
  }

  render() {
    return (
      <div>
        <Map geoJSON={this.state.geoJSON} />
      </div>
    )
  }
}

export default App
