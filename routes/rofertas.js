module.exports = function(app,swig,gestorBD) {
    app.get("/ofertas", function(req, res) {
        res.send("ver ofertas");
    });
    app.get("/ofertas/agregar", function(req, res) {
        var respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });
    app.post("/oferta", function(req, res) {
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
};