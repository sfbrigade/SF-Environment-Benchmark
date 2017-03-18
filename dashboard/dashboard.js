// TODO: colorscale is not being recalculated for new data

/* We should totally be using dc for this project. http://dc-js.github.io/dc.js/ */

/* glogal reference objects */
/* colorSwatches should be shared between map.js & dashboard.js */
var colorSwatches = {
      energy_star_score: ['#FD6C16','#FEB921','#46AEE6','#134D9C'],
      total_ghg_emissions_intensity_kgco2e_ft2: ['#f4fde8','#b6e9ba','#76cec7','#3ea3d3'],
      source_eui_kbtu_ft2: ['#134D9C','#46AEE6', '#FEB921', '#FD6C16'],
      site_eui_kbtu_ft2: ['#ffffe0','#ffa474','#db4551','#8b0000'],
      highlight: '#ff00fc'
    };

var color = {
  energy_star_score: d3.scale.threshold().range(colorSwatches.energy_star_score),
  total_ghg_emissions_intensity_kgco2e_ft2: d3.scale.threshold().range(colorSwatches.total_ghg_emissions_intensity_kgco2e_ft2),
  source_eui_kbtu_ft2: d3.scale.threshold().range(colorSwatches.source_eui_kbtu_ft2),
  site_eui_kbtu_ft2: d3.scale.threshold().range(colorSwatches.site_eui_kbtu_ft2)
}

/* categoryFilters should be shared between map.js & dashboard.js */
var categoryFilters = [
  'All',
  'Office',
  'Hotel',
  'Retail Store',
  'Other',
  'Mixed Use Property',
  'Non-Refrigerated Warehouse',
  'Worship Facility',
  'College/University',
  'Supermarket/Grocery Store',
  'Medical Office',
  'Manufacturing/Industrial Plant',
  'Distribution Center',
  'Automobile Dealership',
  'Restaurant',
  'N/A'
];

var width = parseInt(d3.select('#chart-histogram').style('width'))

/* Storing parcel data globally */
var returnedApiData = []

/* page state data */
var activeCategory = 'All'

/* pointers to dom elements */
var chartHistogram = d3.select('#chart-histogram')
var chartStackedBar = d3.select('#chart-stackedbar')
var chartBubble = d3.select('#chart-bubble')
var scorebox = document.getElementById('scorebox')

/* global chart objects */
var histogram = histogramChart()
  .width(width)
  .height(200)
  .range([0,104])
  .bins(50)
  .tickFormat(d3.format(',d'))
var stackedBar = hStackedBarChart()
  .width(width)
  .height(60)
  .margin({top: 10, right: 50, bottom: 10, left: 50})
var bubbles = scatterPlot()
  .width(width)
  .height(300)
  .margin({left: 50})

/* var soda = require('soda-js');
var fs = require('fs');
var consumer = new soda.Consumer('data.sfgov.org') */

d3.select(window).on('resize', windowResize);
/*
consumer.query()
  .withDataset('75rg-imyz')
  .limit(2000)
  .getRows()
    .on('success', function(rows) { console.log(rows); 
                    fs.writeFile("./data/75rg-imyz.json", JSON.stringify(rows), function(err) {
                    if(err) {
                        return console.log(err);
                     } });})
    .on('error', function(error) { console.error(error); });
*/

/* get the data and render the page */
d3_queue.queue()
    .defer(d3.json, '../data/75rg-imyz.json')  /* https://data.sfgov.org/resource/j2j3-acqj.json?$limit=2000 */
    .await(renderCharts)
