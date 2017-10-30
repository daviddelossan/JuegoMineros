"use strict";

var path = require("path");
var conexion = "conexion.js";
var express = require("express");
var app = express();
var mysql = require("mysql");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var config = require("./config");

var ficherosEstaticos = path.join(__dirname, "public");

app.set("views", path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(ficherosEstaticos));
app.use(cookieParser());

var conexion = mysql.createConnection({
    host:  config.dbHost,
    user:  config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});

var usuario = {
    id: null,
    nombre : null,
    password : null,
    nick: null,
    sexo: null,
    fecha: null,
    foto:null 
};

var partida = {
    id: null,
    creador: null,
    nombrePartida: null,
    fecha:null,
    estado: null,
    ganador: null,
    maxJugadores: null,
    numJugadoresActual: null,
    turnoActual: null,
    turnosRestantes: null,
    listaUsuarios: []
};

//Modulo de usuarios
function insertarUsuario(usuario, callback) {
        var sql = "INSERT INTO usuario (Nombre, Password, Nick, Sexo, FechaNacimiento, Foto) VALUES (?, ?, ?, ?, ?, ?)";
            conexion.query(sql, [usuario.nombre, usuario.password, usuario.nick, usuario.sexo, usuario.fecha, usuario.foto],
        function(err, rows) {
            if (err) {
                    console.error(err);
                    callback(err, "undefined");
            } else {
                    console.log("Ha ido bien");
                    callback(null, rows);
            }
        });
};
function loguearUsuario (user, callback){
    if (callback === undefined) callback = function() {};
    var sql = "SELECT * " +
            "FROM usuario " + 
            "WHERE '"+ user.nick + "' = Nick "+
            "AND '"+ user.password + "' = Password"+
            ";";
    conexion.query(sql,
    function(err, rows){
        if(err){
            callback(err, "undefined");
        }
        else{
            var resultado = rows[0];
            if(rows === ""){
                err = "No se ha encontrado el usuario";
                callback(err, "undefined");
            }
            else{//Devolvemos el resultado
                callback(null, resultado);
            }
        }
    });
    
}
//Modulo partidas
function insertarPartida(partida, callback) {
        var sql = "INSERT INTO partida (Creador, NombrePartida, Estado, Ganador, MaxJugadores, NumJugadoresActual, TurnoActual, TurnosRestantes) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ";
            conexion.query(sql, [partida.creador, partida.nombrePartida, partida.estado, partida.ganador, partida.maxJugadores, partida.numJugadoresActual,
            partida.turnoActual, partida.turnosRestantes],
        function(err, rows) {
            if (err) {
                    console.error(err);
            } else {
                    
                    console.log("Partida creada");
               buscarIdPartida(partida, function(err, resultado){
                    var sql = "INSERT INTO jugadorpartida (id_usuario, id_partida, equipo, id_mano) VALUES (?, ?, ?, ?)";
                    conexion.query(sql, [resultado.Creador, resultado.id, null, null],
                    function(err, rows) {
                        if (err) {
                                console.error(err);
                                console.log("No he insertado en jugadorpartida");
                        } else {
                            console.log("He insertado bien en jugadorpartida");
                        }
                    });
                    
               });
            }
        });
}
function buscarIdPartida(partida, callback){
     if (callback === undefined) callback = function() {};
    var sql = "SELECT * " +
            "FROM partida " + 
            "WHERE '"+ partida.nombrePartida + "' = NombrePartida "+
            ";";
    conexion.query(sql,
    function(err, rows){
        if(err){
            err = "No se ha encontrado la partida";
            console.error("No he encontrado la partida.");
            callback(err, 'undefined');
        }
        else{ //Devolvemos el resultado
            var resultado = rows[0];
            callback(null, resultado);
        }
    });
}
function recuperarPartidasAbiertas(usuario, callback){
    if (callback === undefined) callback = function() {};
    var sql = "SELECT * " +
            "FROM partida " + 
            "WHERE '"+ usuario.id + "' = Creador "+
            "AND Estado = 'Abierta'"+
            ";";
 
    conexion.query(sql,
    function(err, rows){
        if(err){
            err = "No se han encontrado partidas";
            callback(err, 'undefined');
        }
        else{
            //Devolvemos el resultado
            var resultadoPartida = rows;
            callback(null, resultadoPartida);
        }
    });
}
function recuperarPartidasJugando(usuario, callback){
     if (callback === undefined) callback = function() {};
    var sql = "SELECT partida.NombrePartida, partida.Creador, partida.Fecha, partida.TurnoActual, usuario.Nick " +
            "FROM partida, jugadorpartida, usuario " + 
            "WHERE '"+ usuario.id + "' = jugadorpartida.id_usuario "+
            "AND jugadorpartida.id_partida = partida.id "+
            "AND Estado = 'Jugando'"+
            "AND usuario.id = partida.Creador "+
            ";";
    conexion.query(sql,
    function(err, rows){
        if(err){
            err = "No se han encontrado partidas";
            console.log("Me meto en el error de jugando");
            callback(err, 'undefined');
        }
        else{
            //Devolvemos el resultado
            var resultado = rows;
            callback(null, resultado);
        }
    });
}
function recuperarPartidasTerminadas(usuario, callback){
    if (callback === undefined) callback = function() {};
    var sql = "SELECT partida.NombrePartida, partida.Creador, partida.Fecha, partida.TurnoActual, usuario.Nick, jugadorpartida.equipo, partida.Ganador " +
            "FROM partida, jugadorpartida, usuario " + 
            "WHERE '"+ usuario.id + "' = jugadorpartida.id_usuario "+
            "AND jugadorpartida.id_partida = partida.id "+
            "AND Estado = 'Terminada' "+
            "AND usuario.id = partida.Creador "+
            ";";
    conexion.query(sql,
    function(err, rows){
        if(err){
            err = "No se han encontrado partidas";
            callback(err, 'undefined');
        }
        else{
            //Devolvemos el resultado
            var resultado = rows;
            callback(null, resultado);
        }
    });
}
function unirsePartida(usuario, partida, callback){
    buscarIdPartida(partida, function(err, resultado){
        if(resultado !== "undefined"){
            if(resultado.NumJugadoresActual + 1 <= resultado.MaxJugadores){
                partida.id = resultado.id;
                partida.numJugadoresActual = resultado.NumJugadoresActual + 1;
                var sql = "INSERT INTO jugadorpartida (id_usuario, id_partida) VALUES (?, ?)";
                conexion.query(sql, [usuario.id, partida.id],
                function(err, rows) {
                    if (err) {
                            console.error(err);
                    } else {
                            console.log("Ha ido bien el insert en jugadorpartida");
                            var sql;
                            if(resultado.MaxJugadores > resultado.NumJugadoresActual + 1){
                                 sql = "UPDATE partida SET NumJugadoresActual = " + partida.numJugadoresActual +" where partida.id = '" + partida.id + "';";
                                 conexion.query(sql,
                                    function(err, rows) {
                                        if (err) {
                                                console.error(err);
                                        } else {
                                                console.log("Ha ido bien el update en partida");
                                                callback(null, rows);
                                        }
                                   });
                            }
                            else{
                                 resultado.NumJugadoresActual = resultado.MaxJugadores;
                                 console.log(resultado);
                                 cerrarPartida(resultado, function(err, resultado){
                                     if(err){
                                         console.error("He cerrado mal una partida automaticamente");
                                     }
                                     else{
                                         console.log("He cerrado bien automaticamente una partida");
                                         callback(null, rows);
                                     }
                                 });
                            }
                    }
                });
            }
        }
    });
};
function listarPartidasDisponibles(usuario, callback){
    if (callback === undefined) callback = function() {};
    var sql = "SELECT partida.id, partida.NombrePartida, partida.Fecha, partida.MaxJugadores, usuario.Nick " +
            "FROM partida, jugadorpartida, usuario " + 
            "WHERE '"+ usuario.id + "' <> jugadorpartida.id_usuario "+
            "AND NumJugadoresActual < MaxJugadores "+
            "AND partida.id = jugadorpartida.id_partida "+
            "AND usuario.id = jugadorpartida.id_usuario "+
            "AND Estado = 'Abierta' "+
            "AND partida.id NOT IN (SELECT jugadorpartida.id_partida FROM jugadorpartida WHERE '"+ usuario.id +"' =jugadorpartida.id_usuario) "+
            "ORDER BY partida.id;";
 
    conexion.query(sql,
    function(err, rows){
        if(err){
            err = "No se han encontrado partidas";
            console.log("ERROR AL RECUPERRAR PARTIDAS");
            callback(err, 'undefined');
        }
        else{
            //Devolvemos el resultado
            var resultadoPartidas = rows;
            callback(null, resultadoPartidas);
        }
    });
};
function cerrarPartida(partida, callback){
    listarUsuariosPartida(partida, function(err, listaUsuarios){
        if(listaUsuarios.length >= 3){
            var turno = Math.floor(Math.random() * listaUsuarios.length);
            var maxTurnos;
            switch(listaUsuarios.length){
              case 3:{maxTurnos = 50;};break;
              case 4:{maxTurnos = 45;};break;
              case 5:{maxTurnos = 40;};break;
              case 6:{maxTurnos = 40;};break;
              case 7:{maxTurnos = 35;};break;
            }
            var sql = "UPDATE partida SET NumJugadoresActual ='"+ partida.numJugadoresActual+"', Estado = 'Jugando', TurnoActual = '"
                    +listaUsuarios[turno]+"', TurnosRestantes='" + maxTurnos +"' where partida.id = '" + partida.id + "';";
              conexion.query(sql,
                  function(err, rows) {
                      if (err) {
                           console.error(err);
                           callback(err, "undefined");
                      } else {
                           console.log("Ha ido bien el update en cerrar partida");
                           callback(null, rows);
                      }
                  });
        }
        else{
          console.error("No hay suficientes jugadores");
        }
    });
}
function listarUsuariosPartida(partida, callback){
  if (callback === undefined) callback = function() {};
    var sql = "SELECT Nick " +
            "FROM usuario, jugadorpartida " + 
            "WHERE '"+ partida.id + "' = jugadorpartida.id_partida "+
            "AND usuario.id = jugadorpartida.id_usuario"+
            ";";
 
    conexion.query(sql,
    function(err, rows){
        if(err){
            err = "No se han encontrado partidas";
            console.log("No hay jugadores");
            callback(err, 'undefined');
        }
        else{
            //Devolvemos el resultado
            var listaUsuarios = [];
            rows.forEach(function (usuario, i){
                listaUsuarios.push(rows[i].Nick);
            });
            callback(null, listaUsuarios);
        }
    });  
};

