module.exports = function(app,swig,gestorBD, logger) {
    app.get("/oferta/agregar", function(req, res) {
        var infoNav = {
            email: req.session.usuario,
            tipo: req.session.rol,
            dinero: req.session.dinero
        };
        logger.info(req.session.usuario + " - Accediendo a agregar oferta");
        var respuesta = swig.renderFile('views/bofertanueva.html', infoNav);
        res.send(respuesta);
    });
    app.get("/oferta/lista", function(req, res) {
        gestorBD.obtenerOfertas({
            autor: req.session.usuario,
            eliminada: false
        }, function(ofertas) {
            var infoNav = {
                email : req.session.usuario,
                tipo: req.session.rol,
                dinero: req.session.dinero,
                ofertas: ofertas
            };
            logger.info(req.session.usuario + " - Accediendo a listar ofertas");
            var respuesta = swig.renderFile('views/bofertalista.html', infoNav);
            res.send(respuesta);
        });
    });
    app.get("/oferta/destacadas", function(req, res) {
        gestorBD.obtenerOfertas({
            autor: {$ne: req.session.usuario},
            eliminada: false,
            destacada: true
        }, function(ofertas) {
            var infoNav = {
                email : req.session.usuario,
                tipo: req.session.rol,
                dinero: req.session.dinero,
                ofertas: ofertas
            };
            logger.info(req.session.usuario + " - Accediendo a ofertas destacadas");
            var respuesta = swig.renderFile('views/bofertadestacadas.html', infoNav);
            res.send(respuesta);
        });
    });
    app.get("/oferta/tienda", function(req, res) {
        var criterio = {
            autor: {$ne: req.session.usuario},
            eliminada: false
        };
        if (req.query.busqueda != null) {
            criterio = {titulo: new RegExp("^" + ".*"+req.query.busqueda.toLowerCase()+".*", "i")
                        , autor: {$ne: req.session.usuario}};
        }
        var pg = parseInt(req.query.pg);    // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerOfertasPg(criterio, pg , function(ofertas, total ) {
            if (ofertas == null) {
                logger.error(req.session.usuario + " - Error al listar ofertas (paginacion)");
                res.send("Error al listar ");
            } else {
                var ultimaPg = total/5;
                if (total % 5 > 0 ){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                var paginas = [];   // paginas mostrar
                for(var i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                var respuesta = swig.renderFile('views/bofertatienda.html', {
                    ofertas : ofertas,
                    paginas : paginas,
                    actual : pg,
                    email : req.session.usuario,
                    tipo : req.session.rol,
                    dinero : req.session.dinero,
                    });
                logger.info(req.session.usuario + " - Accediendo a tienda de ofertas");
                res.send(respuesta);
            }
        });
    });
    app.post("/oferta/comprar", function(req, res) {
        if(req.body.id.length > 0 && req.session.usuario){
            var ofId = gestorBD.mongo.ObjectID(req.body.id);
            gestorBD.obtenerOfertas({_id: ofId, comprador: null}, function(ofertas) {
                if(ofertas == null){
                    res.redirect("/oferta/tienda?mensaje=Esta oferta no está en venta");
                }
                else{
                    var oferta = ofertas[0];
                    var dineroRestante = req.session.dinero - oferta.precio;
                    if(dineroRestante >= 0){
                        gestorBD.marcarVendidaOferta(ofId, req.session.usuario, function(id) {
                            if(id==null){
                                logger.error(req.session.usuario + " - No tiene suficiciente dinero para comprar");
                                res.redirect("/oferta/tienda?mensaje=No dispones de dinero suficiente");
                            }else{
                                gestorBD.modificarDinero(req.session.usuario, dineroRestante, function(id) {
                                    if(id==null){
                                        logger.error(req.session.usuario + " - No ha podido comprar");
                                        res.redirect("/oferta/tienda?mensaje=No se ha podido comprar");
                                    }else{
                                        req.session.dinero = dineroRestante;
                                        logger.info(req.session.usuario + " - Ha comprado una oferta");
                                        res.redirect("/home");
                                    }
                                });
                            }
                        });
                    }
                    else{
                        logger.error(req.session.usuario + " - No tiene suficiciente dinero para comprar");
                        res.redirect("/oferta/tienda?mensaje=No dispones de dinero suficiente");
                    }
                }
            });
        }
        else{
            logger.error(req.session.usuario + " - Informacion insuficiente para comprar");
            res.redirect("/oferta/tienda?mensaje=Existen campos vacios");
        }
    });
    app.post("/oferta/eliminar", function(req, res) {
        if(req.body.eliminar.length > 0){
            var ofId = gestorBD.mongo.ObjectID(req.body.eliminar);
            gestorBD.eliminarOferta(ofId, function(id) {
                if(id==null){
                    logger.error(req.session.usuario + " - No se pudo eliminar la oferta");
                    res.redirect("/oferta/lista?mensaje=No se pudo eliminar la oferta");
                }else{
                    logger.info(req.session.usuario + " - Objeto eliminado correctamente");
                    res.redirect("/oferta/lista");
                }
            });
        }
        else{
            logger.error(req.session.usuario + " - Informacion insuficiente para comprar");
            res.redirect("/oferta/lista?mensaje=Existen campos vacios");
        }
    });
    app.get("/oferta/compradas", function(req, res) {
        if(req.session.usuario){
            gestorBD.obtenerOfertas({comprador: req.session.usuario}, function(ofertas) {
                var infoNav = {email : req.session.usuario, tipo: req.session.rol, dinero: req.session.dinero,
                    ofertas: ofertas};
                logger.info(req.session.usuario + " - Accede a tienda destacada");
                var respuesta = swig.renderFile('views/bofertacompradas.html', infoNav);
                res.send(respuesta);
            });
        } else {
            logger.error(req.session.usuario + " - Error al acceder a la tienda destacada");
            res.redirect("/identificarse");
        }

    });
    app.post("/oferta/destacar", function(req, res) {
        if(req.session.usuario && req.body.destacada && req.body.destacada.length > 0){
            if(req.session.dinero >= 20){
                var ofId = gestorBD.mongo.ObjectID(req.body.destacada);
                gestorBD.destacarOferta(ofId, function(id) {
                    if(id==null){
                        logger.error(req.session.usuario + " - La oferta ya estaba destacada");
                        res.redirect("/oferta/lista?mensaje=La oferta estaba destacada");
                    }else{
                        var nuevoDinero = req.session.dinero - 20.0;
                        gestorBD.modificarDinero(req.session.usuario, nuevoDinero, function(id) {
                            if(id==null){
                                logger.error(req.session.usuario + " - Problemas al destacar la oferta");
                                res.redirect("/oferta/lista?mensaje=Existen problemas al destacar la oferta");
                            }else{
                                logger.info(req.session.usuario + " - La oferta se ha destacado correctamente");
                                req.session.dinero = nuevoDinero;
                                res.redirect("/oferta/lista");
                            }
                        });
                    }
                });
            } else {
                logger.error(req.session.usuario + " - No dispone de dinero para destacar una oferta");
                res.redirect("/oferta/lista?mensaje=No tienes suficiente dinero para destacar la oferta");
            }
        }
        else{
            logger.error(req.session.usuario + " - Insuficientes datos para destacar oferta");
            res.redirect("/oferta/lista?mensaje=No se obtuvieron los datos necesarios");
        }
    });
    app.post("/oferta", function(req, res) {
        if(req.body.titulo.length > 0 && req.body.detalles.length > 0 && req.body.precio > 0){
            if(req.body.precio.split(".")[1] == null || req.body.precio.split(".")[1].length <= 2){
                var precio = parseFloat(parseFloat(req.body.precio).toFixed(2));
                var destacada = false;
                if(req.body.destacada != null){
                    destacada = true;
                }
                var oferta = {
                    autor: req.session.usuario,
                    titulo : req.body.titulo,
                    detalles : req.body.detalles,
                    precio : precio,
                    destacada : destacada,
                    fecha : new Date(),
                    comprador : null,
                    eliminada : false
                };
                if(destacada){
                    if(req.session.dinero >= 20) {
                        var nuevoDinero = req.session.dinero - 20.0;
                        gestorBD.insertarOferta(oferta, function(id) {
                            if(id==null){
                                logger.error(req.session.usuario + " - Problemas al añadir la oferta");
                                res.redirect("/oferta/agregar?mensaje=No se ha podido añadir la oferta");
                            }else{
                                gestorBD.modificarDinero(req.session.usuario, nuevoDinero, function(id) {
                                    if(id==null){
                                        logger.error(req.session.usuario + " - Problemas al destacar la oferta");
                                        res.redirect("/oferta/tienda?mensaje=Existen problemas al destacar la oferta");
                                    }else{
                                        logger.error(req.session.usuario + " - Oferta creada");
                                        req.session.dinero = nuevoDinero;
                                        res.redirect("/oferta/lista");
                                    }
                                });
                            }
                        });
                    }else{
                        logger.error(req.session.usuario + " - No tiene suficiente dinero para destacar oferta");
                        res.redirect("/oferta/tienda?mensaje=No tienes suficiente dinero para destacar la oferta");
                    }
                } else{
                    gestorBD.insertarOferta(oferta, function(id) {
                        if(id==null){
                            logger.error(req.session.usuario + " - Problemas al añadir la oferta");
                            res.redirect("/oferta/agregar?mensaje=No se ha podido añadir la oferta");
                        }else{
                            logger.error(req.session.usuario + " - Oferta creada");
                            res.redirect("/oferta/lista");
                        }
                    });
                }
            }
            else{
                logger.error(req.session.usuario + " - Precio tiene formato incorrecto");
                res.redirect("/oferta/agregar?mensaje=Precio con formato incorrecto");
            }

        }
        else{
            logger.error(req.session.usuario + " -Insuficientes datos para añadir oferta");
            res.redirect("/oferta/agregar?mensaje=Existen campos vacios");
        }
    });

};