function renderCharts (error, apiData) {
  $('.loading').remove()
  returnedApiData = parseData(apiData)

  var estarVals = objArrayToSortedNumArray(apiDataToArray('latest_energy_star_score'))
  estarVals = estarVals.filter(function (d) { return d > 0 })

  var euiVals = objArrayToSortedNumArray(apiDataToArray('latest_site_eui_kbtu_ft2'))
  euiVals = euiVals.filter(function (d) { return d > 0 && d < 1000 }) /* 1000 here is arbitrary to cut out outlier of SFMOMA & some others*/

  var scatterPlotVals = apiDataToXYR('latest_site_eui_kbtu_ft2', 'latest_total_ghg_emissions_metric_tons_co2e', 'floor_area')
  scatterPlotVals = scatterPlotVals.filter(function(d){ return d.x < 1000 }) /* 1000 here is arbitrary to cut out outlier of SFMOMA & some others*/

  /* color assigned by quartile */
  color.energy_star_score.domain(arrayQuartiles(estarVals))
  color.source_eui_kbtu_ft2.domain(arrayQuartiles(euiVals))
  // color.total_ghg_emissions_intensity_kgco2e_ft2.domain(arrayQuartiles(ghgVals))

  /* draw histogram for energy star */
  histogram.colorScale(color.energy_star_score).bins(100).xAxisLabel('Energy Star Score').yAxisLabel('Buildings')
  chartHistogram.datum(estarVals).call(histogram)
  chartHistogram.call(histogramHighlight,-10)

  /* draw stacked bar for energy use intensity */
  stackedBar.colorScale(color.source_eui_kbtu_ft2)
  chartStackedBar.datum(euiVals).call(stackedBar)

  /* draw bubble chart for estimated cost ? <<do we even have the data for this? */
  /* draw bubble chart for greenhouse gases (ghg) instead */
  bubbles.colorScale(color.source_eui_kbtu_ft2).xAxisLabel('Site EUI').yAxisLabel('GHG Emissions')
  chartBubble.datum(scatterPlotVals).call(bubbles)
  // chartBubble.call(chartBubbleHighlight,-10)

  /* draw map */
  //Setting up leaflet map
  var map = L.map('widget-map').setView([37.7833, -122.4167], 13);

  //Getting tile from Mapbox
  var mapreturnedApiData = [];

  L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.dark/{z}/{x}/{y}.png?access_token={accessToken}', {
      maxZoom: 18,
      minZoom: 10,
      attributionControl: false,
      id: 'smoningi.a304c3dc',
      accessToken: 'pk.eyJ1Ijoic21vbmluZ2kiLCJhIjoiQ21rN1pjSSJ9.WKrPFjjb7LRMBjyban698g'
  }).addTo(map);

  var mapSVG = d3.select(map.getPanes().overlayPane).append("svg"),
      mapG = mapSVG.append("g").attr("class", "leaflet-zoom-hide");

  d3_queue.queue()
      .defer(d3.json, "../data/j2j3-acqj.json") //this data has already loaded at this point, why is it doing it agian? /* https://data.sfgov.org/resource/j2j3-acqj.json?$limit=2000 */
      .defer(d3.json, "../data/justGeo.geojson")
      .await(mapDraw);

  function mapDraw(err, apiData, collection){
      mapreturnedApiData = parseData(apiData)
      collection.features.forEach(function(feature){
        var data = returnedApiData.find(function(el){
          return el.parcel_s === feature.properties.parcel_s
        })
        if (data != undefined) feature.properties = data
      })

      var mapColor = color.energy_star_score;

      var chartData = apiDataToArray('latest_energy_star_score');
      var valuesArr = objArrayToSortedNumArray(chartData).filter(function (d) { return d > 0 })
      var thresholds = arrayQuartiles(valuesArr)
      // color.energy_star_score.domain(thresholds)
      mapColor.domain(thresholds)

      var transform = d3.geo.transform({point: projectPoint}),
          path = d3.geo.path().projection(transform);

      var feature = mapG.selectAll("path")
          .data(collection.features)
          .enter()
          .append("path")
          .attr("id", function(d){
            return d.properties.ID;
          })
          .style("stroke", "#B9E7FF")
          .style("stroke-width",0.1)
          .style("fill", function(d){
            if(isNaN(d.properties['latest_energy_star_score'])){ //->>>>>>> Need a good isNaN color
              return "#FEB921";
            } else{
              return mapColor(parseInt(d.properties['latest_energy_star_score']));
            }
          })
          .style("fill-opacity", 0.5)
          .on("mouseover", function(d){
            d3.select(this).style("fill-opacity",1)
              .style("stroke", colorSwatches.highlight)
              .style("stroke-width",2)
              .style("fill", colorSwatches.highlight);
          })
          .on("mouseout", function(d){
            d3.select(this).style("stroke", "#B9E7FF")
              .style("stroke-width",0.1)
              .style("fill", function(d){
                return mapColor(parseInt(d.properties['latest_energy_star_score']));
              });
          });

      map.on("viewreset", reset);
      reset();


      // Reposition the SVG to cover the features.
      function reset() {
          var bounds = path.bounds(collection),
              topLeft = bounds[0],
              bottomRight = bounds[1];

          mapSVG.attr("width", bottomRight[0] - topLeft[0])
              .attr("height", bottomRight[1] - topLeft[1])
              .style("left", topLeft[0] + "px")
              .style("top", topLeft[1] + "px");

          mapG.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

          feature.attr("d", path);
      }

      // Use Leaflet to implement a D3 geometric transformation.
      function projectPoint(x, y) {
          var point = map.latLngToLayerPoint(new L.LatLng(y, x));
          this.stream.point(point.x, point.y);
      }

    }




  /* draw table for data */
  $('#infotable').DataTable( {
    responsive: true,
    language: {
      paginate: {
        previous: '&lt;',
        next: '&gt;'
      }
    },
    bInfo: false,
    data: returnedApiData,
    columns: [
      { title: "Address", data: "building_address", responsivePriority: 2 },
      { title: "Building Name", data: "building_name", responsivePriority: 4 },
      { title: "Floor Area", data: "floor_area", responsivePriority: 5 },
      { title: "Property Type", data: "property_type_self_selected", responsivePriority: 3 }
    ],
    columnDefs: [
      {
        render: function ( data, type, row ) {
          return numberWithCommas(data);
        },
        searchable: false,
        targets: 2
      },
      {
        render: function (data, type, row) {
          return '<span class="likelink" onClick="dispatcher.changeCategory(\''+ data +'\')">'+data+'</span>'
        },
        targets: 3
      }
    ],
    rowCallback: function( row, data, index) {
      row.onclick = function(){
        return dispatcher.selectBuilding(data.ID)
      }
    }
  });

  /* render info table */
  digestTable(digestData('All'))

  $("#category-filters-dropdown a").click(function(){dispatcher.changeCategory( $(this).html() )})
  d3.selectAll('.dot').on('mouseover', function(d){ dispatcher.selectBuilding(d.id) })
}

