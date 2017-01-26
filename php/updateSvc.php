<?php
include 'db-variables.php';
$folio = $_POST["folio"];
$mo = $_POST["mo"];
$cas = $_POST["cas"];
$desp = $_POST["desp"];
$partes = $_POST["partes"];
$cobro = $_POST["cobro"];
$obs = $_POST["obs"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "UPDATE servicios_tecnico_trabajados SET mano_obra=:mo, casetas=:cas, observacion=:obs,  desplazamiento=:desp, partes_iva=:partes, cobro=:cobro WHERE folio=:folio";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":mo", $mo, PDO::PARAM_INT );
    $stm->bindParam(":cas", $cas, PDO::PARAM_INT );
    $stm->bindParam(":desp", $desp, PDO::PARAM_INT );
    $stm->bindParam(":partes", $partes, PDO::PARAM_INT );
    $stm->bindParam(":cobro", $cobro, PDO::PARAM_INT );
    $stm->bindParam(":folio", $folio, PDO::PARAM_STR );
    $stm->bindParam(":obs", $obs, PDO::PARAM_STR );
    if( $stm->execute() ){
        echo "{\"status\":\"1\"}";
    }else{
        echo "{\"status\":\"-2\"}";
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>