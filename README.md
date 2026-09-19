# Calorie Tracker

## Опис

Calorie Tracker е веб-апликација за следење на дневниот внес на храна и калории.

Апликацијата овозможува додавање и управување со оброци, пресметување на калории и макронутриенти и избор на храна од база на податоци.

Проектот е реализиран како апликација со три главни сервиси:

* **Frontend** – HTML, CSS и JavaScript со Nginx
* **Backend** – Node.js и Express
* **Database** – PostgreSQL

Проектот е containerized со Docker и Docker Compose, а дополнително е поставен и на Kubernetes.

## Функционалности

* Додавање оброк
* Избор на храна од база на податоци
* Внесување количина и единица
* Пресметување калории
* Прикажување протеини, јаглехидрати и масти
* Филтрирање според тип на оброк
* Уредување на оброци
* Бришење на оброци
* Прикажување на дневен калориски внес
* Дефинирање на дневна калориска цел

## Технологии

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

## Архитектура

Апликацијата се состои од три сервиси:

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

Frontend комуницира со backend преку HTTP API, а backend ја користи PostgreSQL базата за складирање на податоците.

## Docker

Frontend и backend имаат сопствени Docker images.

### Docker Hub

* Backend: `dushicavelkova/calorie-backend`
* Frontend: `dushicavelkova/calorie-frontend`

## Docker Compose

Docker Compose се користи за локално стартување на сите сервиси.

Потребно е да се има `.env` фајл со потребните environment variables.

Стартување:

```bash
docker compose up --build
```

Апликацијата потоа е достапна на:

```text
http://localhost:8080
```

За запирање на сервисите:

```bash
docker compose down
```

## Environment Variables

Чувствителните вредности не се зачувуваат директно во `docker-compose.yml`.

Тие се поставуваат преку `.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=calories_db
```

`.env` е додаден во `.gitignore` и не се push-ува на GitHub.

## CI/CD

За автоматизација се користи **GitHub Actions**.

При секој `push` на `master` branch:

1. Се checkout-ира repository-то.
2. GitHub Actions се логира на Docker Hub преку GitHub Secrets.
3. Се build-ира backend Docker image.
4. Се push-ува backend image на Docker Hub.
5. Се build-ира frontend Docker image.
6. Се push-ува frontend image на Docker Hub.

Во проектот е имплементиран CI процес за автоматско build и push на Docker images.

Kubernetes deployment-от моментално се извршува преку Kubernetes manifests.

## Kubernetes

Kubernetes ресурсите се организирани во посебен namespace:

```text
calorie-tracker
```

Проектот користи:

* Namespace
* Deployment за frontend
* Deployment за backend
* Service за frontend
* Service за backend
* Ingress
* StatefulSet за PostgreSQL
* PersistentVolumeClaim
* ConfigMap
* Secret

Frontend и backend користат по две replicas.

PostgreSQL е поставен како StatefulSet бидејќи базата има потреба од persistent storage.

## Kubernetes архитектура

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

Ingress ги рутира HTTP барањата:

```text
/       -> frontend-service
/api    -> backend-service
```

## Kubernetes стартување

Namespace и останатите ресурси може да се постават со:

```bash
kubectl apply -f k8s/
```

Проверка на ресурсите:

```bash
kubectl get pods -n calorie-tracker
```

```bash
kubectl get services -n calorie-tracker
```

```bash
kubectl get ingress -n calorie-tracker
```

Апликацијата може да се пристапи преку:

```text
http://calorie-tracker.local
```

## GitHub Repository

GitHub repository:

https://github.com/dushicavelkova/Calorie-tracker

## Docker Images

Backend:

```text
dushicavelkova/calorie-backend:latest
```

Frontend:

```text
dushicavelkova/calorie-frontend:latest
```

## Структура на проектот

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

> Забелешка: `.env` и Kubernetes Secret со вистински credentials не треба да се commit-ираат во јавниот repository.