var dispatcher = d3.dispatch('changeCategory', 'selectBuilding')
dispatcher.on('changeCategory', function(newCategory){

  // filterMapCategory(newCategory) /* only activates last filter selected */
  var estarVals = objArrayToSortedNumArray(apiDataToArray('latest_energy_star_score', newCategory)).filter(function (d) { return d > 0 })
  var euiVals = objArrayToSortedNumArray(apiDataToArray('latest_site_eui_kbtu_ft2', newCategory)).filter(function (d) { return d > 0 && d < 1000 }) /* 1000 here is arbitrary to cut out outlier of SFMOMA & some others*/
  var scatterPlotVals = apiDataToXYR('latest_site_eui_kbtu_ft2', 'latest_total_ghg_emissions_metric_tons_co2e', 'floor_area', newCategory)
  scatterPlotVals = scatterPlotVals.filter(function(d){ return d.x < 1000 }) /* 1000 here is arbitrary to cut out outlier of SFMOMA & some others*/

  color.energy_star_score.domain(arrayQuartiles(estarVals))
  // color.source_eui_kbtu_ft2.range(d3.extent(euiVals)).domain(arrayQuartiles(euiVals))
  // TODO: something like ^this^

  stackedBar.colorScale(color.source_eui_kbtu_ft2)

  chartHistogram.datum(estarVals).call(histogram)
  chartStackedBar.datum(euiVals).call(stackedBar)
  chartBubble.datum(scatterPlotVals).call(bubbles)
  digestTable(digestData(newCategory))

  var tablesearch = (newCategory === "All") ? '' : newCategory
  $('#infotable').DataTable().search(tablesearch).draw()
  d3.selectAll('.dot').on('mouseover', function(d){ dispatcher.selectBuilding(d.id) })
})
dispatcher.on('selectBuilding', function(newBlockLot){
  var blockLot = returnedApiData.find(function(el){
    return el.ID === newBlockLot.toString()
  })
  activePropertyTable(blockLot)
  chartHistogram.call(histogramHighlight, blockLot.latest_energy_star_score)
  chartStackedBar.call(stackedBarHighlight, blockLot.latest_site_eui_kbtu_ft2)
  chartBubble.call(bubblesHighlight, {x:blockLot.latest_site_eui_kbtu_ft2, y:blockLot.latest_total_ghg_emissions_metric_tons_co2e, r:blockLot.floor_area})
  // mapHighlight(newBlockLot)

})

