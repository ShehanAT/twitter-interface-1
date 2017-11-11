const express = require('express');

const app = express();

// set up app
app.set('view engine', 'pug');
app.use(express.static('public'));

// include routes
const mainRoutes = require('./routes/index');

// use routes
app.use(mainRoutes);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err);
  res.render('error', {
    'message': err.message
  });
});
