import React from 'react'
import ReactDOM from 'react-dom'

class Map extends React.Component {

  constructor(props) {
    super(props)

    this.handleLocationFound = this.handleLocationFound.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.map.removeLayer(this.clusterGroup)

    const clusterGroup = this.clusterGroup = new L.MarkerClusterGroup({
      singleMarkerMode: true
    })

    const layer = L.mapbox.featureLayer()

    layer.setGeoJSON(nextProps.geoJSON)

    clusterGroup.addLayer(layer)
    this.map.addLayer(clusterGroup)
  }

  componentDidMount() {
    const mapDiv = ReactDOM.findDOMNode(this.refs.map)

    // Dynamically resize map to fill the entire screen
    $(window).resize(function() {
      $(mapDiv).height($(window).height());
    })

    // Trigger resize event only for the first time
    $(window).trigger('resize');

    L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q'

    const map = this.map = L.mapbox.map(mapDiv, null, {
      center: [51.505, -0.09],
	    zoom: 2,
      attributionControl: false
    })

    L.control.layers({
      'Mapbox OSM Bright 2': L.mapbox.tileLayer('mapbox.osm-bright').addTo(map),
      'Mapbox Streets': L.mapbox.tileLayer('mapbox.streets'),
      'Mapbox Streets Satellite': L.mapbox.tileLayer('mapbox.streets-satellite'),
      'Mapbox Satellite': L.mapbox.tileLayer('mapbox.satellite'),
      'Mapbox Light': L.mapbox.tileLayer('mapbox.light'),
      'Mapbox Dark': L.mapbox.tileLayer('mapbox.dark'),
      'Mapbox Pirates': L.mapbox.tileLayer('mapbox.pirates'),
      'Mapbox Comic': L.mapbox.tileLayer('mapbox.comic'),
      'Mapbox Wheatpaste': L.mapbox.tileLayer('mapbox.wheatpaste'),
      'OpenStreetMap': L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png'),
      'Stamen Toner': L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'),
      'Stamen Watercolor': L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png')
    }).addTo(map)

    map.on('locationfound', this.handleLocationFound)
    map.locate({
      watch: true,
      enableHighAccuracy: true
    })

    const clusterGroup = this.clusterGroup = new L.MarkerClusterGroup({
      singleMarkerMode: true
    })

    const layer = L.mapbox.featureLayer()

    layer.setGeoJSON(this.props.geoJSON)

    clusterGroup.addLayer(layer)
    this.map.addLayer(clusterGroup)
  }

  handleLocationFound(e) {
    const position = e.latlng

    this.map.setView(position, 16)

    if (!this.userMarker) {
      this.userMarker = L.userMarker(position, {pulsing: true, smallIcon: true})
      this.userMarker.addTo(this.map)
      this.map.panTo(position)
    }

    this.userMarker.setLatLng(position);
  }

  render() {
    return (
      <div ref='map' className='map'>
      </div>
    )
  }
}

export default Map
