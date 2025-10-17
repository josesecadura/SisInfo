-- ------------------------------------------------------------
--  DDL SCRIPT
-- ------------------------------------------------------------

-- Crear esquema 
CREATE SCHEMA IF NOT EXISTS sisinf_p3;
SET search_path TO sisinf_p3;

-- ------------------------------------------------------------
-- Tabla usuario
-- ------------------------------------------------------------
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    real_name VARCHAR,
    username VARCHAR NOT NULL UNIQUE,
    descripcion VARCHAR,
    seguidores INTEGER DEFAULT 0,
    seguidos INTEGER DEFAULT 0,
    foto VARCHAR,
    password VARCHAR NOT NULL,
    bool_admin BOOLEAN DEFAULT FALSE
);

-- ------------------------------------------------------------
-- Tabla lista
-- ------------------------------------------------------------
CREATE TABLE lista (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR,
    imagen VARCHAR
);

-- ------------------------------------------------------------
-- Tabla encuesta
-- ------------------------------------------------------------
CREATE TABLE encuesta (
    id SERIAL PRIMARY KEY,
    id_admin INTEGER NOT NULL,
    fecha DATE,
    opcion1 VARCHAR NOT NULL,
    opcion2 VARCHAR NOT NULL,
    opcion3 VARCHAR,
    opcion4 VARCHAR,
    porcentaje1 INTEGER DEFAULT 0,
    porcentaje2 INTEGER DEFAULT 0,
    porcentaje3 INTEGER DEFAULT 0,
    porcentaje4 INTEGER DEFAULT 0,
    CONSTRAINT fk_encuesta_admin FOREIGN KEY (id_admin) REFERENCES usuario (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabla pelicula
-- ------------------------------------------------------------
CREATE TABLE pelicula (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR,
    descripcion VARCHAR,
    imagen VARCHAR,
    valoracion INTEGER
);

-- ------------------------------------------------------------
-- Tabla comentario
-- ------------------------------------------------------------
CREATE TABLE comentario (
    id SERIAL PRIMARY KEY,
    id_user INTEGER NOT NULL,
    id_pelicula INTEGER NOT NULL,
    descripcion VARCHAR,
    num_likes INTEGER DEFAULT 0,
    CONSTRAINT fk_comentario_usuario FOREIGN KEY (id_user) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT fk_comentario_pelicula FOREIGN KEY (id_pelicula) REFERENCES pelicula (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabla usuario_lista
-- ------------------------------------------------------------
CREATE TABLE usuario_lista (
    id_user INTEGER NOT NULL,
    id_lista INTEGER NOT NULL,
    CONSTRAINT fk_usuario_lista_usuario FOREIGN KEY (id_user) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_lista_lista FOREIGN KEY (id_lista) REFERENCES lista (id) ON DELETE CASCADE,
    CONSTRAINT uq_usuario_lista UNIQUE (id_user, id_lista)
);

CREATE INDEX idx_usuario_lista_user ON usuario_lista (id_user);
CREATE INDEX idx_usuario_lista_lista ON usuario_lista (id_lista);

-- ------------------------------------------------------------
-- Tabla lista_pelicula
-- ------------------------------------------------------------
CREATE TABLE lista_pelicula (
    id_lista INTEGER NOT NULL,
    id_pelicula INTEGER NOT NULL,
    CONSTRAINT fk_lista_pelicula_lista FOREIGN KEY (id_lista) REFERENCES lista (id) ON DELETE CASCADE,
    CONSTRAINT fk_lista_pelicula_pelicula FOREIGN KEY (id_pelicula) REFERENCES pelicula (id) ON DELETE CASCADE,
    CONSTRAINT uq_lista_pelicula UNIQUE (id_lista, id_pelicula)
);

CREATE INDEX idx_lista_pelicula_lista ON lista_pelicula (id_lista);
CREATE INDEX idx_lista_pelicula_pelicula ON lista_pelicula (id_pelicula);

-- ------------------------------------------------------------
-- Tabla usuario_seguidor
-- ------------------------------------------------------------
CREATE TABLE usuario_seguidor (
    id_user INTEGER NOT NULL,
    id_amigo INTEGER NOT NULL,
    CONSTRAINT fk_usuario_seguidor_user FOREIGN KEY (id_user) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_seguidor_amigo FOREIGN KEY (id_amigo) REFERENCES usuario (id) ON DELETE CASCADE,
    CONSTRAINT uq_usuario_seguidor UNIQUE (id_user, id_amigo),
    CONSTRAINT ck_no_auto_follow CHECK (id_user <> id_amigo)
);

-- ------------------------------------------------------------
-- Tabla actividades
-- ------------------------------------------------------------
CREATE TABLE actividades (
    id_user INTEGER PRIMARY KEY,
    genero VARCHAR,
    actor VARCHAR,
    CONSTRAINT fk_actividades_usuario FOREIGN KEY (id_user) REFERENCES usuario (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Tabla ranking
-- ------------------------------------------------------------
CREATE TABLE ranking (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR NOT NULL,
    descripcion VARCHAR,
    tipo VARCHAR NOT NULL,     -- popularidad, valoracion, estrenos, genero
    periodo VARCHAR,           -- semanal, mensual, global
    fecha TIMESTAMP
);

-- ------------------------------------------------------------
-- Tabla ranking_item
-- ------------------------------------------------------------
CREATE TABLE ranking_item (
    id SERIAL PRIMARY KEY,
    id_ranking INTEGER NOT NULL,
    id_pelicula INTEGER NOT NULL,
    posicion INTEGER NOT NULL,
    score FLOAT,
    CONSTRAINT fk_ranking_item_ranking FOREIGN KEY (id_ranking) REFERENCES ranking (id) ON DELETE CASCADE,
    CONSTRAINT fk_ranking_item_pelicula FOREIGN KEY (id_pelicula) REFERENCES pelicula (id) ON DELETE CASCADE,
    CONSTRAINT uq_ranking_item_movie UNIQUE (id_ranking, id_pelicula),
    CONSTRAINT uq_ranking_item_position UNIQUE (id_ranking, posicion)
);

CREATE INDEX idx_ranking_item_ranking ON ranking_item (id_ranking);
CREATE INDEX idx_ranking_item_pelicula ON ranking_item (id_pelicula);

-- ------------------------------------------------------------
-- Tabla api_key
-- ------------------------------------------------------------
CREATE TABLE api_key (
    id SERIAL PRIMARY KEY,
    direccion VARCHAR
);
-- ------------------------------------------------------------
-- ------------------------------------------------------------
-- ------------------------------------------------------------

