# library-api

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
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

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

# Testing app

## Create user

**POST /users**

body:

```
{
  "firstName": "string",
  "lastName": "string",
  "description": "string"
}
```

return:

```
201 No Content
```

Example

```bash
curl --location --request POST 'http://localhost:3000/users' \
--header 'accept: */*' \
--header 'Content-Type: application/json' \
--data-raw '{
  "firstName": "string",
  "lastName": "string",
  "description": "string"
}'
```

## Get users

**GET /users**

return:

```json
200
[
   {
        "_id": "6239bacdf68082cc34f42b9b",
        "firstName": "string",
        "lastName": "string",
        "status": "active",
        "description": "string",
        "__v": 0
    }
]
```

Example

```bash
curl --location --request GET 'http://localhost:3000/users' \
--header 'accept: */*'
```

## Create a book

**POST /books**

body:

```
{
  "ISBN": "978-3-16-148410-0",
  "name": "The Book",
  "author": "Mark",
  "description": "Info",
  "number": 10
}
```

- `ISBN` is unique. App will throw error in case user enter duplicate `ISBN`
- `number` is numbers of book copies will create in database

return:

```
201 No Content
```

Example

```bash
curl --location --request POST 'http://localhost:3000/books' \
--header 'accept: */*' \
--header 'Content-Type: application/json' \
--data-raw '{
  "ISBN": "978-3-16-148410-0",
  "name": "The Book",
  "author": "Mark",
  "description": "Info",
  "number": 10
}'
```

## Delete a book

**DELETE /books/{bookId}**

- App will remove all book and book copies.

return:

```
201 No Content
```

Example

```bash
curl --location --request DELETE 'http://localhost:3000/books/6239badff68082cc34f42b9e' \
--header 'accept: */*'
```

## Get list books copies

**GET /book-copies**

- Return all book copies

return

```json
200
[
    {
        "_id": "6239bbf621fae715f9964ca6",
        "bookId": {
            "_id": "6239bbf621fae715f9964ca4",
            "ISBN": "978-3-16-148410-1",
            "name": "The Book 2",
            "author": "Mark",
            "description": "Info",
            "number": 10,
            "__v": 0
        },
        "status": "available",
        "__v": 0
    }
]
```

```bash
curl --location --request GET 'http://localhost:3000/book-copies' \
--header 'accept: */*'
```

## Book checkout

**POST /book-checkout**

- Check out book

body:

```
{
  "bookCopyIds": [
    "6239bbf621fae715f9964ca6"
  ],
  "userId": "6239bc2521fae715f9964cbb"
}
```

- `bookCopyIds` is list id of book copies list from API `GET /book-copies`
- `bookCopyId` should be available and don't have any user checked out it.
- Total `bookCopyId` is 3
- If user have book is overdue. User can not be check out more.

return:

```
201 No Content
```

Example

```bash
curl --location --request POST 'http://localhost:3000/book-checkout' \
--header 'accept: */*' \
--header 'Content-Type: application/json' \
--data-raw '{
  "bookCopyIds": [
    "6239bbf621fae715f9964ca6"
  ],
  "userId": "6239bc2521fae715f9964cbb"
}'
```

## Book return

**DELETE /book-checkout**

body:

```
{
  "bookCopyIds": [
    "6239bbf621fae715f9964ca7"
  ],
  "userId": "6239bc2521fae715f9964cbb"
}
```

- `bookCopyIds` is list id of book copies list from API `GET /book-copies`
- `bookCopyIds` must be checked out by this userId.

return:

```
201 No Content
```

Example

```bash
curl --location --request DELETE 'http://localhost:3000/book-checkout' \
--header 'accept: */*' \
--header 'Content-Type: application/json' \
--data-raw '{
  "bookCopyIds": [
    "6239bbf621fae715f9964ca7"
  ],
  "userId": "6239bc2521fae715f9964cbb"
}'
```

## Get all book checked out

**GET /book-checkout**

return:

```json
200
[
    {
        "_id": "6239bbf621fae715f9964ca6",
        "bookId": {
            "_id": "6239bbf621fae715f9964ca4",
            "ISBN": "978-3-16-148410-1",
            "name": "The Book 2",
            "author": "Mark",
            "description": "Info",
            "number": 10,
            "__v": 0
        },
        "status": "notAvailable",
        "__v": 0,
        "checkoutBy": {
            "_id": "6239bc2521fae715f9964cbb",
            "firstName": "string 2",
            "lastName": "string 2",
            "status": "active",
            "description": "string",
            "__v": 0
        },
        "dueDate": "2022-04-05T13:27:38.534Z"
    }
]
```

Example

```bash
curl --location --request GET 'http://localhost:3000/book-checkout' \
--header 'accept: */*'
```

## Get all book checked out by user

**GET /book-checkout/{userId}**

return:

```json
200
[
    {
        "_id": "6239bbf621fae715f9964ca6",
        "bookId": {
            "_id": "6239bbf621fae715f9964ca4",
            "ISBN": "978-3-16-148410-1",
            "name": "The Book 2",
            "author": "Mark",
            "description": "Info",
            "number": 10,
            "__v": 0
        },
        "status": "notAvailable",
        "__v": 0,
        "checkoutBy": {
            "_id": "6239bc2521fae715f9964cbb",
            "firstName": "string 2",
            "lastName": "string 2",
            "status": "active",
            "description": "string",
            "__v": 0
        },
        "dueDate": "2022-04-05T13:27:38.534Z"
    }
]
```

Example

```bash
curl --location --request GET 'http://localhost:3000/book-checkout/6239bc2521fae715f9964cbb' \
--header 'accept: */*'
```

## Get all book overdue

**GET /book-checkout/overdue**

return:

```json
[
  {
    "_id": "6239bbf621fae715f9964ca6",
    "bookId": {
      "_id": "6239bbf621fae715f9964ca4",
      "ISBN": "978-3-16-148410-1",
      "name": "The Book 2",
      "author": "Mark",
      "description": "Info",
      "number": 10,
      "__v": 0
    },
    "status": "notAvailable",
    "__v": 0,
    "checkoutBy": {
      "_id": "6239bc2521fae715f9964cbb",
      "firstName": "string 2",
      "lastName": "string 2",
      "status": "active",
      "description": "string",
      "__v": 0
    },
    "dueDate": "2022-03-05T13:27:38.534Z"
  }
]
```

```bash
curl --location --request GET 'http://localhost:3000/book-checkout/overdue' \
--header 'accept: */*'
```

## Get user list

**GET /users**

return:

```json
200
[
    {
        "_id": "6239bacdf68082cc34f42b9b",
        "firstName": "string",
        "lastName": "string",
        "status": "active",
        "description": "string",
        "__v": 0
    }
]
```

```bash
curl --location --request GET 'http://localhost:3000/users' \
--header 'accept: */*'
```
