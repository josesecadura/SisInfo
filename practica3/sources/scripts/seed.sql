-- ------------------------------------------------------------
--  SEED
-- ------------------------------------------------------------

SET search_path TO sisinf_p3;

-- ------------------------------------------------------------
-- Tabla Usuarios
-- ------------------------------------------------------------
INSERT INTO usuario (real_name, username, descripcion, seguidores, seguidos, foto, password, bool_admin)
VALUES
  ('Alberto Gómez', 'atower', 'Cinéfilo y amante', 10, 3, 'https://fotos/imagen6.jpg', '1234', TRUE),
  ('Lucía Pérez', 'lucy', 'Me encantan las pelis románticas', 5, 6, 'https://fotos/imagen7.jpg', 'abcd', FALSE),
  ('Carlos Ruiz', 'carlitos', 'Fan de Marvel y acción', 2, 8, 'https://fotos/imagen8.jpg', 'pass', FALSE);

-- ------------------------------------------------------------
-- Tabla Películas
-- ------------------------------------------------------------
INSERT INTO pelicula (titulo, descripcion, imagen, valoracion)
VALUES
  ('Toy Story', 'Los juguetes tienen vida pero el mundo no lo sabe.', 'https://image.tmdb.org/imagen1.jpg', 9),
  ('Titanic', 'Un romance dentro de un barco, con un final inesperado.', 'https://image.tmdb.org/imagen2.jpg', 8),
  ('Spiderman', 'El mejor superhéroe de todos los tiempos.', 'https://image.tmdb.org/imagen3.jpg', 10);

-- ------------------------------------------------------------
-- Tabla Listas
-- ------------------------------------------------------------
INSERT INTO lista (nombre,imagen)
VALUES
  ('Favoritos', 'https://image.tmdb.org/imagen4.jpg'),
  ('Para compartir', 'https://image.tmdb.org/imagen5.jpg');

-- Asociación usuario-lista
INSERT INTO usuario_lista (id_user, id_lista)
VALUES
  (1, 1),
  (2, 2);

-- ------------------------------------------------------------
-- Tabla Lista-Película
-- ------------------------------------------------------------
INSERT INTO lista_pelicula (id_lista, id_pelicula)
VALUES
  (1, 1), -- Alberto -> Toy Story
  (1, 3), -- Alberto -> Spiderman
  (2, 2); -- Lucía -> Titanic

-- ------------------------------------------------------------
-- Tabla Comentarios
-- ------------------------------------------------------------
INSERT INTO comentario (id_user, id_pelicula, descripcion, num_likes)
VALUES
  (1, 1, 'Peliculón. Cada vez que la veo descubro algo nuevo.', 12),
  (2, 2, 'Me parece demasiado aburrida. Eliminarla de los cines por favor.', 25),
  (3, 3, 'La mejor película de marvel, sin duda.', 40);

-- ------------------------------------------------------------
-- Tabla Seguimientos
-- ------------------------------------------------------------
INSERT INTO usuario_seguidor (id_user, id_amigo)
VALUES
  (1, 2),
  (2, 3),
  (3, 1);

-- ------------------------------------------------------------
-- Tabla Actividades
-- ------------------------------------------------------------
INSERT INTO actividades (id_user, genero, actor)
VALUES
  (1, 'Ciencia ficción', 'Leonardo DiCaprio'),
  (2, 'Romance', 'Juan Antonio Federico Fernandez'),
  (3, 'Acción', 'Will Smith');

-- ------------------------------------------------------------
-- Tabla Ranking y Ranking Items
-- ------------------------------------------------------------
INSERT INTO ranking (titulo, descripcion, tipo, periodo, fecha)
VALUES ('Top Semana', 'Películas más valoradas de la semana', 'valoracion', 'semanal', NOW());


INSERT INTO ranking_item (id_ranking, id_pelicula, posicion, score)
VALUES
  (1, 3, 1, 9.8),
  (1, 1, 2, 9.5),
  (1, 2, 3, 8.7);

-- ------------------------------------------------------------
-- Tabla Encuestas
-- ------------------------------------------------------------
INSERT INTO encuesta (id_admin, fecha, opcion1, opcion2, opcion3, opcion4)
VALUES
  (1, CURRENT_DATE, 'Toy Story', 'Spiderman', 'Titanic', NULL);

-- ------------------------------------------------------------
-- Tabla api_key
-- ------------------------------------------------------------
INSERT INTO api_key (direccion) VALUES ('https://api.themoviedb.org');
INSERT INTO api_key (direccion) VALUES ('https://api.youtube.com');
-- ------------------------------------------------------------
-- ------------------------------------------------------------
-- ------------------------------------------------------------

