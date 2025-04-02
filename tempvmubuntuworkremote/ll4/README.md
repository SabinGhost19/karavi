## Laborator 4 - Docker Compose

- [x] Angular Frontend
- [x] Node.js Backend
- [x] PostgreSQL Database

```sh
docker container run --name database --network lab4-std -d laborator/todo-postgres
docker container run --name todo-backend --network lab4-std -p 3000:3000 -d laborator/todo-backend
docker container run --name todo-frontend --network lab4-std -p 8080:80 -d laborator/todo-frontend
```