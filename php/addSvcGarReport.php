<?php
include 'db-variables.php';
$idr = $_POST["idr"];
$folio = $_POST["folio"];
$mo = $_POST["mo"];
$tipo = $_POST["tipo"];
$cas = $_POST["cas"];
$desp = $_POST["desp"];
$partes = $_POST["partes"];
$cobro = $_POST["cobro"];

$garantia = null;
if($tipo == "0")
    $garantia = 1;
else
    $garantia = 0;
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "INSERT INTO servicios_tecnico_trabajados (folio, idtecnico, status, mano_obra, casetas, desplazamiento, partes_iva, cobro, observacion, idreporte, tipo, garantia) SELECT :folio, idtecnico, 10, :mo, :cas, :desp, :partes, :cobro, NULL, :idr, :tipo, :gar FROM servicios_tecnico_trabajados WHERE idreporte=:idr2 LIMIT 1";
    //VALUES(:folio, (SELECT idtecnico FROM servicios_tecnico_trabajados WHERE idreporte=:idr2 //LIMIT 1), 10, :mo, :cas, :desp, :partes, :cobro, NULL, :idr, :tipo, :gar";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":folio", $folio, PDO::PARAM_STR );
    $stm->bindParam(":mo", $mo, PDO::PARAM_INT );
    $stm->bindParam(":cas", $cas, PDO::PARAM_INT );
    $stm->bindParam(":partes", $partes, PDO::PARAM_INT );
    $stm->bindParam(":desp", $desp, PDO::PARAM_INT );
    $stm->bindParam(":cobro", $cobro, PDO::PARAM_INT );
    $stm->bindParam(":idr", $idr, PDO::PARAM_INT );
    $stm->bindParam(":idr2", $idr, PDO::PARAM_INT );
    $stm->bindParam(":tipo", $tipo, PDO::PARAM_INT );
    $stm->bindParam(":gar", $garantia, PDO::PARAM_INT );
    if( $stm->execute() ){
        
        //get idt
        $sql = "SELECT idtecnico FROM servicios_tecnico_trabajados WHERE idreporte=:idr LIMIT 1";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam(":idr", $idr, PDO::PARAM_INT );
        $stm->execute();
        $rs = $stm->fetchAll(PDO::FETCH_ASSOC);
        echo "{\"status\":\"1\", \"idt\":\"".$rs[ 0 ]["idtecnico"]."\"}";
    }else{
        echo "{\"status\":\"-2\"}";
        //print_r($stm->errorInfo());
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>