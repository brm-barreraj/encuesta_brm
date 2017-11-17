<?php  
require 'vendor/autoload.php';

@ini_set("display_errors","5");
@error_reporting(E_ALL);

//Importamos el archivo autoload.php presente en nuestro directorio vendor require 'vendor/autoload.php';
//Después importamos la clase Capsule escribiendo su ruta completa incluyendo el namespace
use Illuminate\Database\Capsule\Manager as Capsule;

// Se ingresa la zona horaria
date_default_timezone_set('America/Bogota');

//Creamos un nuevo objeto de tipo Capsule
$capsule = new Capsule;
//Indicamos en el siguiente array los datos de configuración de la BD
$capsule->addConnection([
    'driver' =>'mysql',
    'host' => '127.0.0.1',
    'database' => 'brm2_3ncu3db',
    /* Local **
    'username' => 'root',
    'password' => '1nt3r4ct1v3',
    /**/
    /* Produccion **/
    'username' => 'brm2_enct4suser',
    'password' => 'a50PbjVnAj52',
    /**/
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

function moveFile($file,$ruta){
    if ($file['size'] > 5000000) {
        $res = false;
    }else{
        $nameFile=explode('.',$file['name']);
        $types = array('image/png','image/jpeg');
        $temporal=$file['tmp_name'];
        if (in_array(mime_content_type($temporal), $types)) {
            $mTmpFile = $file["tmp_name"];
            $imgFinal=cleanNameFile($nameFile[0]).'-'.date('Y_m_d_H_i_s').'.'.$nameFile[1];
            $urlDef=$ruta.$imgFinal;
            $guarda=move_uploaded_file($temporal, $urlDef);//$guarda true si guardo la factura en la carpeta recien creada
            if ($guarda) { //si guarda la imagen en la carpeta
                $res = $imgFinal;
            }else{// si no gurado la imagen en la carpeta
                $res = false;
            }
        }else{
            $res = false;
        }
    }
    return $res;
}

function normaliza ($cadena){
    $originales = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ
ßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŔŕ';
    $modificadas = 'aaaaaaaceeeeiiiidnoooooouuuuy
bsaaaaaaaceeeeiiiidnoooooouuuyybyRr';
    $cadena = utf8_decode($cadena);
    $cadena = strtr($cadena, utf8_decode($originales), $modificadas);
    $cadena = strtolower($cadena);
    return utf8_encode($cadena);
}

function cleanNameFile($name){
    return normaliza(str_replace(" ", "_", strtolower(trim($name))));
}

?>