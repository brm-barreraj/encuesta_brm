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
use Models\CuentaXCategoria;

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
					'categoria.descripcion AS categoriaDescripcion',
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
					$newPreguntas = groupArray($preguntas,array('idCategoria','categoria','categoriaDescripcion'),'preguntas');
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

		// LoginAdmin: Realiza la validación del usuario
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
				(isset($_FILES['imagen']) || isset($request->imagen) && $request->imagen != "") &&
				isset($request->color) && $request->color != "" &&
				isset($request->idAdmin) && $request->idAdmin != "") {
				$idAdmin = requestHash('decode',$request->idAdmin);
				$nResult = array();
				if ($request->idCuenta != "") {
					// Actualizar
					if (isset($_FILES['imagen'])) {
						$nameFile = moveFile($_FILES['imagen'],'assets/images/logos/');
					}else{
						$nameFile = $request->imagen;
					}
					$idCuenta = requestHash('decode',$request->idCuenta);
					$nResult = Cuenta::where('id', $idCuenta)
						->update(['nombre' => $request->nombre,'imagen' => $nameFile,'color' => $request->color,'idAdmin' => $idAdmin]);
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
					// Insertar
					$clienteIgual = Cuenta::select('id')
					->where('nombre',$request->nombre)
					->where('estado','A')
					->first();
					if (!isset($clienteIgual) || $clienteIgual == null || $clienteIgual == '') {
						if (isset($_FILES['imagen'])) {
							$nameFile = moveFile($_FILES['imagen'],'assets/images/logos/');
							$nameFile = 'logos/'.$nameFile;
							// Inserta un cliente
							$cliente = new Cuenta;
							$cliente->nombre = strtoupper($request->nombre);
							$cliente->imagen = $nameFile;
							$cliente->color = $request->color;
							$cliente->idAdmin = $idAdmin;
							$cliente->fecha = date("Y-m-d H:i:s");
							$nResult = $cliente->save();
							$idCliente = $cliente->id;
							if (count($nResult) > 0) {
								// Inserta las categorias del cliente
								$categoriasCliente = json_decode($request->categorias);
								foreach ($categoriasCliente as $idCategoriaCliente) {
									$cuentaXCategoria = new CuentaXCategoria;
									$cuentaXCategoria->idCategoria = requestHash('decode',$idCategoriaCliente);
									$cuentaXCategoria->idCuenta = $idCliente;
									$cuentaXCategoria->fecha = date("Y-m-d H:i:s");
									$cuentaXCategoria->save();
								}
								$data['id'] = requestHash('encode',$idCliente);
								$data['imagen'] = $nameFile;
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
					}else{
						$data = null;
						// Error 5: El cliente ya existe
						$error = 5;
					}
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

					// Trae las categorías de la cuenta
					$categoriasCuenta = Categoria::select('categoria.id')
						->join('cuenta_x_categoria', 'cuenta_x_categoria.idCategoria', '=', 'categoria.id')
						->join('cuenta', 'cuenta.id', '=', 'cuenta_x_categoria.idCuenta')
						->where('cuenta.id',$idCuenta)
						->pluck('id');
					if (count($categoriasCuenta) > 0) {
						$categoriasCuenta = $categoriasCuenta->toArray();
					}else{
						$categoriasCuenta = array();
					}
					// Trae las categorías
					$categorias = Categoria::select('categoria.id','categoria.nombre','categoria.porcentaje')->get();
					$categorias = $categorias->toArray();
					// Ciframos ids 
					foreach ($categorias as $categoriaKey => $categoriaValue) {
						if (in_array($categorias[$categoriaKey]['id'], $categoriasCuenta)) {
							$categorias[$categoriaKey]['active'] = true;
						}
						$categorias[$categoriaKey]['id'] = requestHash('encode',$categorias[$categoriaKey]['id']);
					}
					$data['categorias'] = $categorias;


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
				$nombre = ucfirst(strtolower($request->nombre));
				$apellido = ucfirst(strtolower($request->apellido));
				if ($request->id != "") {
					$id = requestHash('decode',$request->id);
					$nResult = Usuario::where('id', $id)
						->update(['nombre' => $nombre,'apellido' => $apellido,'correo' => $request->correo,'usuario' => $request->usuario,'contrasena' => requestHash('encode',$request->contrasena),'idAdmin' => $idAdmin,'idCuenta' => $idCuenta]);
				}else{
					$usuario = new Usuario;
					$usuario->nombre = $nombre;
					$usuario->apellido = $apellido;
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

		// getCategorias: Retorna todas los categorias
		case "getCategorias":
			$categorias = Categoria::select('id','nombre','porcentaje','descripcion')->get();
			if (count($categorias) > 0) {
				$categorias = $categorias->toArray();
				// Ciframos ids 
				foreach ($categorias as $categoriaKey => $categoriaValue) {
					$categorias[$categoriaKey]['id'] = requestHash('encode',$categorias[$categoriaKey]['id']);
				}

				$data = $categorias;
				// Error 1: Los datos de la categoría son correctos
				$error = 1;
			}else{
				$data = null;
				// Error 2: No hay categorías
				$error = 2;
			}
			break;

		// setCategoria: Inserta o actualiza una categoria
		case "setCategoria":
			if (isset($request->id) &&
				isset($request->nombre) && $request->nombre != "" &&
				isset($request->porcentaje) && $request->porcentaje != "" &&
				isset($request->descripcion) && $request->descripcion != "") {
				$nResult = false;
				$idCat = requestHash('decode',$request->id);
				if (isset($request->id) && $request->id != "" && $request->id != 'undefined') {
					$categoriaIgual = Categoria::select('id','nombre','porcentaje')
					->where('nombre',$request->nombre)
					->where('porcentaje',$request->porcentaje)
					->where('id',$idCat)
					->first();
					if (!isset($categoriaIgual) || $categoriaIgual == null || $categoriaIgual == '') {
						// inserta  nueva categoría histórica
						$categoriaHistoria = new CategoriaHistorial;
						$categoriaHistoria->nombre = $request->nombre;
						$categoriaHistoria->porcentaje = $request->porcentaje;
						$categoriaHistoria->fecha = date("Y-m-d H:i:s");
						$categoriaHistoria->save();
						$idCategoriaHistorial = $categoriaHistoria->id;
						// Actializa la categoría
						$nResult = Categoria::where('id', $idCat)
							->update(['nombre' => $request->nombre,'descripcion' => $request->descripcion,'porcentaje' => $request->porcentaje,'idCategoriaHistorial' => $idCategoriaHistorial]);
						if (count($nResult) > 0) {
							$data = $nResult;
							// Error 1: Los datos de usuario son corerectos
							$error = 1;
						}else{
							$data = null;
							// Error 1: Los datos de usuario son incorerectos
							$error = 3;
						}
					}else{
						$categoriaDescIgual = Categoria::select('id','nombre','porcentaje')
							->where('descripcion',$request->descripcion)
							->where('id',$idCat)
							->first();
						if (!isset($categoriaDescIgual) || $categoriaDescIgual == null || $categoriaDescIgual == '') {
							// Actializa la categoría
							$nResult = Categoria::where('id', $idCat)
								->update(['descripcion' => $request->descripcion]);
							
							if (count($nResult) > 0) {
								$data = $nResult;
								// Error 1: Los datos de usuario son corerectos
								$error = 1;
							}else{
								$data = null;
								// Error 1: Los datos de usuario son incorerectos
								$error = 3;
							}
						}else{
							$data = null;
							// Error 4: No se realizaron cambios a la categoría
							$error = 4;
						}
					}
				}else{
					$categoriaIgual = Categoria::select('id','nombre','porcentaje')
					->where('nombre',$request->nombre)
					->first();
					if (!isset($categoriaIgual) || $categoriaIgual == null || $categoriaIgual == '') {
						// inserta  nueva categoría histórica
						$categoriaHistoria = new CategoriaHistorial;
						$categoriaHistoria->nombre = $request->nombre;
						$categoriaHistoria->porcentaje = $request->porcentaje;
						$categoriaHistoria->fecha = date("Y-m-d H:i:s");
						$categoriaHistoria->save();
						$idCategoriaHistorial = $categoriaHistoria->id;
						// inserta  nueva categoría 
						$categoria = new Categoria;
						$categoria->nombre = $request->nombre;
						$categoria->porcentaje = $request->porcentaje;
						$categoria->descripcion = $request->descripcion;
						$categoria->fecha = date("Y-m-d H:i:s");
						$categoria->idCategoriaHistorial = $idCategoriaHistorial;
						$nResult = $categoria->save();
						$idCategoriaNueva = $categoria->id;
						if (count($nResult) > 0) {
							$data = requestHash('encode',$idCategoriaNueva);
							// Error 1: Los datos de la categoría son corerectos
							$error = 1;
						}else{
							$data = null;
							// Error 1: Los datos de la categoría son incorerectos
							$error = 2;
						}
					}else{
						$data = null;
						// Error 5: La cateogoría ya existe
						$error = 5;
					}
				}
			}else{
				// Error 3: datos request incorrectos
				$error = 3;
			}
			break;

		// removeCategoria: remueve una categoría
		case "removeCategoria":
			
			if (isset($request->id) && $request->id != "") {
				$id = requestHash('decode',$request->id);
				$categoriaEnUso = CuentaXCategoria::select('id')
					->where('idCategoria',$id)
					->first();
				if (!isset($categoriaEnUso) || $categoriaEnUso == null || $categoriaEnUso == '') {
					$nResult = Categoria::where('id', $id)->delete();
					if (count($nResult) > 0) {
						$data = $nResult;
						// Error 1: Los datos de la categoría son corerectos
						$error = 1;
					}else{
						$data = null;
						// Error 1: Los datos de la categoría son incorerectos
						$error = 2;
					}
				}else{
					// Error 4: Categoría en uso
					$error = 4;
				}
			}else{
				// Error 3: datos request incorrectos
				$error = 3;
			}

			break;

		// getAdminPreguntas: Retorna todas los preguntas
		case "getAdminPreguntas":
			if (isset($request->idCategoria) && $request->idCategoria != "") {
				$idCategoria = requestHash('decode',$request->idCategoria);
				$preguntas = Pregunta::select('id','titulo','idCategoria')
					->where('idCategoria',$idCategoria)->get();
				if (count($preguntas) > 0) {
					$preguntas = $preguntas->toArray();
					// Ciframos ids
					foreach ($preguntas as $preguntaKey => $preguntaValue) {
						$preguntas[$preguntaKey]['id'] = requestHash('encode',$preguntas[$preguntaKey]['id']);
						$preguntas[$preguntaKey]['idCategoria'] = requestHash('encode',$preguntas[$preguntaKey]['idCategoria']);
					}
					$data = $preguntas;
					// Error 1: Los datos de la categoría son correctos
					$error = 1;
				}else{
					$data = null;
					// Error 2: No hay categorías
					$error = 2;
				}
			}else{

			}
			break;

		// setAdminPregunta: Inserta o actualiza una pregunta
		case "setAdminPregunta":
			if (isset($request->id) &&
				isset($request->titulo) && $request->titulo != "" &&
				isset($request->idCategoria) && $request->idCategoria != "" &&
				isset($request->idAdmin) && $request->idAdmin != "") {
				$nResult = false;
				$idPreg = requestHash('decode',$request->id);
				$idAdmin = requestHash('decode',$request->idAdmin);
				$idCategoria = requestHash('decode',$request->idCategoria);
				if (isset($request->id) && $request->id != "" && $request->id != 'undefined') {
					$preguntaIgual = Pregunta::select('id','titulo')
					->where('titulo',$request->titulo)
					->where('id',$idPreg)
					->first();
					if (!isset($preguntaIgual) || $preguntaIgual == null || $preguntaIgual == '') {
						// inserta  nueva pregunta histórica
						$preguntaHistoria = new PreguntaHistorial;
						$preguntaHistoria->titulo = $request->titulo;
						$preguntaHistoria->fecha = date("Y-m-d H:i:s");
						$preguntaHistoria->save();
						$idPreguntaHistorial = $preguntaHistoria->id;
						// Actializa la pregunta
						$nResult = Pregunta::where('id', $idPreg)
							->update(['titulo' => $request->titulo,'idPreguntaHistorial' => $idPreguntaHistorial]);
						if (count($nResult) > 0) {
							$data = $nResult;
							// Error 1: Se actualizó correctamente la pregunta
							$error = 1;
						}else{
							$data = null;
							// Error 3: Ocurrió un error en la  consulta
							$error = 3;
						}
					}else{
						$data = null;
						// Error 4: No se realizó cambio en la pregunta
						$error = 4;
					}
				}else{
					$preguntaIgual = Pregunta::select('id','titulo')
					->where('titulo',$request->titulo)
					->first();
					if (!isset($preguntaIgual) || $preguntaIgual == null || $preguntaIgual == '') {
						// inserta  nueva pregunta histórica
						$preguntaHistoria = new PreguntaHistorial;
						$preguntaHistoria->titulo = $request->titulo;
						$preguntaHistoria->fecha = date("Y-m-d H:i:s");
						$preguntaHistoria->save();
						$idPreguntaHistorial = $preguntaHistoria->id;
						// inserta  nueva pregunta 
						$pregunta = new Pregunta;
						$pregunta->titulo = $request->titulo;
						$pregunta->fecha = date("Y-m-d H:i:s");
						$pregunta->idPreguntaHistorial = $idPreguntaHistorial;
						$pregunta->idAdmin = $idAdmin;
						$pregunta->idCategoria = $idCategoria;
						$nResult = $pregunta->save();
						$idPreguntaNueva = $pregunta->id;
						if (count($nResult) > 0) {
							$data = requestHash('encode',$idPreguntaNueva);
							// Error 1: Los datos de la pregunta son corerectos
							$error = 1;
						}else{
							$data = null;
							// Error 1: Los datos de la pregunta son incorerectos
							$error = 2;
						}
					}else{
						$data = null;
						// Error 5: La pregunta ya existe
						$error = 5;
					}
				}
			}else{
				// Error 3: datos request incorrectos
				$error = 3;
			}
			break;

		// removePregunta: remueve una categoría
		case "removePregunta":
			if (isset($request->id) && $request->id != "") {
				$id = requestHash('decode',$request->id);
				/*$preguntaEnUso = Pregunta::select('pregunta.id')
					->join('pregunta_historial', 'pregunta_historial.id', '=', 'pregunta.idPreguntaHistorial')
					->join('respuesta', 'pregunta_historial.id', '=', 'respuesta.idPreguntaHistorial')
					->where('idCategoria',$id)
					->first();
				if (!isset($preguntaEnUso) || $preguntaEnUso == null || $preguntaEnUso == '') {*/
					$nResult = Pregunta::where('id', $id)->delete();
					if (count($nResult) > 0) {
						$data = $nResult;
						// Error 1: Se eliminó la pregunta correctamente
						$error = 1;
					}else{
						$data = null;
						// Error 1: Ocurrió un error eliminando la consulta
						$error = 2;
					}
				/*}else{
					// Error 4: Pregunta en uso
					$error = 4;
				}*/
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