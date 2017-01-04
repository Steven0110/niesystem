<?php
include 'db-variables.php';
$folio = $_POST["folio"];
$razon = $_POST["razon"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "UPDATE servicios_tecnico_trabajados SET status=5, observacion=:obs WHERE folio=:folio";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":folio", $folio, PDO::PARAM_STR );
    $stm->bindParam(":obs", $razon, PDO::PARAM_STR );
    if( $stm->execute() ){
        echo "{\"status\":\"1\"}";
    }else{
        echo "{\"status\":\"-2\"}";
    }

}catch( PDOException $ex){
    echo "{\"status\" : \"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>
