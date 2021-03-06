// Módulos
var express = require('express');
var app = express();

var rest = require('request');
app.set('rest',rest);

var log4js = require('log4js');
log4js.configure({
    appenders: {cheese: {type: 'file', filename: 'all-logs.log'}},
    categories: {default: {appenders: ['cheese'], level: 'debug'}}
});
var logger = log4js.getLogger();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});


var jwt = require('jsonwebtoken');
app.set('jwt',jwt);

var fs = require('fs');
var https = require('https');

var expressSession = require('express-session');
app.use(expressSession({
    secret:'abcdefg',
    resave:true,
    saveUninitialized:true
}));

var crypto = require('crypto');
var fileUpload=require('express-fileupload');
app.use(fileUpload());

var mongo = require('mongodb');
var swig = require('swig');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routerUsuarioToken
var routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    var token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {    // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;
            } else { // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });
    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});

// Aplicar routerUsuarioToken
app.use('/api/tienda', routerUsuarioToken);
app.use('/api/mensaje/enviar', routerUsuarioToken);
app.use('/api/mensaje/mostrar/*', routerUsuarioToken);
app.use('/api/mensaje/leido', routerUsuarioToken);
app.use("/api/conversacion", routerUsuarioToken);
app.use("/api/conversaciones", routerUsuarioToken);

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);// routerUsuarioSession

var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});

var routerAdminSession = express.Router();
routerAdminSession.use(function(req, res, next) {
    console.log("routerAdminSession");
    if ( req.session.usuario ) {
        if(req.session.usuario == "admin@email.com"){
            // dejamos correr la petición
            next();
        }
        else{
            console.log("va a : "+req.session.destino)
            res.redirect("/home");
        }
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});

var routerNormalSession = express.Router();
routerNormalSession.use(function(req, res, next) {
    console.log("routerNormalSession");
    if ( req.session.usuario ) {
        if(req.session.usuario != "admin@email.com"){
            // dejamos correr la petición
            next();
        }
        else{
            console.log("va a : "+req.session.destino);
            res.redirect("/home");
        }
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});

//Aplicar routerUsuarioSession
app.use("/home",routerUsuarioSession);
app.use("/desconectarse",routerUsuarioSession);

app.use("/usuario/*",routerAdminSession);
app.use("/reset",routerAdminSession);

app.use("/oferta/*",routerNormalSession);
app.use("/oferta",routerNormalSession);



//routerUsuarioAutor
var routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    console.log("routerUsuarioAutor");
    var path = require('path');
    var id = path.basename(req.originalUrl);
    // Cuidado porque req.params no funciona
    // en el router si los params van en la URL.
    gestorBD.obtenerCanciones(
        {_id: mongo.ObjectID(id) }, function (canciones) {
            console.log(canciones[0]);
            if(canciones[0].autor == req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});

app.use(express.static('public'));

// Variables
app.set('port', 8081);
console.log('Introduce URL y clave para la base de datos MongoDB');
//app.set('db',URL_DB);
//app.set('clave',CLAVE_DB);
app.set('crypto',crypto);
//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app,swig,gestorBD, logger); // (app, param1, param2, etc.)
require("./routes/rofertas.js")(app,swig,gestorBD, logger); // (app, param1, param2, etc.)
require("./routes/rapirest.js")(app,gestorBD, logger); // (app, param1, param2, etc.)

app.get('/', function (req, res) {
    res.redirect('/registrarse');
});

app.use( function (err, req, res, next ) {
    console.log("Error producido: " + err); //we log the error in our db
    if (! res.headersSent) {
        res.status(400);
        res.send("Recurso no disponible");
    }
});


// lanzar el servidor
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
        }, app).listen(app.get('port'), function() {
                                            console.log("Servidor activo");
});
