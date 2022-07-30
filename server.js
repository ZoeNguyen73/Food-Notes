require('dotenv').config();

// require packages and set up app
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const express = require('express');
const app = express();
const port = 3000;


const connStr = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.xeoex.mongodb.net/?retryWrites=true&w=majority`

// require controllers

// apply middlewares
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: false, httpOnly: false, maxAge: 7200000 }
}));

// set view engine
app.set('view-engine', 'ejs');

// app listen to port & connect with DB
app.listen(port, async () => {
  console.log('<----- listening at port 3000 ----->');

  try {
    await mongoose.connect(connStr, {dbName: 'Happy-Foodie'});
    console.log('<----- connected to DB successfully ----->');
  } catch(err) {
    console.log('Failed to connect to DB');
    process.exit(1);
  };
});