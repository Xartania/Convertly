# Convertly Frontend

React, TypeScript, and Tailwind CSS frontend for Convertly.

## Launch

Install dependencies:

```sh
npm install
```

Start the Vite dev server:

```sh
npm run dev
```

The app runs on:

```text
http://localhost:5173
```

The frontend talks to the Spring Boot backend at `http://localhost:8080` by default.
Override it with:

```sh
VITE_API_URL=http://localhost:8081 npm run dev
```

## Backend

From `web/backend`, start the API:

```sh
./bin/mvn-local spring-boot:run
```

The landing page uses:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/projects
```
