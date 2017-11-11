const express = require('express');
const twit = require('twit');
const bodyParser = require('body-parser')
const router = express.Router();

// initialize body-parser
router.use(bodyParser.urlencoded({ extended: false }))

// include config
const config = require('../config');

// initialize Twitter
const T = new twit(config);

// get user info

router.use( (req, res, next) => {
    T.get('account/verify_credentials', {} )
    .catch(function (err) {
      console.log('caught error', err.stack)
    })
    .then(function (result) {
      req.screen_name = result.data.screen_name;
      req.profile_image_url = result.data.profile_image_url;
      req.profile_banner_url = result.data.profile_banner_url;
      next();
    });
});

// get timeline
router.use( (req, res, next) => {
  T.get('statuses/home_timeline', {
    'count': 5
  } )
  .catch(function (err) {
    console.log('caught error', err.stack)
  })
  .then(function (result) {
    req.timeline = new Array();
    if(result.data.errors) {
      let error = new Error(result.data.errors[0].message);
      next(error);
    }
    for(let prop in result.data) {
      let tweet = result.data[prop];
      // create temp object to save necessary data
      let tweetData = {};
      tweetData.name = tweet.user.name;
      tweetData.screen_name = tweet.user.screen_name;
      tweetData.created_at = tweet.created_at;
      tweetData.text = tweet.text;
      tweetData.profile_image_url = tweet.user.profile_image_url;
      tweetData.retweet_count = tweet.retweet_count;
      tweetData.favorite_count = tweet.favorite_count;

      // add timeline to req (result)
      req.timeline.push(tweetData);
    }
    next();
  });
});

// get followers
router.use( (req, res, next) => {
  T.get('friends/list', {
    'count': 5
  } )
  .catch(function (err) {
    console.log('caught error', err.stack)
  })
  .then(function (result) {
    req.followers = new Array();

    for(let prop in result.data.users) {
      let follower = result.data.users[prop];

      // create temp object to save necessary data
      let followerData = {};
      followerData.name = follower.name;
      followerData.screen_name = follower.screen_name;
      followerData.profile_image_url = follower.profile_image_url;

      // add follower to req (result)
      req.followers.push(followerData);
    }
    next();
  });
});

// get direct messages
router.use( (req, res, next) => {
  T.get('direct_messages', {
    'count': 5
  } )
  .catch(function (err) {
    console.log('caught error', err.stack)
  })
  .then(function (result) {
    req.directMessages = new Array();
    for(let prop in result.data) {
      let directMessage = result.data[prop];

      // create temp object to save necessary data
      let directMessageData = {};
      directMessageData.name = directMessage.sender.name;
      directMessageData.text = directMessage.text;
      directMessageData.profile_image_url = directMessage.sender.profile_image_url;
      directMessageData.created_at = directMessage.created_at;

      // add follower to req (result)
      req.directMessages.push(directMessageData);
    }
    next();
  });
});

router.get('/', (req, res) => {
  res.render('index', {
    'profile_banner_url': req.profile_banner_url,
    'screen_name': req.screen_name,
    'timeline': req.timeline,
    'followers': req.followers,
    'directMessages': req.directMessages
  });
});

router.post('/', (req, res, next) => {
  let message = req.body.message;
  if(message.length <= 140) {
    T.post('statuses/update', { status: message }, function(err, data, response) {
      res.redirect('/');
    });
  } else {
    let error = new Error('Must be shorter than 140 characters.');
    next(error);
  }
});

module.exports = router;
