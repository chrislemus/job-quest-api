![app-deployment](https://github.com/chrislemus/job-quest-api/actions/workflows/deployment.yaml/badge.svg)

# Job Quest API

Job Quest API with easy-to-use swagger UI.
[Frontend Repo](https://github.com/chrislemus/job-quest)

**Table of Contents**

- [Job Quest API](#job-quest-api)
  - [Technology Stack](#technology-stack)
  - [Deployment](#deployment)
  - [Installation](#installation)

## Technology Stack

1. NestJS with Typescript (framework)
2. PostgreSQL Database (storage)

## Deployment

GitHub actions handle app deployment. Deployment configurations can be found in `.github/workflows`.

## Installation

1. Download this repository
2. Run the node version specified in `.nvmrc`.
   - You could run `nvm use` if you have [nvm](https://github.com/nvm-sh/nvm) installed in your machine.
3. Install dependencies `npm install`
4. \*Provide env variables outlined in `src/config.schema`
5. Run the app
   - `npm run start` development
   - `npm run start:dev` npm run start:dev
   - `npm run start:prod` production mode

\*You must provide a URL to a running database instance for the DATABASE_URL environment variable. If you already have docker installed in your machine, run `docker-compose up db-local` to spin up a PostgresSQL container.
