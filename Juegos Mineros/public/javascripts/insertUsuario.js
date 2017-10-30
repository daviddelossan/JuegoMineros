"use strict";

var mysql = require("mysql");

var conexion = mysql.createConnection({
    host:  "localhost",
    user:  "root",
    password: "1234",
    database: "mibd"
});

/*
 * 
 * INSERT INTO `mibd`.`usuario`(`Nombre`,`Password`,`Nick`,`Sexo`)VALUES("David","patata","Phottox","Hombre");

 * 
 * 
 */

conexion.connect(function (err) {
    if (err) {
        console.error(err);
    } else {
        conexion.query("INSERT INTO `mibd`.`usuario` ('Nombre', 'Password', 'Nick', 'Sexo') VALUES ('Juan', 'pito', 'Karverk', 'Mujer');",
        function(err, rows) {
            if (err) {
                console.error(err);
            } else {
                rows.forEach(function(row) {
                    console.log(row);
                });
            }
            conexion.end();
        });
    }
});