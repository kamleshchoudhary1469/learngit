# steps for creating NodeJs Express And Mongo Db with store procedure project (Typescript)

## Project setup

```

    **Need to npm init and create package file**
        npm init

    **Need to install typescript as dev dependency**
        npm install --save-dev typescript

    **Now create tsconfig through**
        npx tsc --init

    And provide values
    ex: {
        "compilerOptions": {
            "target": "es6",
            "module": "commonjs",
            "moduleResolution": "node",
            "sourceMap": true,
            "rootDir": "./src",
            "outDir": "dist",
            "esModuleInterop": true,
            "forceConsistentCasingInFileNames": true,
            "useUnknownInCatchVariables": false,
            "strict": true,
            "skipLibCheck": true
        },
        "lib": ["es2015"],
        "exclude": [
            "node_modules"
        ],
        "include": [
            "./src/**/*.ts"
        ]
    }

    **Now install base packages which need for nodejs express as dependency**
        npm i dotenv express cors

    **Now the development dependency**
        npm install --save-dev @types/express @types/node @types/cors ts-node nodemon

    **Now you can configure TypeScript linting for the project. First, we install eslint using npm**
        npm install --save-dev eslint
        npx eslint --init
    Answer the following questions
    Ex.

        How would you like to use ESLint? :------> To check syntax and find problems
        What type of modules does your project use? :------> JavaScript modules (import/export)
        Which framework does your project use? :------> None of these
        Does your project use TypeScript? :------> Yes
        Where does your code run? :------> Node
        What format do you want your config file to be in? :------> JSON



    **This will help in proper typescript format**
    Run the linter to check all files with the .ts TypeScript extension
        npx eslint . --ext .ts

```

## Some operations on data | entity which can be read as events

```

    1. CommentCreated
    2. CommentUpdated
    3. CommentModerated
    4. CommentUpvoted
    5. CommentDownvoted
    6. CommentPromoted
    7. CommentAnonymized
    8. CommentSearchable
    9. CommentAdvertised

```

## Dockerfile Commands

```
    FROM        node:alpine

    WORKDIR     /app

    COPY        package.json ./

    RUN         npm install

    COPY        ./ ./

    CMD         ["npm", "start"]

```

## Docker Commands

## Docker provides the isolated environment to your project in which it need to run

```
    docker build -t tag_name_to_docker_img .            // Note last . show the path to Dockefile  // create docker img of project

    docker run [image id or image tag]                  // it will run your

    docker run -d -p 80:80 [image id or image tag]      // it will run and detached and map the port

    docker run -it [image id or image tag] [cmd]        // ex. docker run 4d3aae8d9aa0 sh   // linux shell cmd // create container

    docker ps                                           // list out running container

    docker ps -a                                        // all containers

    docker ps -l                                        // Latest created container

    docker ps -n=-1                                     // n last created containers

    docker ps -s                                        // docker ps -s

    docker container ls                                 // It is used to list all the running containers

    docker container ls -a                              //

    docker exec -it [container id] [cmd]                // ex. docker exec -it ae8d9aa04nfd sh  // it will get to internal to sh

    docker images                                       // it will list out all images

    docker logs [container id]

    docker rm -f [container id] [cmd]                   //

    docker push [image id or tag]

```

## usefull docker commmand

list out all running container

```
    docker ps
```

list out all container [ running || stop || exited ]

```

    docker ps -a

```

list out all docker images

```
    docker images
```

delete docke image

```
    docker image rm [imageId]

```

stop docker container

```
    docker stop [container id]

```

create network

```

    docker network create [network-name]

```

get all inspect network

```

    docker network ls

```

inspect network

```

    docker network inspect [network-name]

```

run a docker images

```

    -d = to run in detached mode
    -e = to expose container port
    -p = port forwading
        example :
        -p 80:3000
        here port 80 refers to host port [server port]
        and port 3000 refers to container port


    docker run -d -e 3000 -p 80:3000 image-name:image-tag

```

to check docker container logs

```

    docker logs [containerId]

```

to check docker container status/ statistics [mem usage and cpu usage]

