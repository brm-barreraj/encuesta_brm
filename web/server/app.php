<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: X-Requested-With');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
//header('Content-Type: application/json');
require_once 'config.php';

use Models\Encuesta;
use Models\Usuario;
use Models\Categoria;
use Models\Pregunta;
use Models\Respuesta;
use Models\CategoriaHistorial;
use Models\PreguntaHistorial;
use Models\Cuenta;
use Models\Admin;
use Models\CategoriaRespuesta;


$request = (object) $_POST;
$accion = (isset($request->accion)) ? $request->accion : null ;
//$accion = $_GET['accion'];
$data = null;
// Error 0: Error por defecto
$error = 0;


function getRangoSemestre($anioActual = null,$mesActual = null){
	$anioActual = ($anioActual == null) ? date("Y") : $anioActual;
	$mesActual = ($mesActual == null) ? date("m") : $mesActual;
	// Se selecciona el rango de las fechas de l semestre actual
	if ((int)$mesActual >= 1 && (int)$mesActual <= 6) {
		$fechaDesde = $anioActual.'-01-01 00:00:00';
		$fechaHasta = $anioActual.'-06-31 23:59:59';
	}else{
		$fechaDesde = $anioActual.'-07-01 00:00:00';
		$fechaHasta = $anioActual.'-12-31 23:59:59';
	}
	$rango = new stdClass();
	$rango->desde = $fechaDesde;
	$rango->hasta = $fechaHasta;
	return $rango;
}

function groupArray($array,$fieldsIni,$groupFiel){
	$newArray = array();
	foreach ($array as $arrayIni) {
		$nNewArray = count($newArray);
		$status=true;
			for ($i=0; $i < $nNewArray; $i++) { 
				if ($arrayIni[$fieldsIni[0]]==$newArray[$i][$fieldsIni[0]]) {
					$arrTemp = $arrayIni;
					foreach ($fieldsIni as $field) {
						unset($arrTemp[$field]);
					}
					array_push($newArray[$i][$groupFiel], $arrTemp);
					$status=false;
					break;
				}
			}
		if ($status) {
			$arrTemp = $arrayIni;
			$subArray = array();
			foreach ($fieldsIni as $field) {
				unset($arrTemp[$field]);
				$subArray[$field] = $arrayIni[$field];
			}
			$subArray[$groupFiel] = array($arrTemp);
			array_push($newArray, $subArray);
		}
	}
	return $newArray;
}

function getEncuesta(){
	$rangoFecha = getRangoSemestre();
	$encuestas = CategoriaHistorial::
	select(
		'respuesta.puntaje AS puntaje',
		'respuesta.idCategoriaHistorial AS idCategoriaHistorial',
		'respuesta.idPreguntaHistorial AS idPreguntaHistorial',
		'pregunta_historial.id AS idPregunta',
		'pregunta_historial.titulo AS pregunta',
		'categoria_historial.porcentaje AS porcentajeCategoria',
		'categoria_historial.nombre AS categoria',
		'usuario.nombre AS nombreUsuario',
		'usuario.apellido AS apellidoUsuario',
		'usuario.id AS idUsuario',
		'cuenta.id AS idCuenta',
		'cuenta.nombre AS cuenta'
	)
	->join('respuesta','categoria_historial.id','=','respuesta.idCategoriaHistorial')
	->join('pregunta_historial', 'respuesta.idPreguntaHistorial', '=', 'pregunta_historial.id')
	->join('encuesta', 'encuesta.id', '=', 'respuesta.idEncuesta')
	->join('usuario', 'encuesta.idUsuario', '=', 'usuario.id')
	->join('cuenta', 'usuario.idCuenta', '=', 'cuenta.id')
	->where('encuesta.fecha','>=',$rangoFecha->desde)
	->where('encuesta.fecha','<=',$rangoFecha->hasta)
	->get()
	->toArray();
	// Cuentas
	$cuentas = groupArray($encuestas,array('idCuenta','cuenta'),'respuestas');
	$nCuentas = count($cuentas);
	// Categorias
	for ($i=0; $i < $nCuentas; $i++) { 
		$categorias = groupArray($cuentas[$i]['respuestas'],array('idCategoriaHistorial','categoria','porcentajeCategoria'),'respuestas');
		unset($cuentas[$i]['respuestas']);
		$cuentas[$i]['categorias'] = $categorias;
		// Usuarios
		$nCategorias = count($cuentas[$i]['categorias']);
		for ($j=0; $j < $nCategorias; $j++) { 
			$usuarios = groupArray($cuentas[$i]['categorias'][$j]['respuestas'],array('idUsuario','nombreUsuario','apellidoUsuario'),'respuestas');
			unset($cuentas[$i]['categorias'][$j]['respuestas']);
			$cuentas[$i]['categorias'][$j]['usuarios'] = $usuarios;
		}
	}
	return $cuentas;
}

