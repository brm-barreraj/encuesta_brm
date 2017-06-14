// Por Categoria


CREATE VIEW `enc_vista_categoria` AS
SELECT 
cat.nombre AS 'categoria',
CAST(sum(res.porcentajePregunta) AS DECIMAL) AS 'porcentajeXCategoria', 
sum(res.puntaje) AS 'puntajeXCategoria',
(count(res.puntaje) * 5) AS 'maxPuntosXCategoria',
(CAST(sum(res.porcentajePregunta) AS DECIMAL) * sum(res.puntaje))/ (count(res.puntaje) * 5)  AS 'totalXCategoría' 
FROM enc_respuesta res
inner join enc_pregunta_historial AS pre on res.idPreguntaHistorial = pre.id
inner join enc_categoria_historial AS cat on res.idCategoriaHistorial = cat.id
group by cat.id


//Por Usuario

CREATE VIEW `enc_vista_usuario` AS
SELECT 
usu.id AS 'idUsuario',
cat.nombre AS 'categoria',
CAST(sum(res.porcentajePregunta) AS DECIMAL) AS 'porcentajeXCategoria', 
sum(res.puntaje) AS 'puntajeXCategoria',
(count(res.puntaje) * 5) AS 'maxPuntosXCategoria',
(CAST(sum(res.porcentajePregunta) AS DECIMAL) * sum(res.puntaje))/ (count(res.puntaje) * 5)  AS 'totalXCategoría' 
FROM enc_respuesta res
inner join enc_pregunta_historial AS pre on res.idPreguntaHistorial = pre.id
inner join enc_categoria_historial AS cat on res.idCategoriaHistorial = cat.id
inner join enc_encuesta AS enc on res.idEncuesta = enc.id
inner join enc_usuario AS usu on enc.idUsuario = usu.id
group by cat.id


// Por cuenta

CREATE VIEW `enc_vista_cuenta` AS
SELECT 
cue.id AS 'idCuenta',
cat.nombre AS 'Categoria',
CAST(sum(res.porcentajePregunta) AS DECIMAL) AS 'PorcentajeXCategoria', 
sum(res.puntaje) AS 'puntajeXCategoria',
(count(res.puntaje) * 5) AS 'maxPuntosXCategoria',
(CAST(sum(res.porcentajePregunta) AS DECIMAL) * sum(res.puntaje))/ (count(res.puntaje) * 5)  AS 'totalXCategoría' 
FROM enc_respuesta res
inner join enc_pregunta_historial AS pre on res.idPreguntaHistorial = pre.id
inner join enc_categoria_historial AS cat on res.idCategoriaHistorial = cat.id
inner join enc_encuesta AS enc on res.idEncuesta = enc.id
inner join enc_usuario AS usu on enc.idUsuario = usu.id
inner join enc_cuenta AS cue on usu.idCuenta = cue.id
group by cat.id