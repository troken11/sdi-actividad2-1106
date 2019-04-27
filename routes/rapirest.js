module.exports = function(app, gestorBD) {
    app.post("/api/autenticar",function(req,res){
        var seguro =app.get("crypto").createHmac('sha256',app.get('clave')).update(req.body.password).digest('hex');
        var criterio ={
            email: req.body.email,
            password: seguro,
            eliminado: false
        }
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
        gestorBD.obtenerOfertas( {autor: {$ne: res.usuario}, eliminada: false} , function(ofertas) {
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
    }
}


