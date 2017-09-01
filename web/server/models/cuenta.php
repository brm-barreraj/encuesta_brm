<?php
namespace Models;

class Cuenta extends \Illuminate\Database\Eloquent\Model {

	/*
	Eloquent relacionará por defecto el modelo con una tabla que tenga su nombre en plural
	en vez de singular, o agregando una S si no trabajamos en inglés, en este caso 'productos',
	si queremos especificar una tabla manualmente, podemos hacerlo de este modo:
	protected $table = 'articulos';
	*/
	protected $table = 'cuenta';
	public $timestamps = false;
}