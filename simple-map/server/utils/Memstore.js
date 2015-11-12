class Memstore {

  constructor() {
    this.memstore = {}
  }

  update(payload) {
    if (this.memstore[payload.gatewayId]) {
      const gateway = this.memstore[payload.gatewayId]

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
      this.memstore[payload.gatewayId] = {
        lat: payload.locLat,
        lng: payload.locLong,
        nodes: {}
      }

      payload.entries.map(node => {
        this.memstore[payload.gatewayId].nodes[node.nodeId] = {
          value: node.rawValue
        }
      })
    }
  }

  getAllCoordinates(threshold) {
    let coordinates = []

    for (let gatewayName in this.memstore) {
      if (this.memstore.hasOwnProperty(gatewayName)) {
        const gateway = this.memstore[gatewayName]
        const nodes = gateway.nodes

        for (let nodeId in nodes) {
          if (nodes.hasOwnProperty(nodeId)) {
            const node = nodes[nodeId]

            if (node.value > threshold) {
              coordinates.push([gateway.lng, gateway.lat])
            }
          }
        }
      }
    }

    return coordinates
  }

  clear() {
    this.memstore = {}
  }

}

export default Memstore
