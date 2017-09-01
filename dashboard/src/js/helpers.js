/****** helper functions *******/

// Get URL parameters
// see also: http://snipplr.com/view/19838
// Usage: `map = getUrlVars()` while at example.html?foo=asdf&bar=jkls
// sets map['foo']='asdf' and map['bar']='jkls'
function getUrlVars() {
  var vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(m,key,value) {
      vars[key] = value;
    });
  return vars;
}

function onlyNumbers (val) {
  return (typeof parseInt(val) === 'number' && !isNaN(val)) ? parseInt(val) : -1
}

function objArrayToSortedNumArray (objArray,prop) {
  return objArray.map(function (el){ return el[prop] }).sort(function (a,b) { return a - b })
}

function numberWithCommas(x){
    if (typeof x === 'undefined') return "and above"
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function arrayQuartiles (sortedArr) {
  return [
    d3.quantile(sortedArr,0.25),
    d3.quantile(sortedArr,0.5),
    d3.quantile(sortedArr,0.75)
  ]
}
export { getUrlVars, objArrayToSortedNumArray, numberWithCommas, arrayQuartiles }