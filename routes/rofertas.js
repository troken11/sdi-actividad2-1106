module.exports = function(app,swig,gestorBD) {
    app.get("/oferta", function(req, res) {
        res.send("ver ofertas");
    });
    app.get("/oferta/agregar", function(req, res) {
        gestorBD.obtenerUsuarios({"email": req.session.usuario}, function(usuarios) {
            var infoNav = {"email" : req.session.usuario, "tipo": "Normal", "dinero": usuarios[0].money};
            var respuesta = swig.renderFile('views/bofertanueva.html', infoNav);
            res.send(respuesta);
        });
    });
    app.get("/oferta/lista", function(req, res) {
        gestorBD.obtenerUsuarios({"email": req.session.usuario}, function(usuarios) {
            gestorBD.obtenerOfertas({"autor": req.session.usuario}, function(ofertas) {
                var infoNav = {"email" : req.session.usuario, "tipo": "Normal", "dinero": usuarios[0].money,
                    "ofertas": ofertas};
                var respuesta = swig.renderFile('views/bofertalista.html', infoNav);
                res.send(respuesta);
            });
        });

    });
    app.get("/oferta/tienda", function(req, res) {
        var criterio = {"autor": {$ne: req.session.usuario}};
        if (req.query.busqueda != null) {
            criterio = {"titulo": new RegExp("^" + ".*"+req.query.busqueda.toLowerCase()+".*", "i")
                        , "autor": {$ne: req.session.usuario}};
        }
        var pg = parseInt(req.query.pg);    // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerUsuarios({"email": req.session.usuario}, function(usuarios) {
            gestorBD.obtenerOfertasPg(criterio, pg , function(ofertas, total ) {
                if (ofertas == null) {
                    res.send("Error al listar ");
                } else {
                    var ultimaPg = total/4;
                    if (total % 4 > 0 ){ // Sobran decimales
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
                        tipo : "Normal",
                        dinero : usuarios[0].money
                        });
                    res.send(respuesta);
                }
            });
        });
    });
    app.post("/oferta/comprar", function(req, res) {
        if(req.body.id.length > 0 & req.body.detalles.length > 0 & req.body.precio > 0){
            var oferta = {
                autor: req.session.usuario,
                titulo : req.body.titulo,
                detalles : req.body.detalles,
                precio : req.body.precio,
                fecha : new Date(),
                vendido : false
            }
            gestorBD.insertarOferta(oferta, function(id) {
                if(id==null){
                    res.redirect("/oferta/agregar?mensaje=No se ha podido añadir la oferta");
                }else{
                    res.redirect("/");      //  oferta/lista
                }
            });
        }
        else{
            res.redirect("/oferta/agregar?mensaje=Existen campos vacios");
        }
    });
    app.post("/oferta", function(req, res) {
        if(req.body.titulo.length > 0 & req.body.detalles.length > 0 & req.body.precio > 0){
            var oferta = {
                autor: req.session.usuario,
                titulo : req.body.titulo,
                detalles : req.body.detalles,
                precio : req.body.precio,
                fecha : new Date(),
                vendido : false
            }
            gestorBD.insertarOferta(oferta, function(id) {
                if(id==null){
                    res.redirect("/oferta/agregar?mensaje=No se ha podido añadir la oferta");
                }else{
                    res.redirect("/");      //  oferta/lista
                }
            });
        }
        else{
            res.redirect("/oferta/agregar?mensaje=Existen campos vacios");
        }
    });

};