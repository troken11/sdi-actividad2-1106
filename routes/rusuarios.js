module.exports = function(app, swig, gestorBD) {
    app.get("/registrarse", function(req, res) {
        if(req.session.usuario != null){
            res.redirect("/home");
        }
        else{
            var respuesta = swig.renderFile('views/bregistro.html', {});
            res.send(respuesta);
        }
    });
    app.post('/usuario', function(req, res) {
        if(req.session.usuario != null){
            res.redirect("/home");
        }
        else{
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
                        money : 100.0,
                        eliminado: false
                    }
                    var criterio = {email : req.body.email};
                    gestorBD.obtenerUsuarios(criterio, function(usuarios) {
                        if(usuarios.length == 0) {
                            gestorBD.insertarUsuario(usuario,function (id) {
                                if(id==null){
                                    res.redirect("/registrarse?mensaje=Error al registrar usuario");
                                }else{
                                    req.session.usuario = req.body.email;
                                    req.session.rol = "Normal";
                                    req.session.dinero = 100.0;
                                    res.redirect("/home?mensaje=Nuevo usuario registrado");
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
        }

    });
    app.post('/usuario/eliminar', function(req, res) {
        if(req.session.usuario != null){
            var emails = Object.keys(req.body);
            if(emails.length == 0){
                res.redirect("/usuario/lista?mensaje=No hay ningun usuario seleccionado");
            }
            else{
                for(var i=0; i<emails.length; i++){
                    gestorBD.eliminarUsuario(emails[i], function() {
                        console.log("Usuario eliminado");
                    });
                    gestorBD.eliminarOfertasDeUsuario(emails[i], function() {
                        if(i==emails.length){
                            res.redirect("/usuario/lista");
                        }
                    });
                }
            }
        }
        else{
            res.redirect("/home");
        }

    });
    app.get("/identificarse", function(req, res) {
        if(req.session.usuario != null){
            res.redirect("/home");
        }
        else{
            var respuesta = swig.renderFile('views/bidentificacion.html', {});
            res.send(respuesta);
        }
    });
    app.post("/identificarse", function(req, res) {
        if(req.session.usuario != null){
            res.redirect("/home");
        }
        else{
            var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            var criterio = {
                email : req.body.email,
                password : seguro,
            }
            gestorBD.obtenerUsuarios(criterio, function(usuarios) {
                if (usuarios == null || usuarios.length == 0) {
                    req.session.usuario=null;
                    req.session.rol=null;
                    req.session.dinero=null;
                    res.redirect("/identificarse" + "?mensaje=Email o password incorrecto"+ "&tipoMensaje=alert-danger ");
                }
                else {
                    if (usuarios[0].eliminado) {
                        res.redirect("/identificarse" + "?mensaje=Tu usuario ha sido eliminado" + "&tipoMensaje=alert-danger ");
                    } else {
                        req.session.usuario = usuarios[0].email;
                        req.session.rol = usuarios[0].type;
                        req.session.dinero = usuarios[0].money;
                        res.redirect("/home");
                    }
                }
            });
        }
    });
    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        req.session.rol = null;
        req.session.dinero = null;
        res.redirect("/identificarse");
    });
    app.get("/home", function(req, res) {
        var infoNav = {"email" : req.session.usuario, "tipo":req.session.rol, "dinero": req.session.dinero};
        var respuesta = swig.renderFile('views/home.html', infoNav);
        res.send(respuesta);
    });
    app.get("/", function(req, res) {
        if(req.session.usuario){
            res.redirect("/home");
        } else {
            res.redirect("/identificarse");
        }
    });
    app.get("/usuario/lista", function(req, res) {
        gestorBD.obtenerUsuarios({type: "Normal", eliminado: false}, function(usuarios) {
            var infoNav = {"email" : req.session.usuario, "tipo": req.session.rol,"usuarios": usuarios};
            var respuesta = swig.renderFile('views/busuariolista.html', infoNav);
            res.send(respuesta);
        });
    });
};