/* parseData() should be shared between map.js & dashboard.js */
function parseData (apiData) {
  var metrics = ['benchmark','energy_star_score','site_eui_kbtu_ft2','source_eui_kbtu_ft2','percent_better_than_national_median_site_eui','percent_better_than_national_median_source_eui','total_ghg_emissions_metric_tons_co2e','total_ghg_emissions_intensity_kgco2e_ft2','weather_normalized_site_eui_kbtu_ft2','weather_normalized_source_eui_kbtu_ft2']
  var re1 = /(.+)\//
  var re2 = /[\/\.](.+)/
  var spliceArray = []
  apiData.forEach(function (parcel, index) {
    if (parcel.parcel_s === undefined) {spliceArray.unshift(index); return parcel}
    if (! parcel.hasOwnProperty('property_type_self_selected') ) { parcel.property_type_self_selected = 'N/A'}
    parcel.parcel1 = re1.exec(parcel.parcel_s)[1]
    parcel.parcel2 = re2.exec(parcel.parcel_s)[1]
    parcel.blklot = '' + parcel.parcel1 + parcel.parcel2
    parcel.ID = '' + parcel.blklot
    metrics.forEach(function (test) {
      parcel = latest(test, parcel)
    })
    return parcel
  })
  /* remove elements that have no parcel identifier */
  spliceArray.forEach(function (el) {
    apiData.splice(el,1)
  })
  return apiData
}

function latest (test, entry) {
  var years = [2011,2012,2013,2014,2015]
  if (test === 'benchmark') years.unshift(2010)
  var yearTest = years.map(function(d){
    if (test === 'benchmark') return 'benchmark_' + d + '_status'
    else return '_' + d + '_' + test
  })
  yearTest.forEach(function(year,i){
    if (entry[year] != null){
      entry['latest_'+test] = entry[year]
      entry['latest_'+test+'_year'] = years[i]
    }
    else {
      entry['latest_'+test] = entry['latest_'+test] || 'N/A'
      entry['latest_'+test+'_year'] = entry['latest_'+test+'_year'] || 'N/A'
    }
  })
  return entry
}

function apiDataToArray (prop, categoryFilter) {
  var arr = returnedApiData
  if (categoryFilter && categoryFilter !== 'All') {
    arr = arr.filter(function(parcel){
      return parcel.property_type_self_selected === categoryFilter
    })
  }
  arr = arr.map(function (parcel) {
    // if ( typeof parcel != 'object' || parcel === 'null' ) continue
    var onlyNumbers = (typeof parseInt(parcel[prop]) === 'number' && !isNaN(parcel[prop])) ? parseInt(parcel[prop]) : -1
    return {id: parcel.ID, value: onlyNumbers}
  })
  return arr
}

