<?php
include 'db-variables.php';
$idr = $_POST["idr"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "UPDATE reporte SET revision=1 WHERE idreporte=:idr";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":idr", $idr, PDO::PARAM_INT );
    if( $stm->execute() ){
        echo "{\"status\":\"1\"}";
    }else{
        echo "{\"status\":\"-2\"}";
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>
