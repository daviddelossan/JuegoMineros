CREATE TABLE `mano` (
  `id` int(11) NOT NULL,
  `carta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) NOT NULL,
  `Password` varchar(45) NOT NULL,
  `Nick` varchar(45) NOT NULL UNIQUE,
  `Sexo` varchar(45) NOT NULL,
  `FechaNacimiento` DATE,
  `Foto` LONGBLOB,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `partida` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Creador` int(11) NOT NULL,
  `NombrePartida` varchar(45) NOT NULL UNIQUE,
  `Fecha` DATETIME DEFAULT CURRENT_TIMESTAMP
	ON UPDATE CURRENT_TIMESTAMP,
  `Estado` varchar(45) NOT NULL,
  `Ganador` varchar(45),
  `MaxJugadores` int(11) NOT NULL,
  `NumJugadoresActual` int(11) NOT NULL,
  `TurnoActual` varchar(45),
  `TurnosRestantes` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tableros` (
  `id` int(11) NOT NULL,
  `fila` int(11) NOT NULL,
  `col` int(11) NOT NULL,
  `carta` int(11) NOT NULL,
  `id_partida` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_partida_idx` (`id_partida`),
  CONSTRAINT `tablero_partida` FOREIGN KEY (`id_partida`) REFERENCES `partida` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `jugadorpartida` (
  `id_usuario` int(11) NOT NULL,
  `id_partida` int(11) NOT NULL,
  `equipo` varchar(45) DEFAULT NULL,
  `id_mano` int(11),
  PRIMARY KEY (`id_usuario`,`id_partida`),
  KEY `id_partida_idx` (`id_partida`),
  KEY `rol_mano_idx` (`id_mano`),
  CONSTRAINT `rol_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `rol_partida` FOREIGN KEY (`id_partida`) REFERENCES `partida` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


