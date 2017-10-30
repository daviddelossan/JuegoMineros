"use strict";

var mysql = require("mysql");

var conexion = mysql.createConnection({
    host:  "localhost",
    user:  "root",
    password: "1234",
    database: "mibd"
});

conexion.connect(function (err) {
    if (err) {
        console.error(err);
    } else {
        conexion.query("SELECT u.Nombre, u.Password, u.Nick, u.Sexo FROM usuario u",
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