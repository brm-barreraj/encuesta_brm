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


// Inserts respuestas


INSERT INTO `enc_respuesta` VALUES (6,75,'2017-07-06 07:23:59',3,4,1),(7,75,'2017-07-06 07:23:59',3,5,2),(8,75,'2017-07-06 07:23:59',3,6,2),(9,75,'2017-07-06 07:23:59',3,7,2),(10,75,'2017-07-06 07:23:59',3,8,2),(11,100,'2017-07-06 07:23:59',3,9,3),(12,75,'2017-07-06 07:23:59',3,10,3),(13,100,'2017-07-06 07:23:59',3,11,3),(14,75,'2017-07-06 07:23:59',3,12,4),(15,75,'2017-07-06 07:23:59',3,13,4),(16,75,'2017-07-06 07:23:59',3,14,4),(17,100,'2017-07-06 07:23:59',3,15,5),(18,75,'2017-07-06 07:23:59',3,16,5),(19,75,'2017-07-06 07:23:59',3,17,5),(20,100,'2017-07-06 07:23:59',3,18,6),(21,75,'2017-07-06 07:23:59',3,19,6),(22,100,'2017-07-06 07:23:59',3,20,6),(23,75,'2017-07-06 07:23:59',3,21,6),(24,75,'2017-07-06 07:23:59',3,22,7),(25,100,'2017-07-06 07:23:59',3,23,7),(26,75,'2017-07-06 07:23:59',3,24,8),(27,75,'2017-07-06 07:23:59',3,25,8);