```
    docker stats [containerId]
        OR
    docker stats

```

to connect to a running container [ssh to container]

```
    docker exec -it [containerId] /bin/bash

```

remove stopped container

```

     docker container prune

```

## Kubernetes information

```
    Kubernetes Cluster          // A collactions of nodes + a master to manage them

    Node                        // A Virtual machine that will run our conatiner

    Pod                         // More or less a running containers, Technically, a pod can run multiple containers

    Deployment                  // Monitors a set of pods, make sure they are running and restarts them if they crash

    Service                     // Provides an easy-to-remember URL to access a running container

```

## Kubernetes yaml file with kind Pod, ex. file - No file, you need to create a file with below code .yaml

```

apiVersion: v1      // K8s is extensible -we can add in our own custom objects. This specifies the set of objects we want K8s to look at
kind: Pod           // The type of object we want to create ex. Pod | Deployment
metadata:           // Config options for the object we are about to create
  name: posts       // When the pod is created, give it a name of 'posts'
spec:               // The exact attributes we want to apply to the object we are about to create
  containers:       // We can create many containers in a single pod
      - name: posts // Make a container with a name of 'posts'
        image: vishal/posts:0.0.1   // the exact image we want to use [image id / tag]
```

## Kubernetes Pod run cmds

```

    kubectl get pods                                // Print out the information about all of the running pods

    kubectl exec -it [pod_name] [cmd]               //  Execute the given commands in an running pod

    kubectl logs [pod_name]                         // Print out logs from the given pod

    kubectl delete pod [pod_name]                   // Deletes the given pod

    kubectl apply -f [config file name]             // Tells kubernetes to process the config // posts.yaml

    kubectl describe pod [pod_name]                 // Print out some information about the running pod


```

## Kubernetes yaml file with kind Deployment, ex. file - infra/k8s/posts-depl.yaml this file also contain service kind

apiVersion: apps/v1 // Note we want to run all inside apps
kind: Deployment // It will make sure to run pod after they crash
metadata:
name: posts-depl
spec:
replicas: 1
selector:
matchLabels:
app: posts
template:
metadata:
labels:
app: posts
spec:
containers: - name: posts
image: vishal/posts

## Kubernetes Deployment run cmds

```

    kubectl get deployments                         // Print out the information about all of the running deployments

    kubectl describe deployment [depl_name]         // Print out some information about the running deployments

    kubectl apply -f [config file name]             // Tells kubernetes to process the config // posts.yaml

    kubectl delete deployment [depl_name]           // Deletes the given deployment

    kubectl rollout restart deployment [depl_name]  // to deploye lates build // first create latest build // in case of already depl created

```

## Kubernetes Types of Services

```
    Cluster IP              // Set up an easy-to-remember URL to access a pod. Only exposes pod in the cluster

    Node Port               // Makes a pod accessible from outside the cluster. Usually only used for dev purposes
                            // (it will provide an clusterIp and random generate port, with it you can directly put this port after 127.0.0.1 and check the service, do not use it for production)

    Load Balancer           // Makes a pod accessible from outside the Cluster. This is the right way to expose a pod to the outside world

                            // Above both  work different

    External Name           // Redirects an in-cluster request to a CNAME url

```

## Kubernetes yaml file with kind Service, ex. file - No file, you need to create a file with below code .yaml

apiVersion: v1
kind: Service
metadata:
name: posts-srv
spec:
type: NodePort
selector:
app: posts
port: - name: posts
protoclo: TCP
port: 4000
targetPort: 4000

## Kubernetes Service run cmds

```

    kubectl get services                         // Print out the information about all of the running services

```

## steps to create image then push to docker account then create deplyment and then create cluster IP service & Wire it all up

```
  1. Buils an image for the Event Bus
  2. Push the image to Docker Hub / Docker registry
  3. Create a deployment for Event Bus // if already deployment then rollout and restart the deployment
  4. Create a Cluster IP Service for Event Bus and posts
  5. Wire it all up!   - Next one How to get communicate between services

```

