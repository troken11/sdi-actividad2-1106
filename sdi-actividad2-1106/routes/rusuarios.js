module.exports = function(app, swig, gestorBD, logger) {
    app.get("/registrarse", function(req, res) {
        if(req.session.usuario != null){
            logger.info(req.session.usuario + " - Intenta acceder a: " + "/registrarse");
            logger.info(req.session.usuario + " - Redireccionado a: " + "/home");
            res.redirect("/home");
        }
        else{
            logger.info("Anonimo - Accede a: " + "/registrarse");
            var respuesta = swig.renderFile('views/bregistro.html', {});
            res.send(respuesta);
        }
    });
    app.post('/usuario', function(req, res) {
        if(req.session.usuario != null){
            logger.info(req.session.usuario + " - Redireccionado a: " + "/home");
            res.redirect("/home");
        }
        else{
            if(req.body.email != null && req.body.email.length > 0 && req.body.password != null && req.body.password.length > 0
                && req.body.repassword != null && req.body.repassword.length > 0 && req.body.name != null && req.body.name.length > 0
                && req.body.lastname != null && req.body.lastname.length > 0){
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
                    };
                    var criterio = {email : req.body.email};
                    gestorBD.obtenerUsuarios(criterio, function(usuarios) {
                        if(usuarios != null){
                            if(usuarios.length == 0) {
                                gestorBD.insertarUsuario(usuario,function (id) {
                                    if(id==null){
                                        logger.error("Error al registrarse como usuario: " +  req.body.email);
                                        res.redirect("/registrarse?mensaje=Error al registrar usuario");
                                    }else{
                                        req.session.usuario = req.body.email;
                                        req.session.rol = "Normal";
                                        req.session.dinero = 100.0;
                                        logger.info("Nuevo usuario registrado: " +  req.body.email);
                                        res.redirect("/home?mensaje=Nuevo usuario registrado");
                                    }
                                });
                            }
                            else{
                                logger.error("Error al registrarse como usuario: " +  req.body.email + " - Email ya existe");
                                res.redirect("/registrarse?mensaje=Error. Usuario ya existente");
                            }
                        }
                        else{
                            logger.error("Error al registrarse como usuario: " +  req.body.email);
                            res.redirect("/registrarse?mensaje=Error.");
                        }
                    });
                }
                else{
                    logger.error("Error al registrarse como usuario: " +  req.body.email + " - Passwords no coinciden");
                    res.redirect("/registrarse?mensaje=Las contraseñas no coinciden");
                }
            }
            else{
                logger.error("Error al registrarse como usuario: " +  req.body.email + " - Campos vacios");
                res.redirect("/registrarse?mensaje=Existen campos vacios");
            }
        }

    });
    app.post('/usuario/eliminar', function(req, res) {
        if(req.session.usuario != null){
            var emails = Object.keys(req.body);
            if(emails.length == 0){
                logger.error(req.session.usuario + " - No hay usuarios seleccionados para borrar");
                res.redirect("/usuario/lista?mensaje=No hay ningun usuario seleccionado");
            }
            else{
                gestorBD.eliminarUsuarios(emails, function(result) {
                    if(result == null){
                        logger.error(req.session.usuario + " - No se han podido borrar los usuarios");
                        res.redirect("/usuario/lista?mensaje=No se han podido eliminar los usuarios");
                    } else{
                        logger.info(req.session.usuario + " - Elimino " + emails.length + " usuarios");
                        gestorBD.eliminarOfertasDeUsuarios(emails, function(result) {
                            if(result == null){
                                logger.error(req.session.usuario + " - No se han podido eliminar las ofertas de usuario");
                                res.redirect("/usuario/lista?mensaje=No se han podido eliminar las ofertas de usuarios");
                            } else{
                                logger.info(req.session.usuario + " - Redireccionando a lista de usuarios");
                                res.redirect("/usuario/lista");
                            }
                        });
                    }
                });
            }
        }
        else{
            logger.info(req.session.usuario + " - Redireccionando a /home");
            res.redirect("/home");
        }

    });
    app.get("/identificarse", function(req, res) {
        if(req.session.usuario != null){
            logger.info(req.session.usuario + " - Redireccionando a /home");
            res.redirect("/home");
        }
        else{
            logger.info("Anonimo - Accediendo a /identicarse");
            var respuesta = swig.renderFile('views/bidentificacion.html', {});
            res.send(respuesta);
        }
    });
    app.post("/identificarse", function(req, res) {
        if(req.session.usuario != null){
            logger.info(req.session.usuario + " - Redireccionando a /home");
            res.redirect("/home");
        }
        else{
            if(req.body.email != null && req.body.email.length > 0 && req.body.password != null
                                                                                    && req.body.password.length > 0){
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
                        logger.error("Anonimo - Error al identificarse");
                        res.redirect("/identificarse" + "?mensaje=Email o password incorrecto"+ "&tipoMensaje=alert-danger ");
                    }
                    else {
                        if (usuarios[0].eliminado) {
                            res.redirect("/identificarse" + "?mensaje=Tu usuario ha sido eliminado" + "&tipoMensaje=alert-danger ");
                        } else {
                            logger.info(usuarios[0].email + " - Iniciando sesion");
                            req.session.usuario = usuarios[0].email;
                            req.session.rol = usuarios[0].type;
                            req.session.dinero = usuarios[0].money;
                            logger.info(usuarios[0].email + " - Redireccionando a /home");
                            res.redirect("/home");
                        }
                    }
                });
            }
            else{
                logger.error("Anonimo - Error al identificarse. Campos vacios");
                res.redirect("/identificarse" + "?mensaje=Existen campos vacios" + "&tipoMensaje=alert-danger ");
            }
        }
    });
    app.get('/desconectarse', function (req, res) {
        logger.info(req.session.usuario + " - Se ha desconectado");
        logger.info(req.session.usuario  + " - Redireccionando a /identificarse como Anonimo");
        req.session.usuario = null;
        req.session.rol = null;
        req.session.dinero = null;
        res.redirect("/identificarse");
    });
    app.get("/home", function(req, res) {
        logger.info(req.session.usuario + " - Pagina principal");
        var respuesta =  mostrarVista('views/home.html', {}, req.session);
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
        logger.info(req.session.usuario + " - Obteniendo lista de usuarios");
        gestorBD.obtenerUsuarios({type: "Normal", eliminado: false}, function(usuarios) {
            var infoNav = {"usuarios": usuarios};
            var respuesta = mostrarVista('views/busuariolista.html', infoNav, req.session);
            res.send(respuesta);
        });
    });

    app.get("/reset", function(req, res) {
        logger.info(req.session.usuario + " - Reiniciando BBDD");
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("pass").digest('hex');
        var usuarios = [
            {email : "primero@email.com", password : seguro, name : "Primera", lastname : "Cuenta",
                type : "Normal", money : 100.0, eliminado: false},
            {email : "borrar1@email.com", password : seguro, name : "Borrar", lastname : "1",
                type : "Normal", money : 100.0, eliminado: false},
            {email : "fantasma@email.com", password : seguro, name : "Cuenta", lastname : "Fantasma",
                type : "Normal", money : 100.0, eliminado: false},
            {email : "borrar2@email.com", password : seguro, name : "Borrar", lastname : "2",
                type : "Normal", money : 100.0, eliminado: false},
            {email : "lucia@email.com", password : seguro, name : "Lucia", lastname : "Menendez",
                type : "Normal", money : 17.0, eliminado: false},
            {email : "borrar3@email.com", password : seguro, name : "Borrar", lastname : "3",
                type : "Normal", money : 100.0, eliminado: false},
            {email : "marcos@email.com", password : seguro, name : "Marcos", lastname : "Gonzalez",
                type : "Normal", money : 100.0, eliminado: false},
            {email : "javier@email.com", password : seguro, name : "Javier", lastname : "Suarez",
                type : "Normal", money : 100.0, eliminado: false}
        ];
        var ofertas = [
            {autor: "marcos@email.com", titulo : "Mapamundi", detalles : "Muy detallado",
                precio : 15.2, destacada : false, fecha : new Date(), comprador : null, eliminada : false},
            {autor: "marcos@email.com", titulo : "Lampara", detalles : "Ahorra energia",
                precio : 40.0, destacada : false, fecha : new Date(), comprador : null, eliminada : false},
            {autor: "marcos@email.com", titulo : "Monedero", detalles : "Puedes guardar tarjetas",
                precio : 100.0, destacada : false, fecha : new Date(), comprador : null, eliminada : false},
            {autor: "fantasma@email.com", titulo : "Movil", detalles : "iPhone 7",
                precio : 120.0, destacada : false, fecha : new Date(), comprador : null, eliminada : false},
            {_id: gestorBD.mongo.ObjectID("5cceb9a1869db11a8cf4e7d5"),
                autor: "fantasma@email.com", titulo : "Altavoces", detalles : "Muy buen sonido",
                precio : 82.52, destacada : false, fecha : new Date(), comprador : null, eliminada : false},
            {_id: gestorBD.mongo.ObjectID("5cceb9a1869db11a8cf4e7c4"),
                autor: "lucia@email.com", titulo : "Zapatillas", detalles : "Sin estrenar",
                precio : 20.62, destacada : false, fecha : new Date(), comprador : null, eliminada : false}
        ];
        var conversaciones = [
            {_id: gestorBD.mongo.ObjectID("5cceb9a1869db11a8cf4e722"),idOferta: gestorBD.mongo.ObjectID("5cceb9a1869db11a8cf4e7c4"), autor: "lucia@email.com",
                interesado: "javier@email.com"},
            {_id: gestorBD.mongo.ObjectID("5cceb9a1869db11a8cf4e733"), idOferta: gestorBD.mongo.ObjectID("5cceb9a1869db11a8cf4e7d5"), autor: "lucia@email.com",
                interesado: "javier@email.com"}
        ];
        var mensajes = [
            {idConversacion: gestorBD.mongo.ObjectID("5cceb9a1869db11a8cf4e722"), autor: "javier@email.com",
                receptor:"lucia@email.com", fecha: new Date(), texto: "Me gustan esas zapass", leido: false},
            {idConversacion: gestorBD.mongo.ObjectID("5cceb9a1869db11a8cf4e733"), autor: "javier@email.com",
                receptor:"lucia@email.com", fecha: new Date(), texto: "Suenan potentes?", leido: false}
        ];
        gestorBD.resetBD(function(n) {
            if(n == null){
                res.redirect("/");
            }
            else{
                seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                    .update("admin").digest('hex');
                gestorBD.insertarAdmin(seguro,function () {
                    gestorBD.insertarUsuariosInicio(usuarios,function () {
                        gestorBD.insertarOfertasInicio(ofertas,function () {
                            gestorBD.insertarConversacionesInicio(conversaciones,function () {
                                gestorBD.insertarMensajesInicio(mensajes,function () {
                                    req.session.usuario = null;
                                    req.session.rol = null;
                                    req.session.dinero = null;
                                    res.redirect("/");
                                });
                            });
                        });
                    });

                });
            }
        });
    });

    /**
     * A modo de test, esta función la he añadido a rcanciones.js
     * pero debería estar en un módulo propio (estilo gestorBD)
     * y sería invocada desde cualquier petición que muestre una vista.
     *
     * @param fichero string con la ruta al html a renderizar
     * @param variables colección con las variables necesarias para ESTA vista
     * @param sesion el objeto sesión para extraer las variables comunes.
     * @returns Respuesta a enviar.
     */
    function mostrarVista(ruta, variables, sesion) {
        //Las variables que siempre vamos a utilizar
        variables["tipo"] = sesion.rol;
        variables["email"] = sesion.usuario;
        variables["dinero"] = sesion.dinero;

        return swig.renderFile(ruta, variables);
    }
};