function apiDataToXYR (xProp, yProp, rProp, categoryFilter) {
  var arr = returnedApiData
  if (categoryFilter && categoryFilter !== 'All') {
    arr = arr.filter(function(parcel){
      return parcel.property_type_self_selected === categoryFilter
    })
  }
  /* filter out values that don't exist */
  arr = arr.filter(function (parcel) {
    var thisparcel = [onlyNumbers(parcel[xProp]), onlyNumbers(parcel[yProp]), onlyNumbers(parcel[rProp])]
    return thisparcel.every(function (el) {return el > 0})
  })
  /* make the simplified xyr data array */
  arr = arr.map(function (parcel) {
    return { id: parcel.ID, x: +parcel[xProp], y: +parcel[yProp], r: +parcel[rProp] }
  })
  return arr
}

function digestData (categoryFilter) {
  var arr = returnedApiData
  if (categoryFilter && categoryFilter !== 'All') {
    arr = arr.filter(function(parcel){
      return parcel.property_type_self_selected === categoryFilter
    })
  }
  var result = arr.reduce(function (prev, curr) {
    // # of Properties
    // SF of floor area
    // Energy Like for Like 2013-2014 (418 properties)
    // Total GHG Emissions (MT CO2e)
    // Compliance Rate
    return {
      count: prev.count + 1,
      floor_area: prev.floor_area + +curr.floor_area,
      total_ghg: (isNaN(+curr.latest_total_ghg_emissions_metric_tons_co2e)) ? prev.total_ghg : prev.total_ghg + +curr.latest_total_ghg_emissions_metric_tons_co2e,
      compliance: (curr.latest_benchmark === 'Complied') ? prev.compliance + 1 : prev.compliance
    }
  }, {count:0,floor_area:0,total_ghg:0,compliance:0})
  result.compliance = roundToTenth(100*(result.compliance/result.count))
  result.total_ghg = roundToTenth(result.total_ghg)
  result.type = categoryFilter
  return result
}

function digestTable (digest) {
  d3.select('#table-type').html(digest.type)
  d3.select('#table-count').html(numberWithCommas(digest.count))
  d3.select('#table-floor_area').html(numberWithCommas(digest.floor_area) + ' ft<sup>2</sup>')
  d3.select('#table-total_ghg').html(numberWithCommas(digest.total_ghg) + ' MT CO<sub>2</sub>')
  d3.select('#table-compliance').html(digest.compliance + '%')
}

function activePropertyTable (blockLot) {
  var tablehtml = '<dl class="dl-horizontal">'
     tablehtml += '<dt>Address</dt><dd>' + blockLot.building_address + '</dd>'
     tablehtml += '<dt>Building Type</dt><dd>' + blockLot.property_type_self_selected + '</dd>'
     tablehtml += '<dt>Latest Benchmark Year</dt><dd>' + blockLot.latest_benchmark_year + '</dd>'
     tablehtml += '<dt>Energy Star Score</dt><dd>' + blockLot.latest_energy_star_score + '</dd>'
     tablehtml += '<dt>Site EUI</dt><dd>' + blockLot.latest_site_eui_kbtu_ft2 + ' kbtu/ft<sup>2</sup></dd>'
     tablehtml += '<dt>GHG Emissions</dt><dd>' + blockLot.latest_total_ghg_emissions_metric_tons_co2e + ' MT CO<sub>2</sub></dd>'
     tablehtml += '<dt>Floor Area</dt><dd>' + numberWithCommas(blockLot.floor_area) + ' ft<sup>2</sup></dd>'
     tablehtml += '</dl>'

  $('#active-property').html(tablehtml)

}

function onlyNumbers (val) {
  return (typeof parseInt(val) === 'number' && !isNaN(val)) ? parseInt(val) : -1
}

function objArrayToSortedNumArray (objArray) {
  return objArray.map(function (el){ return el.value }).sort(function (a,b) { return a - b })
}