## How To Communicate Between Services

```
  As we are creating the kubernetes service in yaml file we are providing the name to the service below,
  the same name need to put on the urls ex. http://127.0.0.1:4000 Will replace to http://posts-srv:4000

```

## Load Balancer & Ingress Nginx Service

```
  Load Balancer Service           // Tells Kubernetes to reach out to its provider and provision a load balancer. Gets traffic in to a single pod

  Ingress Or Ingress Controller   // A pod with a set of routing rules to distribute traffic to other services


  For getting ingress-nginx to kubernetes

  1. Visit below url
    https://kubernetes.github.io/ingress-nginx/deploy/#quick-start

  2. Get ingress-nginx yaml config and apply it to kubernetes
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.2.0/deploy/static/provider/cloud/deploy.yaml

  3. After adding above ingress-nginx to kubernetes, you can check the pods with cmd
    kubectl get pods -n ingress-nginx

  Then you need to create a kubernetes config file (yaml file) with providing ingress kind which you can get below

```

## Kubernetes yaml file with kind Ingress

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: 'true'
spec:
  rules:
    - host: posts.com
      http:
        paths:
          - path: /posts-create
            pathType: Prefix
            backend:
              service:
                name: posts-srv
                port:
                  number: 4000
          - path: /get-all-posts
            pathType: Prefix
            backend:
              service:
                name: query-srv
                port:
                  number: 4002
          - path: /posts/?(.*)/comments
            pathType: Prefix
            backend:
              service:
                name: comments-srv
                port:
                  number: 4001
          - path: /?(.*)
            pathType: Prefix
            backend:
              service:
                name: client-srv
                port:
                  number: 3000

```

## Skaffold use in development environment only, for production -> (update code -> build img -> push to docker -> rollout restart dep)

1.  Need to download sakffold exe file and place it in environment veriables
    C:\Skaffold\skaffold.exe // you need to place it in user veriables path // rename file to skaffold.exe after download
2.  I found that skaffold not working with my windows machine, so I put the path + copy skaffold exe file to projects and run cmd
    skaffold init

        it will aks the image source, provide Dofilefile
        Next enter and enter

3.  Make sure to add

```
build:
  local:
    push: false
```

    it will not push the code to docker and run it

4. make sure to run internal project with nodemon as it will work with restart mechanism

## Kubernetes Secret create cmd

```
    kubectl create secret generic jwt-secret --from-literal=JWT_KEY=gcGMVTx5GAvjD2SadsD6

    kubectl get secret // get all secrets
```

## calling any specific url from pod to ingrss

```
  // kubctl get namescape // it will bring all namespace // kubctl get services -n ingress-nginx  // it will give name of ingress-nginx
  // const response = await axios.get('http://SERVICENAME.NAMESPACE.svc.cluster.local/api/users/currentuser');
```

## skaffold yam just fror refrences

1.

```
apiVersion: skaffold/v2beta28
kind: Config
metadata:
  name: ticketing
build:
  artifacts:
  - image: vrkothekar/auth
    context: auth
    buildpacks:
      builder: gcr.io/buildpacks/builder:v1
  - image: vrkothekar/client
    context: client
    buildpacks:
      builder: gcr.io/buildpacks/builder:v1
deploy:
  kubectl:
    manifests:
    - infra/k8s/*
```

2.

```
apiVersion: skaffold/v2beta28
kind: Config
metadata:
  name: ticketing
deploy:
  kubectl:
    manifests:
    - infra/k8s/*
build:
  artifacts:
  - image: vrkothekar/auth
    context: auth
    docker:
      dockerfile: Dockerfile
    sync:
      manual:
        - src: 'src/**/*.ts'
          dest: .
  - image: vrkothekar/client
    context: client
    docker:
      dockerfile: Dockerfile
    sync:
      manual:
        - src: '**/*.js'
          dest: .
  local:
    push: false

```

# docker-registry :

## Laucnh EC2 with Ubuntu 20.04

​

```
    sudo apt update
```

## Download the Latest Docker Version

​

```
   sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

