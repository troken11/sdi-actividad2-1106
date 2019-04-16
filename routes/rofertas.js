module.exports = function(app,swig,gestorBD) {
    app.get("/oferta", function(req, res) {
        res.send("ver ofertas");
    });
    app.get("/oferta/agregar", function(req, res) {
        var infoNav = {"email" : req.session.usuario, "tipo": req.session.tipo, "dinero": req.session.dinero};
        var respuesta = swig.renderFile('views/bofertanueva.html', infoNav);
        res.send(respuesta);
    });
    app.get("/oferta/lista", function(req, res) {
        gestorBD.obtenerOfertas({"autor": req.session.usuario}, function(ofertas) {
            var infoNav = {"email" : req.session.usuario, "tipo": req.session.tipo, "dinero": req.session.dinero,
                        "ofertas": ofertas};
            var respuesta = swig.renderFile('views/bofertalista.html', infoNav);
            res.send(respuesta);
        });
    });
    app.post("/oferta", function(req, res) {
        if(req.body.titulo.length > 0 & req.body.detalles.length > 0 & req.body.precio > 0){
            var oferta = {
                autor: req.session.usuario,
                titulo : req.body.titulo,
                detalles : req.body.detalles,
                precio : req.body.precio,
                fecha : new Date()
            }
            gestorBD.insertarOferta(oferta, function(id) {
                if(id==null){
                    res.redirect("/oferta/agregar?mensaje=No se ha podido añadir la oferta");
                }else{
                    res.redirect("/home");      //  oferta/lista
                }
            });
        }
        else{
            res.redirect("/oferta/agregar?mensaje=Existen campos vacios");
        }
    });

};