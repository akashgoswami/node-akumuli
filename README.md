# node-akumuli
A data ingestion and visualization framework based on openresty, Akumuli and Grafana

The purpose of this project is to create a simple, yet fast data visualization framework for simple charting and monitoring needs. 

This project consists of 3 parts 

- An openresty based nginx interface to ingest HTTP JSON data straight into Akumuli
- Akumuli running as a time series database
- A nodejs based server running as a simple JSON data source , feeding information from Akumuli to your grafana instance.

# Get Started

1. Install openresty from http://openresty.org/
2. Install and run Akumuli with standard configuration http://akumuli.org/
3. Created a hosted grafana instance or download and run a copy on the same machine from https://grafana.com/

Once everything is ready, run the nginx workers

````
PATH=/usr/local/openresty/nginx/sbin:$PATH

cd nginx
nginx -p `pwd`/ -c conf/nginx.conf

```

Once the nginx servers are running you could feed JSON data via POST method to the local endpoint. Example

````
curl -i -X POST http://localhost:8080/set -d '{"temperature": 12, "humidity": 89}'

```


Then open another command prompt and start nodejs server

````
node index.js

```

Once the nodejs server is running, point Grafana to your server instance and start charting. Its as simple.


# Roadmap

Please feel free to contribute your suggestions, thoughts on what you would like to see. Pull requests are welcome!








