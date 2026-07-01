# Convertly Backend

## Launch

Start PostgreSQL and pgAdmin:

```sh
docker-compose up -d database pgadmin
```

Start the backend:

```sh
./bin/mvn-local spring-boot:run -Dspring-boot.run.profiles=postgres
```

If port `8080` is busy:

```sh
./bin/mvn-local spring-boot:run -Dspring-boot.run.profiles=postgres -Dspring-boot.run.arguments=--server.port=8081
```

## Access The Database

Open pgAdmin:

```text
http://localhost:5050
```

pgAdmin login:

```text
Email: admin@convertly.dev
Password: convertly
```

PostgreSQL connection:

```text
Host: database
Port: 5432
Database: convertly
Username: convertly
Password: convertly
```

Tables are here:

```text
Servers > Convertly PostgreSQL > Databases > convertly > Schemas > public > Tables
```
