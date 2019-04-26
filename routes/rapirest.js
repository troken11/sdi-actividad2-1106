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
}


