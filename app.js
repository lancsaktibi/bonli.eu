const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

const app = express();

// connect to db
mongoose.connect("mongodb+srv://root:Gtiborla1@cluster0-s8xhe.mongodb.net/node-angular?retryWrites=true&w=majority")
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(() => {
    console.log('Connection failed!');
  });

// middleware for parsing JSON data (+ urlencoded optional)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// provide access to the images folder
app.use("/images", express.static(path.join("bonli.eu/images"))); // forward request to /backend/images

// middleware for CORS - Cross Origin Resource Sharing
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all other resources / domains to access data
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // allow these headers in the request
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS"); // allow http methods
  next();
});

// use router and routes file
app.use("/api/posts", postsRoutes);

module.exports = app;
