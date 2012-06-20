const express   = require('express')
    , imageable = require("imageable")
    , connect   = require('connect')
    , http      = require("http")
    , fs        = require("fs")
    , cloud     = require("cloudapp")
    , jade      = require('jade')

var app        = module.exports = express.createServer()
  , configFile = __dirname + "/" + (process.env.CONFIG_PATH || "config/config.json")
  , config     = JSON.parse(process.env.CONFIG || fs.readFileSync(configFile))
  , airbrake   = (config.airbrake ? require("airbrake").createClient(config.airbrake) : null)

var basicAuth = function(req, res, next) {
  if(config.basicAuth) {
    connect.basicAuth(config.basicAuth.username, config.basicAuth.password)(req, res, function() {})
    next()
  } else {
    next()
  }
}

// Configuration
app.configure(function(){
  connect.logger.token('date', function(){ return imageable.Logger.formatDate(new Date()) })

  app.use(connect.logger({ immediate: true, format: ":date :method | :status | :url (via :referrer)" }))
  app.use(express.static(__dirname + '/public'))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(imageable(config, {
    after: function(_, _, err, req) {
      if(err && airbrake) {
        err.session = req.headers
        airbrake.notify(err, function(err, url){
          err && console.log(err)
        })
      }
    }
  }))
  app.use(app.router)
})

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

app.configure('production', function(){
  app.use(express.errorHandler())
})

// Routes
app.get('/', basicAuth, function(req, res) {
  cloud.setCredentials(config.cloudapp.username, config.cloudapp.password)
  cloud.getItems({ page: 1, per_page: 10, deleted: 'false' }, function(data) {
    res.render("index.jade", {
      cloudappItems: data
    })
  })
})

app.post('/', basicAuth, function(req, res) {
  if(req.files && req.files.newImage) {
    cloud.addFile(req.files.newImage.path, function() {
      res.redirect('/')
    });
  } else {
    res.redirect('/')
  }
  // req.form.complete(function(err, fields, files){
  //   if (err) {
  //     next(err);
  //   } else {
  //     console.log('\nuploaded %s to %s'
  //       ,  files.image.filename
  //       , files.image.path);
  //     res.redirect('back');
  //   }
  // });

  // We can add listeners for several form
  // events such as "progress"
  // req.form.on('progress', function(bytesReceived, bytesExpected){
  //   console.log('progress')
  //   var percent = (bytesReceived / bytesExpected * 100) | 0;
  //   process.stdout.write('Uploading: %' + percent + '\r');
  // });
})

app.get('/favicon.ico', function(req, res) {
  res.send('')
})

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(process.env.PORT || 3000)
  console.log("Express server listening on port %d", app.address().port)
}
