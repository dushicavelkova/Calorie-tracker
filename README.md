# Calorie Tracker

## Description

Calorie Tracker is a web application for tracking daily food intake and calories.

The application allows users to add and manage meals, calculate calories and macronutrients, and select food items from a predefined database.

The project is implemented as a three-tier application consisting of:

* **Frontend** – HTML, CSS and JavaScript with Nginx
* **Backend** – Node.js and Express.js
* **Database** – PostgreSQL

The application is containerized using Docker and Docker Compose and is also deployed using Kubernetes.

## Features

* Add meals
* Select food from a predefined food database
* Enter quantity and unit
* Calculate calories
* Track protein, carbohydrates and fat
* Filter meals by meal type
* Edit meals
* Delete meals
* Display daily calorie intake
* Set a daily calorie goal

## Technologies

* HTML
* CSS
* JavaScript
* Node.js
* Express.js
* PostgreSQL
* Docker
* Docker Compose
* Kubernetes
* GitHub Actions
* Docker Hub
* Nginx

## Architecture

The application consists of three main services:

```text
                Browser
                   |
                   v
              Frontend
               Nginx
                   |
                   v
              Backend
             Node/Express
                   |
                   v
              PostgreSQL
```

The frontend communicates with the backend through an HTTP API, while the backend communicates with PostgreSQL for data storage.

## Docker

The frontend and backend are containerized using Docker.

### Docker Hub Images

* Backend: `dushicavelkova/calorie-backend`
* Frontend: `dushicavelkova/calorie-frontend`

## Docker Compose

Docker Compose is used to run all application services locally.

The database credentials are stored in an `.env` file instead of being hardcoded directly in `docker-compose.yml`.

Example:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=calories_db
```

The `.env` file is excluded from Git using `.gitignore`.

### Start the application

```bash
docker compose up --build
```

The application is available at:

```text
http://localhost:8080
```

### Stop the application

```bash
docker compose down
```

## CI/CD

GitHub Actions is used to automate the build and delivery process.

The workflow is triggered when changes are pushed to the `master` branch.

The workflow:

1. Checks out the repository.
2. Logs in to Docker Hub using GitHub Secrets.
3. Builds the backend Docker image.
4. Pushes the backend image to Docker Hub.
5. Builds the frontend Docker image.
6. Pushes the frontend image to Docker Hub.

The CI workflow is defined in:

```text
.github/workflows/ci.yml
```

## Kubernetes

The application is also configured for deployment on Kubernetes.

All Kubernetes resources are deployed in the following namespace:

```text
calorie-tracker
```

The project uses:

* Namespace
* Backend Deployment
* Frontend Deployment
* Backend Service
* Frontend Service
* PostgreSQL StatefulSet
* PostgreSQL Service
* PersistentVolumeClaim
* ConfigMap
* Secret
* Ingress

The backend and frontend deployments use two replicas.

PostgreSQL is deployed using a StatefulSet because the database requires persistent storage.

## Kubernetes Architecture

```text
                    Ingress
                       |
             ---------------------
             |                   |
             v                   v
      Frontend Service     Backend Service
             |                   |
       2 Frontend Pods      2 Backend Pods
                                   |
                                   v
                             DB Service
                                   |
                                   v
                           PostgreSQL Pod
                           StatefulSet
                                   |
                                   v
                                  PVC
```

The Ingress routes requests as follows:

```text
/       -> frontend-service
/api    -> backend-service
```

### Deploy to Kubernetes

The Kubernetes resources can be deployed using:

```bash
kubectl apply -f k8s/
```

Check the running pods:

```bash
kubectl get pods -n calorie-tracker
```

Check the services:

```bash
kubectl get services -n calorie-tracker
```

Check the Ingress:

```bash
kubectl get ingress -n calorie-tracker
```

The application can be accessed through:

```text
http://calorie-tracker.local
```

## Project Structure

```text
calorie-tracker/
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── script.js
│   └── nginx.conf
│
├── k8s/
│   ├── namespace.yaml
│   ├── db-configmap.yaml
│   ├── db-statefulset.yaml
│   ├── db-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   └── secret.yaml
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .env
├── .gitignore
├── docker-compose.yml
└── README.md
```

## GitHub Repository

[GitHub Repository](https://github.com/dushicavelkova/Calorie-tracker)

## Docker Hub

Backend image:

```text
dushicavelkova/calorie-backend:latest
```

Frontend image:

```text
dushicavelkova/calorie-frontend:latest
```

## Security

Sensitive configuration values such as database credentials are stored in environment variables and are not committed to the public repository.

The `.env` file is included in `.gitignore`.

Kubernetes database credentials are stored using a Kubernetes Secret.

## Conclusion

Calorie Tracker demonstrates the development and deployment of a containerized web application using a modern software development workflow.

The project combines a frontend, backend and PostgreSQL database with Docker, Docker Compose, Kubernetes, GitHub Actions and Docker Hub.