## Install a prerequisite packages which let apt utilize HTTPS

```
   sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

## Add GPG key for the official Docker repo to the Ubuntu system

```
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

## Add the Docker repo to APT source

```
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
   sudo apt update
```

​

## Install Docker software:

​

```
    sudo apt install docker-ce
```

​

## Docker Status:

​

```
    sudo systemctl status docker
```

## To avoid using sudo for docker activities, add your username to the Docker Group:

​

```
    sudo usermod -aG docker ${USER}  // ${USER} = root
```

## Install Docker Compose:

​

```
    sudo curl -L "https://github.com/docker/compose/releases/download/1.28.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

## Set permissions so that the docker-compose command is executable:

​

```
   sudo chmod +x /usr/local/bin/docker-compose
```

## Docker Version

​

```
   docker-compose --version
```

## Make Directory in root directory

​

```
    mkdir docker-registry
    cd docker-registry
```

​

## Make Docker Compose File

​

```
    nano docker-compose.yml
```

## Content of docker-compose.yml

​

```
---
version: "3"
services:
  docker-registry:
    image: registry:2
    container_name: docker-registry
    ports:
      - 5000:5000
    restart: always
    volumes:
      - ./volume:/var/lib/registry
  docker-registry-ui:
    image: konradkleine/docker-registry-frontend:v2
    container_name: docker-registry-ui
    ports:
      - 8080:80
    environment:
      ENV_DOCKER_REGISTRY_HOST: docker-registry
      ENV_DOCKER_REGISTRY_PORT: 5000
```

## Make Volume Folder

​

```
    mkdir volume
```

## Run Docker Compose File

​

```
   docker-compose -f docker-compose.yml up
```

​

## For Clients

​

## Set insecure-registries if connecting to http ip

​

```
   for ubunutu /etc/docker/daemon.json // crate one if not exist
​
   for windows
   open docker desktop app->settings->docker engine
​
   add following key:pair
​
   "insecure-registries":["yourIp:port"]  // "insecure-registries":["192.168.99.100:5000"]
```

## To Push Image

```
   docker tag [imageName] [host]:[port]/[repoName]/[imageName]:[tag]

   // docker tag ubuntu 192.168.99.100:5000/testrepo/ubnutu:latest
```

```
   docker push [iamgeName]
   // docker push 192.168.99.100:5000/testrepo/ubnutu:latest
```

## Add Auth To Private Docker Registry

```
   mkdir -p docker-registry/auth

```

```
   cd docker-registry
```

```
   docker run \
  --entrypoint htpasswd \
  httpd:2 -Bbn [username] [password] > auth/htpasswd
```

## Add SSL To Private Docker Registry

```
    cd docker-registry
```

```
    mkdir certs
```

```
    cd certs/
```

```
    openssl genrsa -out client.key 4096
```

```
    openssl req -new -x509 -text -key client.key -out client.cert
```

```
   copy both files in following path
```

```
 /etc/docker/certs.d/        <-- Certificate directory
    └── my-https.registry.example.com         <-- Hostname without port
       ├── client.cert                        <-- Client certificate
       ├── client.key                         <-- Client key
       └── ca.crt                             <-- Root CA that signed
                                                    the registry certificate, in PEM
```

## Changes In Docker-Compose File

```
version: "3"
services:
  docker-registry:
    image: registry:2
    container_name: docker-registry
    ports:
      - 443:443
    restart: always
    volumes:
      - ./volume:/var/lib/registry
      - /home/ubuntu/docker-registry/certs:/certs
      - /home/ubuntu/docker-registry/auth:/auth
    environment:
      REGISTRY_AUTH: htpasswd
      REGISTRY_AUTH_HTPASSWD_REALM: Registry Realm
      REGISTRY_AUTH_HTPASSWD_PATH: /auth/htpasswd
      REGISTRY_HTTP_ADDR: 0.0.0.0:443
      REGISTRY_HTTP_TLS_CERTIFICATE: /certs/client.cert
      REGISTRY_HTTP_TLS_KEY: /certs/client.key
  docker-registry-ui:
    image: konradkleine/docker-registry-frontend:v2
    container_name: docker-registry-ui
    ports:
      - 8080:80
    environment:
      ENV_DOCKER_REGISTRY_HOST: [registry-host]
      ENV_DOCKER_REGISTRY_PORT: [port]
      ENV_DOCKER_REGISTRY_USE_SSL: 1
      USERNAME: [username]
      PASSWORD: [password]