app.get('/registro.html', function (request, response) {
  response.status(200);
  response.render("registro");
});
app.get("/procesar_formulario_get.html", function(request, response) {
    var sexoStr = "No especificado";
    switch (request.query.sexo) {
        case "H": sexoStr = "Hombre"; break;
        case "M": sexoStr = "Mujer"; break;
    }
    usuario.nombre = request.query.nombre;
    usuario.password = request.query.password;
    usuario.nick = request.query.nick;
    usuario.sexo = sexoStr;
    usuario.fecha = request.query.fecha;
    usuario.foto = request.query.foto;
    insertarUsuario(usuario, function(err, resultado){
         if(err){
                console.error("Ya existe alguien con ese Nick");
                response.render("registro");
         } else{
                loguearUsuario(usuario, function(err, resultado){
                response.cookie("nombre", resultado.Nombre);
                response.cookie("nick", resultado.Nick);
                response.cookie("id", resultado.id);
                response.cookie("sexo", resultado.Sexo);
                response.cookie("password", resultado.Password);
                response.cookie("foto", resultado.Foto);
                response.redirect("welcome.html");
            });
        }
    });
});
app.get('/login.html', function(request, response){
     response.cookie("nombre", null);
    response.cookie("nick", null);
    response.cookie("id", null);
    response.cookie("sexo", null);
    response.cookie("password", null);
    response.cookie("foto", null);
    response.render("login", null);
});
app.get('/procesar_login.html', function(request, response){
    usuario.nick = request.query.nick;
    usuario.password = request.query.password;
    
    loguearUsuario(usuario, function(err, resultado){
         if(resultado !== "undefined"){
                usuario.id = resultado.id;
                usuario.nombre = resultado.Nombre;
                usuario.nick = resultado.Nick;
                usuario.sexo = resultado.Sexo;
                usuario.password = resultado.Password;

                response.cookie("nombre", usuario.nombre);
                response.cookie("nick", usuario.nick);
                response.cookie("id", usuario.id);
                response.cookie("sexo", usuario.sexo);
                response.cookie("password", usuario.password);
                     
                response.redirect("welcome.html"); 
             }
         else{
                console.error("NO LOGUEO");
                response.render("login", null);
            }
    });
});
app.get('/desconectar.html', function(request, response){
    response.cookie("nombre", null);
    response.cookie("nick", null);
    response.cookie("id", null);
    response.cookie("sexo", null);
    response.cookie("password", null);
    response.cookie("foto", null);
    response.render("index", null);
});
app.get('/nueva_partida.html', function(request, response){
    usuario.id = request.cookies.id;
    usuario.sexo = request.cookies.sexo;
    usuario.nombre = request.cookies.nombre;
    usuario.nick = request.cookies.nick;
    usuario.password = request.cookies.password;
    usuario.foto = request.cookies.foto;
    response.render("nueva_partida",{usuario:usuario});
});
app.get('/nueva_partida_get.html', function(request, response){
    
    partida.nombrePartida = request.query.nombrePartida;
    partida.maxJugadores = request.query.maxJugadores;
    partida.creador = request.cookies.id;
    partida.numJugadoresActual  = 1;
    partida.turnosRestantes = 40;
    partida.estado = "Abierta";
    usuario.id = request.cookies.id;
    usuario.sexo = request.cookies.sexo;
    usuario.nombre = request.cookies.nombre;
    usuario.foto = request.cookies.foto;
    
    if((partida.maxJugadores <= 7) &&(partida.maxJugadores >= 3) ){
         insertarPartida(partida);
         response.redirect("welcome.html");  
    }
    else{
        response.render("nueva_partida", {usuario:usuario
        });
    }         
});
app.get('/welcome.html', function(request, response){
    usuario.id = request.cookies.id;
    usuario.sexo = request.cookies.sexo;
    usuario.nombre = request.cookies.nombre;
    usuario.nick = request.cookies.nick;
    usuario.password = request.cookies.password;
    usuario.foto = request.cookies.foto;
    recuperarPartidasAbiertas(usuario, function(err, resultadoPartida){
        var listaPartidasActivas = resultadoPartida;                   
        recuperarPartidasJugando(usuario, function(err, resultadoJugando){
            var listaPartidasJugando = resultadoJugando;                
            recuperarPartidasTerminadas(usuario, function(err, resultadoTerminadas){
                var listaPartidasTerminadas = resultadoTerminadas;
                response.render("welcome", {usuario: usuario,
                                            partida:partida,
                                            listaPartidasActivas:listaPartidasActivas,
                                            listaPartidasJugando: listaPartidasJugando,
                                            listaPartidasTerminadas: listaPartidasTerminadas,
                                            nombrePartida:partida.nombrePartida
                                            });      
            });
        });
    }); 
});
app.get('/unirse_partida.html', function(request, response){
    usuario.id = request.cookies.id;
    usuario.sexo = request.cookies.sexo;
    usuario.nombre = request.cookies.nombre;
    usuario.nick = request.cookies.nick;
    usuario.password = request.cookies.password;
    usuario.foto = request.cookies.foto;
    listarPartidasDisponibles(usuario, function(err, resultado){
        if(resultado !== "undefined"){
            var idActual = null;
            var listaPartidas = new Array();
            for(var i = 0; i < resultado.length; ++i){
                var idLeido = resultado[i].id;
                var listaUsuarios = [];
                var aux = {};
               
               if(idLeido !== idActual){
                   aux.nombrePartida = resultado[i].NombrePartida;
                   aux.fecha = resultado[i].Fecha;
                   aux.id = idLeido;
                   aux.maxJugadores = resultado[i].MaxJugadores;
                   listaUsuarios.push(resultado[i].Nick);
                   idActual = idLeido;
                   aux.listaUsuarios = listaUsuarios;
                   listaPartidas[idActual] = aux;         
                }
                else{
                    aux.id = listaPartidas[idActual].id;
                    aux.fecha = listaPartidas[idActual].fecha;
                    aux.nombrePartida = listaPartidas[idActual].nombrePartida;
                    aux.maxJugadores = listaPartidas[idActual].maxJugadores;
                    aux.listaUsuarios = listaPartidas[idActual].listaUsuarios;
                    aux.listaUsuarios.push(resultado[i].Nick);
                    listaPartidas[idActual] = aux;
                }
            }
            response.render("unirse_partida", {usuario:usuario,
                                                listaPartidas: listaPartidas               
            });
        }
    });
});
app.get('/unirse_partida_get.html', function(request, response){
    usuario.id = request.cookies.id;
    usuario.nick = request.cookies.nick;
    usuario.nombre = request.cookies.nombre;
    usuario.sexo = request.cookies.sexo;
    usuario.foto = request.cookies.foto;
    partida.nombrePartida = request.query.partidaEnviada;
    
    unirsePartida(usuario, partida, function(err, resultado){
        response.redirect("unirse_partida.html");
    });
});
app.get('/cerrar_partida_get.html', function(request, response){
    partida.id = request.query.partidaEnviada;
    cerrarPartida(partida, function(err, resultadoCerrar){
        response.redirect("welcome.html");
    });
});
app.get('/abrir_partida_get.html', function(request, response){
    console.log(request.query);
    partida.nombrePartida = request.query.partidaAbrir;
    usuario.id = request.cookies.id;
    usuario.sexo = request.cookies.sexo;
    usuario.nombre = request.cookies.nombre;
    usuario.nick = request.cookies.nick;
    usuario.password = request.cookies.password;
    usuario.foto = request.cookies.foto;
    buscarIdPartida(partida, function(err, resultado){
        partida = resultado;
        listarUsuariosPartida(partida, function(err, resultado){
            var listaUsuarios = resultado;
            response.render("partida", {usuario: usuario,
                                        partida: partida,
                                        listaUsuarios: listaUsuarios
                                        });
        });
    });
});
app.listen(config.port, function () {
  console.log('Escuchando el puerto 3000');
});