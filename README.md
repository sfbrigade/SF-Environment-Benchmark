# [SF-Environment-Benchmark](http://codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/)
Set of applications to visualize SF building energy consumption and greenhouse gas emissions.

This project is part of [Data Science Working Group at Code for San Francisco](https://github.com/sfbrigade/data-science-wg)


## Project Description
The goal of this project is to visualize building energy consumption and greenhouse gas emissions to encourage owners and building managers to make proper changes.  From the [SF Environment website](https://sfenvironment.org/energy/energy-efficiency/commercial-and-multifamily-properties/existing-commercial-buildings-energy-performance-ordinance):

> The Existing Commercial Buildings Ordinance requires commercial building owners to track how much energy their building uses each year, and every 5 years to have a professional identify opportunities to save money by saving energy.

More about the [Existing Commercial Buildings Ordinance](https://sfenvironment.org/article/san-franciscos-existing-commercial-buildings-ordinance)

The dashboard is a way to show building owners and property managers their building's performance in comparison to other buildings in San Francisco of similar use case and size.

### Dataset
[DataSF](https://data.sfgov.org/Energy-and-Environment/Existing-Commercial-Buildings-Energy-Performance-O/j2j3-acqj)

### Live links
- SF Environment Benchmark Dashboards (Example building):
   + [Energy Star](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/dashboard/estar.html?apn=3705/039)
   + [EUI](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/dashboard/eui.html?apn=3705/039)
   + [GHG](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/dashboard/ghg.html?apn=3705/039)
   - selection of several [example buildings](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/dashboard/test.html)
- [SF Energy and GHG Map Visualization](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/map)
- [Design mockups for building-profile dashboard](https://projects.invisionapp.com/share/2SAI4AK48#/screens/219556065_SF-Environment-Benchmark)



## Contributing DSWG Members / Authors
### Slack Channel: \#datasci-energyenv
| Name | Slack Handle | Contribution |
| ---| --- | --- |
| Anna Kiefer | @askiefer | Planning/Development |
| Eric Youngson | @eayoungs | Planning/Development |
| Juliana Vislova | @juliana  | Design |
| Tyler Field | @tyler | Development |
| Peter W | @peterw | Development |
| Sanat Moningi | @sanat | Visualization |
| Geoffrey Pay | @gpay | Visualization |
| Baolin Liu | | Modeling |

## Built With
- [D3](https://d3js.org/)
- [Leaflet](http://leafletjs.com/)
- [Mapbox.js](https://www.mapbox.com/mapbox-gl-js/api/)
- [Soda.js](https://github.com/socrata/soda-js)

## Getting Started

Here's how to get started contributing:  

[Fork this repo](https://help.github.com/articles/fork-a-repo/), then clone your repo locally
```
$ git clone <your-repo>
$ cd <this-repo's-name>
$ git remote add upstream <this-repo>
```
Create a feature branch:
```
$ git checkout -b <feature-branch>
```
Do some work:  
```
$ vim <some-files>
```
When you're ready, commit, [merge any upstream changes](https://help.github.com/articles/merging-an-upstream-repository-into-your-fork/), [deal with conflicts](https://help.github.com/articles/resolving-a-merge-conflict-from-the-command-line/), and push your branch ([aka, forking workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow))   
```
$ git commit -am 'my awesome feature'
$ git pull upstream master
  # solve conflicts
$ git push
```
[Create a Pull Request](https://help.github.com/articles/creating-a-pull-request/) from your pushed branch (compare branch) to this repo (base branch)   


### Working on the dashboard component:  
Install dependencies:
```
$ cd dashboard
dashboard$ npm install
```

#### Develop
Use Webpack to launch a server and watch files for changes:
```
dashboard$ npm run start
```

Use Webpack to watch files, but not run a server:
```
dashboard$ npm run watch
```

#### Deploy
Use Webpack to bundle files for production site:
```
dashboard$ npm run build
```
Now the files in `dashboard/dist/` are all you need to copy to a production server.


## Notes
The script pulls live data from [DataSF](https://data.sfgov.org/Energy-and-Environment/Existing-Commercial-Buildings-Energy-Performance-O/j2j3-acqj/data) using the function `Dashboard.startQuery()`.  

Buildings are identified using Assessor Parcel Numbers (APNs).  The requested APN is read from url params with the function `helpers.getUrlVars()`.  The AJAX request to DataSF is made using `apiCalls.propertyQuery()`, which is a wrapper around the [soda-js](https://github.com/socrata/soda-js) library.

If the APN doesn't exist, the page gives the error message "The record for the chosen building was not found".

If a requested property is of an unsupported use type (supported building types are "Office", "Hotel", or "Retail Store"), the page displays the message "The chosen building type is not supported by this dashboard interface".  Supported building types are defined as keys in the `Dashboard.groups` object.

If a building doesn't have data for the latest year, the page will show the data for the latest year available.

If a building has *never* complied, the page will display a message saying "{BUILDING NAME} could not be ranked against other {BUILDING TYPE}s using the latest benchmark data." 

The code in `src/js/` is roughly split into modules by function: 
- dashboard.js: form query, make request, handle data, update page. 
- apiCalls.js: wrapper around the soda-js library and helper functions for constructing query strings
- dataManipulation.js: functions to manipulate and parse the query response from DataSF
- helpers.js: miscellaneous helper functions

javascript files for individual pages (estar, ghg, eui) in `src` set options and functions that are unique to each page