```

```
for ex.

version: "3"
services:
  docker-registry:
    image: registry:2
    container_name: docker-registry
    ports:
      - 443:443
    restart: always
    volumes:
      - ./volume:/var/lib/registry
      - /home/ubuntu/docker-registry/certs:/certs
      - /home/ubuntu/docker-registry/auth:/auth
    environment:
      REGISTRY_AUTH: htpasswd
      REGISTRY_AUTH_HTPASSWD_REALM: Registry Realm
      REGISTRY_AUTH_HTPASSWD_PATH: /auth/htpasswd
      REGISTRY_HTTP_ADDR: 0.0.0.0:443
      REGISTRY_HTTP_TLS_CERTIFICATE: /certs/client.cert
      REGISTRY_HTTP_TLS_KEY: /certs/client.key
  docker-registry-ui:
    image: konradkleine/docker-registry-frontend:v2
    container_name: docker-registry-ui
    ports:
      - 8080:80
    environment:
      ENV_DOCKER_REGISTRY_HOST: hub.docker.azlogics.com
      ENV_DOCKER_REGISTRY_PORT: 443
      ENV_DOCKER_REGISTRY_USE_SSL: 1
      USERNAME: vrkothekar
      PASSWORD: rpacpc2022
```

## My Micro pod

```
apiVersion: v1
kind: Pod
metadata:
  name: posts
spec:
  containers:
    - name:  posts
      image: 3.109.153.45:5000/tsstudy/tsposts:01
      ## STEP 8: install instantclient for oracle db

```

## STEP 8: install instantclient for oracle db

```
for reference:
https://oracle.github.io/node-oracledb/INSTALL.html#instructions

    cd /opt

    mkdir -p oracle

    cd /opt/oracle

    wget https://download.oracle.com/otn_software/linux/instantclient/1916000/instantclient-basic-linux.x64-19.16.0.0.0dbru.zip
    apt install unzip

    unzip instantclient-basic-linux.x64-19.16.0.0.0dbru.zip

    sudo apt-get install libaio1

    sudo sh -c "echo /opt/oracle/instantclient_19_16 > /etc/ld.so.conf.d/oracle-instantclient.conf"
    sudo ldconfig

```

## To reload Pm2

```
pm2 startup(Only First Time)
systemctl enable pm2-root(Only First Time)
pm2 start dist/index.js --name 4010 -i 2 --wait-ready --listen-timeout 10000
pm2 reload 4010
pm2 list
pm2 save
```

## Running Ports

```
location /api/auth/ {
        proxy_pass http://127.0.0.1:4000/;
    }

    http://15.206.124.130/api/auth/login
    http://15.206.124.130/api/auth/set-header-master
    http://15.206.124.130/api/auth/get-header-master
    http://15.206.124.130/api/auth/token
