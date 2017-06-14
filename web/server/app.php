<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: X-Requested-With');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Content-Type: application/json');
require_once 'config.php';

use Models\Usuario;
use Models\Categoria;
use Models\Pregunta;

$request = json_decode(file_get_contents("php://input"));
$accion = $request->accion;
//$accion = $_GET['accion'];
$data = null;
// Error 0: Error por defecto
$error = 0;


switch ($accion) {

	// Login: Realiza la validación del usuario
	case "login":
		if (isset($request->usuario) && $request->usuario != "" && isset($request->contrasena) && $request->contrasena != "") {
			$usuario = $request->usuario;
			$contrasena = $request->contrasena;
			$data = Usuario::select('id','nombre','apellido','idCuenta')
			->where('usuario',$usuario)
			->where('contrasena',$contrasena)
			->first();
			if (count($data) > 0 && isset($data->id)) {
				$data = (object) $data->toArray();
				$data->id = requestHash('encode',$data->id);
				$data->idCuenta= requestHash('encode',$data->idCuenta);
				// Error 1: Los datos de usuario son corerectos
				$error = 1;
			}else{
				$data = null;
				// Error 1: Los datos de usuario son incorerectos
				$error = 2;
			}
		}else{
			// Error 3: datos request incorrectos
			$error = 3;
		}
		break;

	// Preguntas: Retorna todas las preguntas con su respectiva categoría
	case "getPreguntas":
		if (isset($request->idCuenta) && $request->idCuenta !="") {
			$idCuenta = requestHash('decode',$request->idCuenta);
			$preguntas = Categoria::select('cuenta.id AS idCuenta',
				'categoria.id AS idCategoria',
				'categoria.nombre AS categoria',
				'pregunta.id AS idPregunta',
				'pregunta.titulo AS pregunta'
				)
			->join('pregunta', 'pregunta.idCategoria', '=', 'categoria.id')
			->join('cuenta_x_categoria', 'cuenta_x_categoria.idCategoria', '=', 'categoria.id')
			->join('cuenta', 'cuenta.id', '=', 'cuenta_x_categoria.idCuenta')
			->where('cuenta.id',$idCuenta)
			->get();
			if (count($preguntas) > 0) {
				$preguntas = $preguntas->toArray();
				//Guarda las preguntas en cada categoría
				$newPreguntas = array();
				foreach ($preguntas as $pregunta) {
					$nNewPreguntas = count($newPreguntas);
					$status=true;
						for ($i=0; $i < $nNewPreguntas; $i++) { 
							if ($pregunta['idCategoria']==$newPreguntas[$i]['idCategoria']) {
								array_push($newPreguntas[$i]['preguntas'], array(
										'idPregunta'=>$pregunta['idPregunta'],
										'pregunta'=>$pregunta['pregunta']
									)
								);
								$status=false;
								break;
							}
						}
					if ($status) {
						array_push($newPreguntas, array(
							'idCategoria'=>$pregunta['idCategoria'],
							'categoria'=>$pregunta['categoria'],
							'preguntas'=>
								array(
									array(
										'idPregunta'=>$pregunta['idPregunta'],
										'pregunta'=>$pregunta['pregunta']
									)
								)
							)
						);
					}
				}
				$data = $newPreguntas;
				// Error 1: Los datos de usuario son corerectos
				$error = 1;
			}else{
				$data = null;
				// Error 1: Los datos de usuario son incorerectos
				$error = 2;
			}
		}else{
			// Error 3: datos request incorrectos
			$error = 3;
		}
		break;

	// Login: Realiza la validación del usuario
	case "setEncuesta":
		if (isset($request->idUsuario) && $request->idUsuario != "" && isset($request->respuestas)) {
			$usuario = $request->usuario;
			$respuestas = $request->respuestas;
			$data = Usuario::select('id','nombre','apellido','idCuenta')
			->where('usuario',$usuario)
			->where('contrasena',$contrasena)
			->first();
			if (count($data) > 0 && isset($data->id)) {
				$data = (object) $data->toArray();
				$data->id = requestHash('encode',$data->id);
				$data->idCuenta= requestHash('encode',$data->idCuenta);
				// Error 1: Los datos de usuario son corerectos
				$error = 1;
			}else{
				$data = null;
				// Error 1: Los datos de usuario son incorerectos
				$error = 2;
			}
		}else{
			// Error 3: datos request incorrectos
			$error = 3;
		}
		break;
	
	// Acción no encontrada
	default:
		$data = "Ups 404";
		$error = 0;
		break;
}
$result['data'] = $data;
$result['error'] = $error;
echo json_encode($result);