switch ($accion) {
	// Public
	
		// Trae todas las respuestas de las encuestas
		case 'getEncuestas':
			$encuestas = getEncuesta();
			$nEncuestas = count($encuestas);
			for ($i=0; $i < $nEncuestas; $i++) { 
				$categorias = $encuestas[$i]['categorias'];
				$nCategorias = count($categorias);
				$totalPromedioPeso = 0;
				$totalPorcentajeCategoria  = 0;
				for ($k=0; $k < $nCategorias; $k++) { 
					$usuarios = $encuestas[$i]['categorias'][$k]['usuarios'];
					$nUsuarios = count($usuarios);
					$totalPuntajePregunta = 0;
					for ($l=0; $l < $nUsuarios; $l++) { 
						$respuestas = $encuestas[$i]['categorias'][$k]['usuarios'][$l]['respuestas'];
						$nRespuestas = count($respuestas);
						$totalPuntajeUsuario = 0;
						for ($j=0; $j < $nRespuestas; $j++) { 
							$totalPuntajeUsuario += $respuestas[$j]['puntaje'];
						}
						$promedioUsuarioPregunta = ($totalPuntajeUsuario/$nRespuestas);
						$totalPuntajePregunta += $promedioUsuarioPregunta;
						$encuestas[$i]['categorias'][$k]['usuarios'][$l]['promedioUsuarioPregunta'] = $promedioUsuarioPregunta;
					}
					$promedioPregunta = ($totalPuntajePregunta/$nUsuarios);
					$encuestas[$i]['categorias'][$k]['promedioPregunta'] = round($promedioPregunta,2);
					$porcentajeCategoria = $encuestas[$i]['categorias'][$k]['porcentajeCategoria'];
					$promedioPeso = (($promedioPregunta*$porcentajeCategoria)/100);
					$totalPromedioPeso += $promedioPeso;
					$encuestas[$i]['categorias'][$k]['promedioPeso'] = $promedioPeso;
					$totalPorcentajeCategoria += $porcentajeCategoria;
				}
				$encuestas[$i]['totalPromedioPeso'] = $totalPromedioPeso;
				$encuestas[$i]['totalPorcentajeCategoria'] = $totalPorcentajeCategoria;
				$encuestas[$i]['total'] = round((100 * $totalPromedioPeso)/ $totalPorcentajeCategoria,2);
			}
			if (count($encuestas) > 0) {
				$data = $encuestas;
				$error = 1;
			}else{
				$error = 2;
			}
			break;
		
		// Login: Realiza la validación del usuario
		case "login":
			if (isset($request->usuario) && $request->usuario != "" && isset($request->contrasena) && $request->contrasena != "") {
				$usuario = $request->usuario;
				$contrasena = $request->contrasena;
				$data = Usuario::select('usuario.id','usuario.nombre','usuario.apellido','usuario.idCuenta','cuenta.nombre AS nombreCuenta','cuenta.imagen AS imagenCuenta','cuenta.color AS colorCuenta')
				->join('cuenta', 'usuario.idCuenta', '=', 'cuenta.id')
				->where('usuario',$usuario)
				->where('contrasena',requestHash("encode", $contrasena))
				->first();
				if (count($data) > 0 && isset($data->id)) {
					$data = (object) $data->toArray();
					// Valida si el usuario no ha realizado la encuesta el semestre actual
					$encuestaCreada = Encuesta::select('id')
					->where('fecha','>=',getRangoSemestre()->desde)
					->where('fecha','<=',getRangoSemestre()->hasta)
					->where('idUsuario',$data->id)
					->first();
					if (!isset($encuestaCreada) || $encuestaCreada == null || $encuestaCreada == '') {
						$data->id = requestHash('encode',$data->id);
						$data->idCuenta= requestHash('encode',$data->idCuenta);
						// Error 1: Los datos de usuario son corerectos
						$error = 1;
					}else{
						$data = null;
						// Error 4: El usuario ya respondio la encuesta este semestre
						$error = 4;
					}
				}else{
					$data = null;
					// Error 2: Los datos de usuario son incorerectos
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
					'categoria.idCategoriaHistorial AS idCategoria',
					'categoria.nombre AS categoria',
					'pregunta.idPreguntaHistorial AS idPregunta',
					'pregunta.titulo AS pregunta'
					)
				->join('pregunta', 'pregunta.idCategoria', '=', 'categoria.id')
				->join('cuenta_x_categoria', 'cuenta_x_categoria.idCategoria', '=', 'categoria.id')
				->join('cuenta', 'cuenta.id', '=', 'cuenta_x_categoria.idCuenta')
				->where('cuenta.id',$idCuenta)
				->get();
				if (count($preguntas) > 0) {
					$preguntas = $preguntas->toArray();
					$newPreguntas = groupArray($preguntas,array('idCategoria','categoria'),'preguntas');
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

		// setEncuesta: Guarda el formulario de una encuesta
		case "setEncuesta":
			if (isset($request->idUsuario) && $request->idUsuario != "" && isset($request->respuestas) && count($request->respuestas) > 0 && isset($request->comentarios) && count($request->comentarios) > 0) {
				$idUsuario = requestHash('decode',$request->idUsuario);
				$respuestas = json_decode($request->respuestas);
				$comentarios = json_decode($request->comentarios);
				// Valida si el usuario no ha realizado la encuesta el semestre actual
				$data = Encuesta::select('id')
				->where('fecha','>=',getRangoSemestre()->desde)
				->where('fecha','<=',getRangoSemestre()->hasta)
				->where('idUsuario',$idUsuario)
				->first();
				if (!isset($data) || $data == null || $data == '') {
					// Inserta una nueva encuesta
					$encuesta = new Encuesta;
					$encuesta->fecha = date("Y-m-d H:i:s");
					$encuesta->idUsuario = $idUsuario;
					$encuesta->save();
					$idEncuesta = $encuesta->id;
					// Inserta cada respuesta
					foreach ($respuestas as $respuesta) {
						if ($respuesta->idCategoria > 0 && $respuesta->idPregunta > 0 && $respuesta->puntaje > 0) {
							$idCategoria = $respuesta->idCategoria;
							$idPregunta = $respuesta->idPregunta;
							$puntaje = $respuesta->puntaje;
							// Inserta las respuestas de una encuesta
							$respuesta = new Respuesta;
							$respuesta->puntaje = ($puntaje*25);
							$respuesta->fecha = date("Y-m-d H:i:s");
							$respuesta->idEncuesta = $idEncuesta;
							$respuesta->idPreguntaHistorial = $idPregunta;
							$respuesta->idCategoriaHistorial = $idCategoria;
							$respuesta->save();
							unset($respuesta);
						}
					}
					// Inserta comentarios por cada categoría
					foreach ($comentarios as $comentario) {
						if ($comentario->idCategoria > 0 && $comentario->texto != "") {
							$idCategoria = $comentario->idCategoria;
							$texto = $comentario->texto;
							// Inserta las respuestas de una encuesta
							$comentario = new CategoriaRespuesta;
							$comentario->comentario = $texto;
							$comentario->fecha = date("Y-m-d H:i:s");
							$comentario->idEncuesta = $idEncuesta;
							$comentario->idCategoriaHistorial = $idCategoria;
							$comentario->save();
							unset($comentario);
						}
					}
					// Error 1: Los datos de usuario son corerectos
					$error = 1;
				}else{
					$data = null;
					// Error 2: El usuario ya respondio la encuesta este semestre
					$error = 2;
				}
			}else{
				// Error 3: datos request incorrectos
				$error = 3;
			}
			break;
	// Admin

		// Login: Realiza la validación del usuario
		case "loginAdmin":
			if (isset($request->correo) && $request->correo != "" && isset($request->contrasena) && $request->contrasena != "") {
				$correo = $request->correo;
				$contrasena = $request->contrasena;
				$data = Admin::select('admin.id','admin.nombre','admin.apellido')
				->where('correo',$correo)
				->where('contrasena',requestHash("encode", $contrasena))
				->first();
				if (count($data) > 0 && isset($data->id)) {
					$data = (object) $data->toArray();
					$data->id = requestHash('encode',$data->id);
					// Error 1: Los datos de usuario son corerectos
					$error = 1;
				}else{
					$data = null;
					// Error 2: Los datos de usuario son incorerectos
					$error = 2;
				}
			}else{
				// Error 3: datos request incorrectos
				$error = 3;
			}
			break;
			
		// setAdminCliente: Retorna todas los clientes de brm con sus usuarios
		case "setAdminCliente":
			if (isset($request->idCuenta) &&
				isset($request->nombre) && $request->nombre != "" &&
				isset($request->imagen) && $request->imagen != "" &&
				isset($request->color) && $request->color != "" &&
				isset($request->idAdmin) && $request->idAdmin != "") {

				$idAdmin = requestHash('decode',$request->idAdmin);
				if ($request->idCuenta != "") {
					$idCuenta = requestHash('decode',$request->idCuenta);
					$nResult = Cuenta::where('id', $idCuenta)
						->update(['nombre' => $request->nombre,'imagen' => $request->imagen,'color' => $request->color,'idAdmin' => $idAdmin]);
				}else{
					$cliente = new Cuenta;
					$cliente->nombre = $request->nombre;
					$cliente->imagen = $request->imagen;
					$cliente->color = $request->color;
					$cliente->idAdmin = $idAdmin;
					$cliente->fecha = date("Y-m-d H:i:s");
					$nResult = $cliente->save();
				}
				if (count($nResult) > 0) {
					
					$data = $nResult;
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

		// getAdminCliente: Retorna todas los clientes de brm con sus usuarios
		case "getAdminCliente":
			if (isset($request->idCuenta) && $request->idCuenta != "") {
				$idCuenta = requestHash('decode',$request->idCuenta);
				$cliente = Cuenta::where("id",$idCuenta)->where("estado","A")->first();
				if (count($cliente) > 0) {
					$cliente = $cliente->toArray();
					$cliente['id'] = requestHash('encode',$cliente['id']);
					$data = $cliente;
					// Error 1: Los datos de usuario son corerectos
					$error = 1;
				}else{
					$data = null;
					// Error 1: Los datos de usuario son incorerectos
					$error = 2;
				}
			}else{
				$data = null;
				// Error 1: Los datos son incorerectos
				$error = 3;
			}
			break;
	
		// getAdminClientes: Retorna todas los clientes de brm con sus usuarios
		case "getAdminClientes":
			$clientes = Cuenta::select('cuenta.id AS idCuenta',
				'cuenta.nombre AS nombreCuenta',
				'cuenta.imagen AS imagenCuenta',
				'cuenta.color AS colorCuenta',
				'usuario.id AS idUsuario',
				'usuario.nombre AS nombreUsuario',
				'usuario.apellido AS apellidoUsuario',
				'usuario.estado AS estadoUsuario',
				'usuario.correo AS correoUsuario'
				)
			->leftJoin('usuario', 'cuenta.id', '=', 'usuario.idCuenta')
			->where("cuenta.estado","A")
			->get();
			if (count($clientes) > 0) {
				$clientes = $clientes->toArray();
				// Ciframos ids 
				foreach ($clientes as $clienteKey => $clienteValue) {
					$clientes[$clienteKey]['idCuenta'] = requestHash('encode',$clientes[$clienteKey]['idCuenta']);
					$clientes[$clienteKey]['idUsuario'] = requestHash('encode',$clientes[$clienteKey]['idUsuario']);
				}

				$newClientes = groupArray($clientes,array('idCuenta','nombreCuenta','imagenCuenta','colorCuenta'),'usuarios');
				$data = $newClientes;
				// Error 1: Los datos de usuario son corerectos
				$error = 1;
			}else{
				$data = null;
				// Error 1: Los datos de usuario son incorerectos
				$error = 2;
			}
			break;

		// removeAdminCliente: Cambia de estado al Cliente como inactivo
		case "removeAdminCliente":
			if (isset($request->id) && $request->id != "") {
				$id = requestHash('decode',$request->id);
				$nResult = Cuenta::where('id', $id)
						->update(['estado' => "I"]);
				if (count($nResult) > 0) {
					$data = $nResult;
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

		// setAdminUsuario: Retorna todas los clientes de brm con sus usuarios
		case "setAdminUsuario":
			if (isset($request->id) &&
				isset($request->nombre) && $request->nombre != "" &&
				isset($request->apellido) && $request->apellido != "" &&
				isset($request->correo) && $request->correo != "" &&
				isset($request->usuario) && $request->usuario != "" &&
				isset($request->contrasena) &&
				isset($request->idAdmin) && $request->idAdmin != "" &&
				isset($request->idCuenta) && $request->idCuenta != "") {

				$idAdmin = requestHash('decode',$request->idAdmin);
				$idCuenta = requestHash('decode',$request->idCuenta);
				if ($request->id != "") {
					$id = requestHash('decode',$request->id);
					$nResult = Usuario::where('id', $id)
						->update(['nombre' => $request->nombre,'apellido' => $request->apellido,'correo' => $request->correo,'usuario' => $request->usuario,'contrasena' => requestHash('encode',$request->contrasena),'idAdmin' => $idAdmin,'idCuenta' => $idCuenta]);
				}else{
					$usuario = new Usuario;
					$usuario->nombre = $request->nombre;
					$usuario->apellido = $request->apellido;
					$usuario->correo = $request->correo;
					$usuario->usuario = $request->usuario;
					$usuario->contrasena = requestHash('encode',$request->contrasena);
					$usuario->idCuenta = $idCuenta;
					$usuario->idAdmin = $idAdmin;
					$usuario->fecha = date("Y-m-d H:i:s");
					$nResult = $usuario->save();
				}
				if (count($nResult) > 0) {
					
					$data = $nResult;
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

		// removeAdminUsuario: Cambia de estado al usuario como inactivo
		case "removeAdminUsuario":
			if (isset($request->id) && $request->id != "") {
				$id = requestHash('decode',$request->id);
				$nResult = Usuario::where('id', $id)
						->update(['estado' => "I"]);
				if (count($nResult) > 0) {
					$data = $nResult;
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

		// getAdminUsuario: Retorna todas los clientes de brm con sus usuarios
		case "getAdminUsuario":
			if (isset($request->idUsuario) && $request->idUsuario != "") {
				$idUsuario = requestHash('decode',$request->idUsuario);
				$usuario = Usuario::select('id','nombre','apellido','correo','usuario')
					->where("id",$idUsuario)->first();
				if (count($usuario) > 0) {
					$usuario = $usuario->toArray();
					$usuario['id'] = requestHash('encode',$usuario['id']);
					$data = $usuario;
					// Error 1: Los datos de usuario son corerectos
					$error = 1;
				}else{
					$data = null;
					// Error 1: Los datos de usuario son incorerectos
					$error = 2;
				}
			}else{
				$data = null;
				// Error 1: Los datos son incorerectos
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