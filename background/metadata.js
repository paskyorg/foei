'use strict'

const metadata = {
  process: function (response, tabId) {
    let type = response.metadata
    let lang = response.lang
    let jsonResponse = response.jsonResponse
    switch (type) {
      case 'unit_types':
        const unit_types = jsonResponse.reduce((acc, current) => {
          acc[current.unitTypeId] = {
            minEra: current.minEra,
            name: current.name,
            points: current.points,
            unitClass: current.unitClass
          };
          return acc;
        }, {})
        consts.units[lang] = unit_types
        // metadata.sendMetadata(type, unit_types, tabId)
        break
      case 'city_entities':
        const city_entities = jsonResponse.reduce((acc, current) => {
          acc[current.id] = current.name;
          return acc;
        }, {})
        consts.entities[lang] = city_entities
        // metadata.sendMetadata(type, city_entities, tabdId)
        break
      default:
        if (trace || debug) {
          console.log('metadata.' + type + ' is not used')
        }
    }
  },
  sendMetadata: function (type, data, tabId) {
    // chrome.runtime.sendMessage({ 'metadata': { type, data } })
    chrome.tabs.query({}, function () {
      chrome.tabs.sendMessage(tabId, {
        action: 'metadata',
        data: { type, data }
      })
    })
  }
}
