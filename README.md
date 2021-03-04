<p align="center">
  <a href="http://nestjs.com/" target="blank">
  <img src="https://raw.githubusercontent.com/neuvieme-page/nestjs-starter/master/preview.png" width="100%" alt="Nest Logo" /></a>
</p>

# Neuviemepage - Nest.js Starter 

A typescript starter for headless api based on [Nest.js](https://github.com/nestjs/nest)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

---

## Features

- Typeorm
- Scalable multi-provider authentication 
  - Email / Password strategy
  - Twitter strategy 
  - JWT strategy
- Automatic deploy to heroku
- Automatic OpenAPI documentation generated with `swagger`
- Built-in backoffice using `nestjs-admin`
- Docker-compose services for database generation and administration

## Installation

```bash
$ npm install
```

## Running the app

Setup `.env`

```
BASE_URL="http://127.0.0.1:9999"
APP_SECRET="1234"
DB_NAME="nest-starter-db-name"
DB_USER="user"
DB_PASSWORD="user"
DB_HOST="localhost"
DB_PORT="5432"
ENV="development"
RUN_MIGRATIONS="true"
TYPEORM_SEEDING_SEEDS=src/**/*.seed.ts
```

Launch database 

Make sure there is no other postgres process runnning on port `5432`.

```bash
$ docker-compose up -d
```

Launch application

```bash
$ npm run dev
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).


## TODO

- Finish implement unit testing
- Add husky and lint on commit

