'use strict';
const express = require('express');
const router = express.Router();
//const tweetBank = require('../tweetBank');
const dbClient = require('../db');

module.exports = io => {

  // a reusable function
  const respondWithAllTweets = (req, res, next) => {


    dbClient.query('SELECT * FROM tweets INNER JOIN users ON users.id = tweets.user_id ORDER BY tweets.id DESC', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;

      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }


  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', (req, res, next) => {
    //const tweetsForName = tweetBank.find({ name: req.params.username });
    let username = req.params.username;

    dbClient.query('SELECT * FROM tweets INNER JOIN users ON users.id = tweets.user_id WHERE $1=users.name', [username], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      //console.log(tweets)
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });

  });

  // single-tweet page
  router.get('/tweets/:id', (req, res, next) => {

    let tweet_id = req.params.id;

    dbClient.query('SELECT * FROM tweets INNER JOIN users ON users.id = tweets.user_id WHERE $1=tweets.id', [tweet_id], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });

  });

  // create a new tweet
  router.post('/tweets', (req, res, next) => {

    const username = req.body.name;
    const tweetText = req.body.text;

    dbClient.query('SELECT * FROM users WHERE $1=users.name', [username], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var users = result.rows;

      if(users.length > 0) {

        let userId = users[0].id;
        dbClient.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [userId, tweetText ], function (error, data) {
          if (error) return next(error); // pass errors to Express

          res.redirect('/');
        });

      } else {

        //let userName = users[0].name;
        //Insert user
        dbClient.query('INSERT INTO users (name) VALUES ($1) returning *', [username], function (error, data) {
          if (error) return next(error); // pass errors to Express


            let userId = data.rows[0].id;
            dbClient.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [userId, tweetText ], function (error, data) {
              if (error) return next(error); // pass errors to Express

              res.redirect('/');
            });
        });





      }

      //console.log(tweets)
      //res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });


    //io.sockets.emit('new_tweet', newTweet);

  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', => (req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
