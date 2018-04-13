/**
 * Dependencies
 */

const Express = require('express');
const Path = require('path');

/**
 * Constants
 */

const app = new Express();
const port = process.env.PORT;
const dist = Path.join(__dirname, '../', 'dist');
const views = Path.join(__dirname, '../', 'src/views');
const engine = 'slm';
const locals = {vars: require('../config/variables')};
const alerts = require('../config/alerts');

/**
 * Functions
 */

/**
 * The getter function for rendering views
 * @param  {object} request - the Express.get() request
 * @param  {function} resolve - the callback function
 */
function fnGet(request, resolve) {
  resolve.render(request.params[0], locals);
}

/**
 * The callback function to signal the app is running
 */
function fnListenCallback() {
  let p = app.get('port');
  console.log(`${alerts.success} Server running and listening on port ${p}`);
}

/**
 * Init
 */

app.set('views', views); // set the views directory
app.set('view engine', engine); // set the template engine
app.set('port', port); // set the port
app.use(Express.static(dist)); // choose the static file directory
app.get('/*', fnGet); // request handler
app.listen(app.get('port'), fnListenCallback); // set the port to listen on
