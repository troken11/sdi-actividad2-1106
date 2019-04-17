module.exports = function(app, swig, gestorBD) {
    app.get("/registrarse", function(req, res) {
        var respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });
    app.post('/usuario', function(req, res) {
        if(req.body.email.length > 0 & req.body.password.length > 0 & req.body.repassword.length > 0
                                                        & req.body.name.length > 0 & req.body.lastname.length > 0){
            if(req.body.password === req.body.repassword){
                var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                    .update(req.body.password).digest('hex');
                var usuario = {
                    email : req.body.email,
                    password : seguro,
                    name : req.body.name,
                    lastname : req.body.lastname,
                    type : "Normal",
                    money : 100.0
                }
                var criterio = {email : req.body.email};
                gestorBD.obtenerUsuarios(criterio, function(usuarios) {
                    if(usuarios.length == 0) {
                        gestorBD.insertarUsuario(usuario,function (id) {
                            if(id==null){
                                res.redirect("/registrarse?mensaje=Error al registrar usuario");
                            }else{
                                res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                            }
                        });
                    }
                    else
                        res.redirect("/registrarse?mensaje=Error. Usuario ya existente");
                });
            }
            else{
                res.redirect("/registrarse?mensaje=Las contraseñas no coinciden");
            }
        }
        else{
            res.redirect("/registrarse?mensaje=Existen campos vacios");
        }
    });
    app.get("/identificarse", function(req, res) {
        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });
    app.post("/identificarse", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario=null;
                res.redirect("/identificarse" + "?mensaje=Email o password incorrecto"+ "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario=usuarios[0].email;
                res.redirect("/home");
            }
        });
    });
    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect("/identificarse");
    });
    app.get("/home", function(req, res) {
        gestorBD.obtenerUsuarios({"email": req.session.usuario}, function(usuarios) {
            var infoNav = {"email" : usuarios[0].email, "tipo": usuarios[0].type, "dinero": usuarios[0].money};
            var respuesta = swig.renderFile('views/home.html', infoNav);
            res.send(respuesta);
        });
    });
    app.get("/", function(req, res) {
        if(req.session.usuario){
            res.redirect("/home");
        } else {
            res.redirect("/identificarse");
        }
    });
    app.get("/usuario/lista", function(req, res) {
        gestorBD.obtenerUsuarios({"type": "Normal"}, function(usuarios) {
            var infoNav = {"email" : req.session.usuario, "tipo": "Admin","usuarios": usuarios};
            var respuesta = swig.renderFile('views/listarUsuarios.html', infoNav);
            res.send(respuesta);
        });
    });
};