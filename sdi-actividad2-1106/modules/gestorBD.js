module.exports = {
    mongo : null,
    app : null,
    init : function(app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    insertarUsuario : function(usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.insert(usuario, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerUsuarios : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },
    insertarOferta: function(oferta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.insert(oferta, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    } db.close();
                });
            }
        });
    },
    marcarVendidaOferta: function(idOferta, email, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.update({_id: idOferta},{$set: {"comprador": email}}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    } db.close();
                });
            }
        });
    },
    destacarOferta: function(idOferta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.update({_id: idOferta, destacada: false},{$set: {destacada: true}}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    } db.close();
                });
            }
        });
    },
    eliminarOferta: function(idOferta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.update({_id: idOferta, eliminada: false},{$set: {eliminada: true}}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    } db.close();
                });
            }
        });
    },
    obtenerOfertas : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerOfertasPg : function(criterio,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.count(function(err, count){
                    collection.find(criterio).skip( (pg-1)*4 ).limit( 4 ) .toArray(function(err, canciones) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(canciones, count);
                        }
                        db.close();
                    });
                });
            }
        });
    },
    modificarDinero: function(correo, dineroRestante, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.update({email: correo},{$set: {money: dineroRestante}},function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    } db.close();
                });
            }
        });
    },
    eliminarUsuarios: function(correos, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.deleteMany({email: {$in: correos}},function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    } db.close();
                });
            }
        });
    },
    eliminarOfertasDeUsuarios: function(correos, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.update({autor: {$in: correos}},{$set: {eliminada: true}},function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    } db.close();
                });
            }
        });
    },
    /*
    MENSAJES y CONVERSACIONES
     */

    crearConversacion: function(conversacion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                collection.insert(conversacion, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    } db.close();
                });
            }
        });
    },
    obtenerConversaciones : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },

    obtenerConversacionesConTitulos : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var junta = [
                    {
                        $match:
                            {
                                $or: [{ autor: criterio.persona }, { interesado: criterio.persona }],
                            }
                    },
                    {
                        $lookup:
                            {
                                from: "ofertas",
                                localField: "idOferta",
                                foreignField: "_id",
                                as: "oferta"
                            }
                    },
                ];
                var collection = db.collection('conversaciones');
                collection.aggregate(junta).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },

    obtenerNumeroNoLeidos : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },

    crearMensaje: function(mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.insert(mensaje, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    } db.close();
                });
            }
        });
    },

    obtenerMensajesDeConver : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                var junta = [
                    {
                        $match:
                            {
                                $or: [{ autor: criterio.persona }, { interesado: criterio.persona }],
                                idOferta: criterio.idOferta
                            }
                    },
                    {
                        $lookup:
                            {
                                from: "mensajes",
                                localField: "_id",
                                foreignField: "idConversacion",
                                as: "mensajes"
                            }
                    },
                ];
                collection.aggregate(junta).toArray(function(err, mensajes) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(mensajes);
                    }
                    db.close();
                });
            }
        });
    },

    leerMensaje: function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.update(criterio,{$set: {leido: true}},function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    } db.close();
                });
            }
        });
    },

    eliminarConversacion: function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.result.n);
                    }
                    db.close();
                });
            }
        });
    },
    eliminarMensajesDeConversacion: function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.deleteMany(criterio,function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.result.n);
                    } db.close();
                });
            }
        });
    },


    /**
     * RESET BD
     */

    resetBD: function(funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                db.dropDatabase(function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(1);
                    } db.close();
                });
            }
        });
    },
    insertarAdmin : function(seguro, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');

                var usuario = {
                    email : "admin@email.com",
                    password : seguro,
                    name : "Administrador",
                    lastname : "del Sistema",
                    type : "Admin",
                    money : 0.0,
                    eliminado: false
                };
                collection.insert(usuario, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },

    insertarUsuariosInicio : function(usuarios, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.insertMany(usuarios, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(1);
                    }
                    db.close();
                });
            }
        });
    },

    insertarOfertasInicio : function(ofertas, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.insertMany(ofertas, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(1);
                    }
                    db.close();
                });
            }
        });
    },

    insertarConversacionesInicio : function(convers, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('conversaciones');
                collection.insertMany(convers, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(1);
                    }
                    db.close();
                });
            }
        });
    },

    insertarMensajesInicio : function(mensajes, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.insertMany(mensajes, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(1);
                    }
                    db.close();
                });
            }
        });
    },

/*
obtenerCancionesPg : function(criterio,pg,funcionCallback){
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('ofertas');
            collection.count(function(err, count){
                collection.find(criterio).skip( (pg-1)*4 ).limit( 4 ) .toArray(function(err, ofertas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(ofertas, count);
                    }
                    db.close();
                });
            });
        }
    });
},
obtenerCompras : function(criterio,funcionCallback){
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('compras');
            collection.find(criterio).toArray(function(err, usuarios) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(usuarios);
                }
                db.close();
            });
        }
    });
},
insertarCompra: function(compra, funcionCallback) {
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('compras');
            collection.insert(compra, function(err, result) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(result.ops[0]._id);
                } db.close();
            });
        }
    });
},
eliminarCancion : function(criterio, funcionCallback) {
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('ofertas');
            collection.remove(criterio, function(err, result) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(result);
                }
                db.close();
            });
        }
    });
},
obtenerUsuarios : function(criterio,funcionCallback){
this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
    if (err) {
        funcionCallback(null);
    } else {
        var collection = db.collection('usuarios');
        collection.find(criterio).toArray(function(err, usuarios) {
            if (err) {
                funcionCallback(null);
            } else {
                funcionCallback(usuarios);
            }
            db.close();
        });
    }
});
},
modificarCancion : function(criterio, cancion, funcionCallback) {
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('ofertas');
            collection.update(criterio, {$set: cancion}, function(err, result) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(result);
                }
                db.close();
            });
        }
    });
},

insertarUsuario : function(usuario, funcionCallback) {
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('usuarios');
            collection.insert(usuario, function(err, result) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(result.ops[0]._id);
                }
                db.close();
            });
        }
    });
},
obtenerCanciones : function(criterio,funcionCallback){
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('ofertas');
            collection.find(criterio).toArray(function(err, ofertas) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(ofertas);
                }
                db.close();
            });
        }
    });
},
insertarCancion : function(cancion, funcionCallback) {
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('ofertas');
            collection.insert(cancion, function(err, result) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(result.ops[0]._id);
                }
                db.close();
            });
        }
    });
}
*/
};