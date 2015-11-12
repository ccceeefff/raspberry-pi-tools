import React from 'react'
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

  componentDidMount() {
    const socket = io()

    socket.on('update', (coordinates) => {
      console.log('update', coordinates)
      const geoJSON = this.generateGeoJSON(coordinates)
      console.log(geoJSON)
      this.setState({ geoJSON: geoJSON })
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
