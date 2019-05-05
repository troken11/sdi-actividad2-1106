module.exports = function(app, gestorBD) {
    app.post("/api/autenticar",function(req,res){
        var seguro =app.get("crypto").createHmac('sha256',app.get('clave')).update(req.body.password).digest('hex');
        var criterio ={
            email: req.body.email,
            password: seguro,
            eliminado: false
        };
        gestorBD.obtenerUsuarios(criterio,function(usuarios){
            if(usuarios ==null||usuarios.length ==0){
                res.status(401);// Unauthorized
                res.json({autenticado :false})
            }else{
                var token =app.get('jwt').sign({
                        usuario:criterio.email ,
                        tiempo:Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                });
            }
        });
    });
    app.get("/api/tienda", function(req, res) {
        gestorBD.obtenerOfertas( {autor: {$ne: res.usuario}, eliminada: false, comprador: null} , function(ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({ error : "se ha producido un error" })
            } else {
                res.status(200);
                res.send( JSON.stringify(ofertas) );
            }
        });
    });
    app.post("/api/mensaje/enviar", function(req, res) {
        if(req.body.receptor != null && req.body.receptor.length > 0 && req.body.texto != null
                    && req.body.texto.length > 0  && req.body.idOferta != null && req.body.idOferta.length > 0
                    && req.body.receptor != res.usuario){
            var ofId = gestorBD.mongo.ObjectID(req.body.idOferta);
            // El receptor es el autor de la oferta?
            gestorBD.obtenerOfertas({_id: ofId, autor: req.body.receptor}, function (ofertas) {
                if (ofertas == null || ofertas.length == 0) {
                    // NO.
                    // Soy el autor de la oferta?
                    gestorBD.obtenerOfertas({_id: ofId, autor: req.body.receptor}, function (ofertas) {
                        if (ofertas == null) {
                            // NO.
                            // ERROR
                            res.status(500);
                            res.json({error: "se ha producido un error"})
                        } else {
                            // SI.
                            // Leer id de conv
                            var leerConv = {
                                idOferta: ofId,
                                autor: res.usuario,
                                interesado: req.body.receptor
                            };
                            gestorBD.obtenerConversaciones(leerConv, function (conv) {
                                if (conv == null || conv.length == 0) {
                                    // NO. ERROR
                                    res.status(500);
                                    res.json({error: "se ha producido un error"});
                                } else {
                                    // SI.
                                    // Creo un mensaje para esa conversacion
                                    var mensaje = {
                                        idConversacion: conv[0]._id,
                                        autor: res.usuario,
                                        receptor: req.body.receptor,
                                        fecha: new Date(),
                                        texto: req.body.texto,
                                        leido: false
                                    };
                                    crearMensaje(res, mensaje);
                                }
                            });
                        }
                    });
                } else {
                    // SI.
                    // Tengo yo una conversacion para esa oferta?
                    var posibleConv = {
                        idOferta: ofId,
                        interesado: res.usuario
                    };
                    gestorBD.obtenerConversaciones(posibleConv, function (conv) {
                        if (conv == null || conv.length == 0) {
                            // NO.
                            // Creo una conversacion
                            var nuevaConv = {
                               idOferta: ofId,
                               autor: req.body.receptor,
                               interesado: res.usuario
                            };
                            gestorBD.crearConversacion(nuevaConv, function (id) {
                                if (id == null) {
                                    // FALLO. Devuelve error
                                    res.status(500);
                                    res.json({error: "se ha producido un error"});
                                } else {
                                    // BIEN.
                                    // Creo un mensaje
                                    var mensaje = {
                                        idConversacion: id,
                                        autor: res.usuario,
                                        receptor: req.body.receptor,
                                        fecha: new Date(),
                                        texto: req.body.texto,
                                        leido: false
                                    };
                                    crearMensaje(res, mensaje);
                                }
                            });
                        } else {
                            // SI.
                            // Creo un mensaje para esa conversacion
                            var mensaje = {
                                idConversacion: conv[0]._id,
                                autor: res.usuario,
                                receptor: req.body.receptor,
                                fecha: new Date(),
                                texto: req.body.texto,
                                leido: false
                            };
                            crearMensaje(res, mensaje);
                        }
                    });
                }
            });
        }
        else{
            res.status(500);
            res.json({error: "se ha producido un error"});
        }
    });

    app.get("/api/mensaje/mostrar/:id", function(req, res) {
        if(req.params.id != null && req.params.id.length > 0){
            var posibleConv = {
                idOferta: gestorBD.mongo.ObjectID(req.params.id),
                persona: res.usuario
            };
            gestorBD.obtenerMensajesDeConver(posibleConv, function (conv) {
                if (conv == null) {
                    // NO existen. ERROR
                    res.status(500);
                    res.json({error: "se ha producido un error"});
                } else {
                    res.status(200);
                    res.send(JSON.stringify(conv));
                }
            });
        }
    });

    app.post("/api/mensaje/leido", function(req, res) {
        if(req.body.id != null && req.body.id.length > 0){
            var mensajeAct = {
                _id: gestorBD.mongo.ObjectID(req.body.id),
                receptor: res.usuario
            };
            gestorBD.leerMensaje(mensajeAct, function (id) {
                if (id == null || id.result.n == 0) {
                    // NO existen. ERROR
                    res.status(500);
                    res.json({error: "se ha producido un error"});
                } else {
                    res.status(200);
                    res.json({mensaje: "mensaje leido correctamente"});
                }
            });
        }
    });

    app.delete("/api/conversacion", function(req, res) {
        // Recibe id (de conversacion) y res.usuario
        // Eliminar conversacion con esa _id y mensajes con esa _id
        // Poner tambien un condicional para que se pueda transformar en ObjectId
        // Error producido: Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters
        if(req.body.id != null && req.body.id.length > 0 && res.usuario != null){
            var objId = gestorBD.mongo.ObjectID(req.body.id);
            var criterioConv = {_id: objId, $or:[{autor: res.usuario}, {interesado: res.usuario}]};
            gestorBD.eliminarConversacion(criterioConv, function(result) {
                if(result == null){
                    res.status(500);
                    res.json({error: "se ha producido un error borrando la conversacion"});
                } else{
                    var criterioMens = {idConversacion: objId, $or:[{autor: res.usuario}, {receptor: res.usuario}]}
                    gestorBD.eliminarMensajesDeConversacion(criterioMens, function(result) {
                        if(result == null){
                            res.status(500);
                            res.json({error: "se ha producido un error borrando mensajes"});
                        } else{
                            res.status(200);
                            res.json({mensaje: "conversacion eliminada"});
                        }
                    });
                }
            });
        }
    });

    app.get("/api/conversaciones", function(req, res) {
        var criterio = {persona: res.usuario};
        gestorBD.obtenerConversacionesConTitulos(criterio, function (conv) {
            if (conv == null) {
                // NO. ERROR
                res.status(500);
                res.json({error: "se ha producido un error"});
            } else {
                // SI.
                // Creo un mensaje para esa conversacion
                for(var i=0; i<conv.length; i++){
                    if(conv[i].autor == res.usuario){
                        conv[i].autor = "Yo"
                    }
                    if(conv[i].interesado == res.usuario){
                        conv[i].interesado = "Yo"
                    }
                }
                res.status(200);
                res.send(JSON.stringify(conv));
            }
        });
    });

    function crearMensaje(res, mensaje){
        gestorBD.crearMensaje(mensaje, function (id) {
            if (id == null) {
                res.status(500);
                res.json({error: "se ha producido un error"});
            } else {
                var mostrar = {
                    autor: mensaje.autor,
                    fecha: mensaje.fecha,
                    texto: mensaje.texto,
                    leido: mensaje.leido
                };
                res.status(200);
                res.send(JSON.stringify(mostrar));
            }
        });
    };
}


