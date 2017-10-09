# node-akumuli
A data ingestion and visualization framework based on openresty, Akumuli and Grafana

![Grafana snapshot](/grfana.PNG)

The purpose of this project is to create a simple, yet fast data visualization framework for simple charting and monitoring needs. 

This project consists of 3 parts 

- An openresty based nginx interface to ingest HTTP JSON data straight into Akumuli (optional, data can be stored into Akumuli by any other means as well)
- Akumuli running as a time series database and aggregation server. 
- A nodejs based app running as a simple JSON data source, feeding information from Akumuli to your grafana instance.

# Get Started

1. Install openresty from http://openresty.org/
2. Install and run Akumuli with standard configuration http://akumuli.org/
3. Created a hosted grafana instance or download and run a copy on the same machine from https://grafana.com/

Once everything is ready, run the nginx workers

```
PATH=/usr/local/openresty/nginx/sbin:$PATH

cd nginx
nginx -p `pwd`/ -c conf/nginx.conf

```

Once the nginx servers are running you could feed JSON data via POST method to the local endpoint. Example

```
curl -i -X POST http://localhost:8080/set -d '{"temperature": 12, "humidity": 89}'

```
This will create two time series - temperature and humidity into Akkumuli
Then open another command prompt and start nodejs server

```
node index.js

```

Once the nodejs server is running, point Grafana to your server instance and start charting. Its as simple.

# Aggregation function

An optional aggregation function can be specified by appending the function name with series name after a colon. E.g. to get the max value of temperature during the aggregation period 

```
temperature:max

```
Following aggregation functions are supported 

- count - total number of data points in the series (or in time range)
- max - largest value in the series (or in time range)
- min - smallest value in the series (or in time range)
- mean - mean value of the series (or in time range)
- sum - sum of all data points in the series (or in time range)



# Tag support

Though the series names will be autosuggested in grafana, you could add multiple tags to your series in order to filter your results. E.g.

```
temperature sensor=1 

```
will add **where** filter in Akumuli query with sensor:["1"] query. Any combination of tags is supported. 

# Roadmap

Please feel free to contribute your suggestions, thoughts on what you would like to see. Pull requests are welcome!








