<?php  
require 'vendor/autoload.php';

@ini_set("display_errors","5");
@error_reporting(E_ALL);

//Importamos el archivo autoload.php presente en nuestro directorio vendor require 'vendor/autoload.php';
//Después importamos la clase Capsule escribiendo su ruta completa incluyendo el namespace
use Illuminate\Database\Capsule\Manager as Capsule;
//Creamos un nuevo objeto de tipo Capsule
$capsule = new Capsule;
//Indicamos en el siguiente array los datos de configuración de la BD
$capsule->addConnection([
 'driver' =>'mysql',
 'host' => '127.0.0.1',
 'database' => 'encuestas_brm',
 'username' => 'root',
 'password' => '1nt3r4ct1v3',
 'charset' => 'utf8',
 'collation' => 'utf8_unicode_ci',
 'prefix' => 'enc_',
]);
 
//Y finalmente, iniciamos Eloquent
$capsule->bootEloquent();




function requestHash($action, $string) {
    $output = false;
    $encrypt_method = "AES-256-CBC";
    $secret_key = 'r3q!uEstH4s!-!';
    $secret_iv = 'Brm';

    // hash
    $key = hash('sha256', $secret_key);
    
    // iv - encrypt method AES-256-CBC expects 16 bytes - else you will get a warning
    $iv = substr(hash('sha256', $secret_iv), 0, 16);

    if( $action == 'encode' ) {
        $output = openssl_encrypt($string, $encrypt_method, $key, 0, $iv);
        $output = base64_encode($output);
    }
    else if( $action == 'decode' ){
        $output = openssl_decrypt(base64_decode($string), $encrypt_method, $key, 0, $iv);
    }

    return $output;
}

function printVar( $variable, $title = "" ){
	$var = print_r( $variable, true );
	echo "<pre style='background-color:#dddd00; border: dashed thin #000000;'><strong>[$title]</strong> $var</pre>";
}

?>