```

PORT=4100
NODE_ORACLEDB_USER="TAXCPC_AZ_DEV"
NODE_ORACLEDB_PASSWORD="Girish#5432#"
NODE_ORACLEDB_CONNECTIONSTRING="(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=152.67.6.47)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=dbv3pdb.sub08300631110.taxcpcvpnv3.oraclevcn.com)))"
ACCESS_TOKEN_SECRET=637Y#uYQ@Qk9$H83tk98tK*Dpq@Q0PY5
REFRESH_TOKEN_SECRET=S0K1@jkYVzAmnesG*LeyDxMjmKlyZ8OD
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=8h
FORMAL_DB_RECORDS=100
CASUAL_DB_RECORDS=20
ORACLE_DB_IP="152.67.6.47"
FILEPATH_TEXT_IMPORT="/u03/FVU_TEXT_IMPORT"
FILEPATH_TEXT_IMPORT_WORKING_DIR="/u03/FVU_TEXT_IMPORT_INPUT_ZIP"


############################### For OCI ubuntu ##############################
https://docs.fedoraproject.org/en-US/quick-docs/firewalld/

##################### To check status #######################################
sudo firewall-cmd --state
sudo systemctl status firewalld

#############################################################################
####### To list all the relevant information for the default zone ###
firewall-cmd --list-all

#############################################################################
####### To specify the zone for which to display the settings ###
firewall-cmd --list-all --zone=public

#############################################################################
####### To make firewalld start automatically at system start: ###
sudo systemctl enable firewalld

sudo systemctl stop firewalld

sudo systemctl disable firewalld

sudo systemctl mask firewalld

##################### Add Port ##############################################
sudo firewall-cmd --zone=public --permanent --add-port=4100/tcp
sudo firewall-cmd --reload

##################### Remove Port ###########################################
firewall-cmd --list-ports
// sudo firewall-cmd --remove-port=port-number/port-type
sudo firewall-cmd --remove-port=4100/tcp

#############################################################################
####### Make the new settings persistent: ###################################
sudo firewall-cmd --runtime-to-permanent
#############################################################################
ATBB2ZUdKEFhCfDRtcWBKx9fPjnJ5820E7B8


## STEP 6 : Domain/Subdomain attach to nginx

    creating your folder for host site taxcpc.figmentglobal.com

```
    sudo touch /etc/nginx/sites-available/taxcpc.figmentglobal.com.conf

    sudo nano /etc/nginx/sites-available/taxcpc.figmentglobal.com.conf

```

    copy below code

```
    server {
        listen 80;
        listen [::]:80;

        root /var/www/frontend-v4/build;
        index index.html index.htm index.nginx-debian.html;

        server_name taxcpc.figmentglobal.com;

        location / {
            try_files $uri $uri/ /index.html =404;
        }
    }

```
# 26as
```
    server {
        listen 80;
        listen [::]:80;

        root /var/www/frontend/build;
        index index.html index.htm index.nginx-debian.html;

        server_name 26as.figmentglobal.com;

        location / {
            try_files $uri $uri/ /index.html =404;
        }
    }

```

    Validate our Configuration and Start Nginx

```
    sudo nginx -t

    sudo ln -s /etc/nginx/sites-available/26as.figmentglobal.com.conf /etc/nginx/sites-enabled/26as.figmentglobal.com.conf

   ## sudo rm -rf /etc/nginx/sites-enabled/default

    sudo systemctl start nginx

    sudo systemctl reload nginx

    sudo systemctl status nginx

```

## STEP 7 : SSL attach to nginx

    Note

```
    to setup ssl enable port 443 from security keys

```

    Installing Certbot

```
    sudo apt install certbot python3-certbot-nginx

    sudo nginx -t

    sudo systemctl reload nginx

```

    Obtaining an SSL Certificate

```

    sudo certbot --nginx -d 26as.figmentglobal.com

```

    Note if you want to run nodejs express as backend then need to add nginx conf as follow

```

################################################
##
# You should look at the following URL's in order to grasp a solid understanding
# of Nginx configuration files in order to fully unleash the power of Nginx.
# https://www.nginx.com/resources/wiki/start/
# https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/
# https://wiki.debian.org/Nginx/DirectoryStructure
#
# In most cases, administrators will remove this file from sites-enabled/ and
# leave it as reference inside of sites-available where it will continue to be
# updated by the nginx packaging team.
#
# This file will automatically load configuration files provided by other
# applications, such as Drupal or Wordpress. These applications will be made
# available underneath a path with that package name, such as /drupal8.
#
# Please see /usr/share/doc/nginx-doc/examples/ for more detailed examples.
##

# Default server configuration
#
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

upstream websocketserver {
    server localhost:4100; # appserver_ip:ws_port
}

