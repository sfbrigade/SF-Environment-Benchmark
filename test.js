'use strict'
const fs = require('fs')
const d3 = require('d3')

let groupings = {
  office:{
    names: [
      '<25k',
      '25-50k',
      '50-100k',
      '100-300k',
      '>300k'
    ],
    floorArea: [
      25000,
      50000,
      100000,
      300000
    ]
  },
  hotel: {
    names: [
      '<25k',
      '25-50k',
      '50-100k',
      '100-250k',
      '>250k'
    ],
    floorArea: [
      25000,
      50000,
      100000,
      250000
    ]
  },
  retail: {
    names: [
      '<20k',
      '>20k'
    ],
    floorArea: [
      20000
    ]
  }
}
for (let category in groupings){
  /* d3.scale to get "similar" sized buildings */
  groupings[category].scale = d3.scale.threshold()
        .domain(groupings[category].floorArea)
        .range(groupings[category].names);
}

module.exports = groupings

//utility functions
function writeToFile(data, filename){
  if (typeof data != 'string') { data = JSON.stringify(data) }

  fs.writeFile(filename, data, function(err) {
    if(err) {
      console.log('error saving document', err)
    } else {
      console.log('The file was saved as ' + filename)
    }
  })
}