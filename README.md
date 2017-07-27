# [SF-Environment-Benchmark](http://codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/)
Set of applications to visualize SF building energy consumption and greenhouse gas emissions.

This project is part of [Data Science Working Group at Code for San Francisco](https://github.com/sfbrigade/data-science-wg)

## Project Description
The original goal of the SF Environment Benchmark project was to visualize building energy consumption and greenhouse gas emissions to encourage owners and building managers to make proper changes. In addition we would like to analyze the data available to see if we can predict what energy consumption or emissions will be like in the future. We've currently developed a prototype web application that visualizes the data in an interactive format. In addition, we'll be meeting with the SF Department of Environment, who are the stewards of the data, to see what their needs and requirements are. We can cater the project to their needs and requirements to make sure to solve problems at hand. 
[original dataset here](https://data.sfgov.org/Energy-and-Environment/Existing-Commercial-Buildings-Energy-Performance-O/j2j3-acqj)

### Live links
 - [SF Energy and GHG Map Visualization](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/map)
 - [SF Environment Benchmark Dashboards (Example building):](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/)
     + [Energy Star](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/dashboard/estar.html?apn=3705/039)
     + [EUI](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/dashboard/eui.html?apn=3705/039)
     + [GHG](http://old.codeforsanfrancisco.org/datasci-SF-Environment-Benchmark/dashboard/ghg.html?apn=3705/039)
 - [Mocks up for building-profile dashboard](https://projects.invisionapp.com/share/2SAI4AK48#/screens/219556065_SF-Environment-Benchmark)



## Contributing DSWG Members
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

## Tech
- D3
- Leaflet
- Mapbox.js

## Contributing

At the moment, this project is on hold as we wait to hear back from the Department of Environment.  If there's something you want to help out with, here's how to get started:  

[Fork this repo](https://help.github.com/articles/fork-a-repo/), then clone your repo locally
```
$ git clone <your-repo>
$ cd <this-repo's-name>
$ git remote add upstream <this-repo>
```
Launch a local server.  If you're on a Mac, you already have [SimpleHTTPServer](http://www.pythonforbeginners.com/modules-in-python/how-to-use-simplehttpserver/) installed:  
```
$ cd path/to/local/clone
$ python -m SimpleHTTPServer
```
You could also use [http-server](https://www.npmjs.com/package/http-server) if you wanted  
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
...  
Profit!
