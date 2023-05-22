const express = require('express');
const logger = require('morgan');
const app = express();
const apiRoutes = require("./api");
const { authHeaderN_, authHeaderLN_ } = require('./secret');

app.use(logger('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

const secret = Buffer.from(authHeaderN_ + authHeaderLN_).toString("base64")

app.use((req, res, next) => {
  const { secret: v } = req.query;
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (v != secret)
    res.sendStatus(401);
  else
    next();
})

app.get('/', (req, res) => {
  res.sendStatus(404)
})

app.use("/api", apiRoutes);

app.listen(3000, () => "App a la escucha en puerto 3000!")

module.exports = app;