server {
        listen 80 default_server;
        listen [::]:80 default_server;

        # SSL configuration
        #
        # listen 443 ssl default_server;
        # listen [::]:443 ssl default_server;
        #
        # Note: You should disable gzip for SSL traffic.
        # See: https://bugs.debian.org/773332
        #
        # Read up on ssl_ciphers to ensure a secure configuration.
        # See: https://bugs.debian.org/765782
        #
        # Self signed certs generated by the ssl-cert package
        # Don't use them in a production server!
        #
        # include snippets/snakeoil.conf;

        # root /var/www/html;

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        server_name _;

        # For Time incresing
        proxy_connect_timeout 3600s;
        send_timeout 3600s;
        proxy_read_timeout 3600s;

        # For Frontend
        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                # try_files $uri $uri/ =404;
                root /var/www/frontend-v4/build;
                try_files $uri /index.html;
        }

        # For xlsx
        location ~* .(xlsx)$ {
                root /var/www/frontend-v4/;
        }

        # For txt || zip
        location ~* .(txt|zip)$ {
                root /home/ubuntu/taxcpc/bulk_upload/public/;
        }

        # Auth at 4000
        location /api/auth/ {
                proxy_pass http://localhost:4000/;
        }

        # Filter at 4002
        location /api/filter/ {
                proxy_pass http://localhost:4002/;
        }

        # Setting at 4001
        location /api/settings/ {
                proxy_pass http://localhost:4001/;
        }

        # Transactions at 4003
        location /api/transactions/ {
                proxy_pass http://localhost:4003/;
        }

        # Challan details at 4004
        location /api/challan-details/ {
                proxy_pass http://localhost:4004/;
        }

        # TDS Return at 4005
        location /api/tds-return/ {
                proxy_pass http://localhost:4005/;
        }

        # Allocation at 4006
        location /api/allocation/ {
                proxy_pass http://localhost:4006/;
        }

        # Request Downloads at 4007
        location /api/downloads/{
                proxy_pass http://localhost:4007/;
        }

        # Validation Process at 4008
        location /api/validations/ {
                proxy_pass http://localhost:4008/;
        }

        # Bulk Upload at 4010
        location /api/bulk-upload/ {
                proxy_pass http://localhost:4010/;
        }

        location /websocket {
                proxy_pass http://websocketserver;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection $connection_upgrade;
                proxy_http_version 1.1;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $http_host;
                proxy_intercept_errors on;
                proxy_redirect off;
                proxy_cache_bypass $http_upgrade;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-NginX-Proxy true;
                proxy_ssl_session_reuse off;
        }

        # pass PHP scripts to FastCGI server
        #
        #location ~ \.php$ {
        #       include snippets/fastcgi-php.conf;
        #
        #       # With php-fpm (or other unix sockets):
        #       fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        #       # With php-cgi (or other tcp sockets):
        #       fastcgi_pass 127.0.0.1:9000;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #       deny all;
        #}
}


# Virtual Host configuration for example.com
#
# You can move that to a different file under sites-available/ and symlink that
# to sites-enabled/ to enable it.
#
#server {
#       listen 80;
#       listen [::]:80;
#
#       server_name example.com;
#
#       root /var/www/example.com;
#       index index.html;
#
#       location / {
#               try_files $uri $uri/ =404;
#       }
#}

###############################################

## Windows NODE_ENV
PORT=4014
NODE_ORACLEDB_USER="TAXCPC_AZ_DEV"
NODE_ORACLEDB_PASSWORD="Girish#5432#"
NODE_ORACLEDB_CONNECTIONSTRING="(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = 192.168.2.220)(PORT = 1921)) (CONNECT_DATA = (SERVER = DEDICATED) (SERVICE_NAME = orcl19cN)))"
ACCESS_TOKEN_SECRET=637Y#uYQ@Qk9$H83tk98tK*Dpq@Q0PY5
REFRESH_TOKEN_SECRET=S0K1@jkYVzAmnesG*LeyDxMjmKlyZ8OD
ACCESS_TOKEN_EXPIRY=8h
REFRESH_TOKEN_EXPIRY=8h
ORACLE_CLIENT_EXEC_PATH="C:\\oracle\\instantclient_19_16"