function histogramHighlight (selection, data) {
  if( isNaN(data) ) data = -100
  var x = histogram.xScale(),
      y = histogram.yScale(),
      margin = histogram.margin(),
      width = histogram.width(),
      height = histogram.height()
  var svg = selection.select('svg')
  var hl = svg.select("g").selectAll('.highlight').data([data])
  hl.enter().append("rect").attr('class', 'highlight')
  hl.attr("width", 2)
    .attr("x", function(d) { return x(d) })
    .attr("y", 1)
    .attr("height", height - margin.top - margin.bottom )
    .attr('fill', colorSwatches.highlight )
  hl.exit().remove()
}

// function mapHighlight (selection, data) {
//   if( isNaN(data) ) data = -100
//
//
// }

function stackedBarHighlight (selection, data) {
  if( isNaN(data) ) data = -100
  var x = stackedBar.xScale(),
      y = stackedBar.yScale(),
      margin = stackedBar.margin(),
      width = stackedBar.width(),
      height = stackedBar.height()
  var svg = selection.select('svg')
  var hl = svg.select("g").selectAll('.highlight').data([data])
  hl.enter().append("rect").attr('class', 'highlight')
  hl.attr("width", 2)
    .attr("x", function(d) { return x(d) })
    .attr("y", 1)
    .attr("height", height - margin.top - margin.bottom )
    .attr('fill', colorSwatches.highlight )
  hl.exit().remove()
}

function bubblesHighlight (selection, data) {
   if( anyPropNA(data) ) data = { x:-100, y:-100, r:0 } // if any property of data is 'N/A', give default
  var x = bubbles.xScale(),
      y = bubbles.yScale(),
      r = bubbles.rScale(),
      margin = bubbles.margin(),
      width = bubbles.width(),
      height = bubbles.height()
  var svg = selection.select('svg')
  var hl = svg.select("g").selectAll('.highlight').data([data])
  hl.enter().append("circle").attr('class', 'highlight')
  hl.attr("r", function(d) { return r(d.r); })
      .attr("cx", function(d) { return x(d.x); })
      .attr("cy", function(d) { return y(d.y); })
      .attr('fill', function(d) { return color.source_eui_kbtu_ft2(d.x) })
      .attr('fill-opacity', 1)
      .attr('stroke', colorSwatches.highlight)
      .attr('stroke-width', '2px')
  hl.exit().remove()
}

function anyPropNA (obj) {
  var result = false
  for (var prop in obj) {
    if (obj[prop] === "N/A") result = true
  }
  return result
}

function sortNumber (a,b) {
  return a - b;
}

function arrayQuartiles (sortedArr) {
  return [
    d3.quantile(sortedArr,0.25),
    d3.quantile(sortedArr,0.5),
    d3.quantile(sortedArr,0.75)
  ]
}

function roundToTenth (num){
  return Math.round(10*num)/10
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function windowResize() {
    // update width
    width = parseInt(d3.select('#chart-histogram').style('width'), 10);
    // do the actual resize...
    histogram.width(width)
    stackedBar.width(width)
    bubbles.width(width)

    chartHistogram.call(histogram)
    chartStackedBar.call(stackedBar)
    chartBubble.call(bubbles)

}

//*******************************************
/* CATEGORY FILTER DROPDOWN
/********************************************/

// populate single category select dropdown menu
var filterOptions = '<li><a id="show-filter-options-modal" href="#">';
for (var i=0;i < categoryFilters.length;i++) {
    filterOptions += '<li><a href="#">'+categoryFilters[i]+'</a></li>';
}
$("#category-filters-dropdown").html(filterOptions);

// update active class + button label
$('.category-dropdown .dropdown-menu li').click(function() {
    // $('#filters .category-dropdown .dropdown-menu li:first-child').removeClass('active');
    $('.category-dropdown .dropdown-menu li').removeClass('active');
    $(this).toggleClass('active');

    var category = $(this).first().text();
    if (category.length > 18) {
      isEllipse = "...";
    } else {
      isEllipse = "";
    }

    // upon select, update dropdown-toggle label
    $(".category-dropdown small").html(category.substring(0,18)+isEllipse);
});
