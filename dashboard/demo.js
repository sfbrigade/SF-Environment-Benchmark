function changeEstarBinning(){
  var bins = +document.getElementById("change-estar-input").value
  estarHistogram.bins(bins)
  estarHistogramElement.call(estarHistogram)
}

function changeGhgBinning(){
  var bins = +document.getElementById("change-ghg-input").value
  ghgHistogram.bins(bins)
  ghgHistogramElement.call(ghgHistogram)
}

if (urlVars['demo'] === "true") {
  d3.select('#demo').classed('hidden', false)

  d3.select('#change-estar').on('click',changeEstarBinning)
  d3.select('#change-ghg').on('click',changeGhgBinning)
}

