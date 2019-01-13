'use strict'

const http = require('http')
const express = require('express')
const api = require('./api-url')
const debug = require('debug')('api:ws')
const chalk = require('chalk')
const asyncify = require('express-asyncify')
const bodyParser = require('body-parser')
const app = asyncify(express())

const port = process.env.PORT || 4000
const server = http.createServer(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/api', api)
app.use((err, req, res, next) => {
  debug(`Error ${err.message}`)
  if (err.message.match(/not found/)) {
    res.status(404).send({ error: err.message })
  }
  if (err.message.match(/bad request/)) {
    res.status(400).send({ error: err.message })
  }
  res.status(500).send({ error: err.stack })
})

function handleFatalError(err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandleRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('[api-reminder]')} server listening on port ${port}`)
})

module.exports = server