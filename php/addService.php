<?php

include "db-variables.php";

$folio = $_POST["folio"];
$idtec = $_POST["idtec"];
$status = $_POST["status"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");


    $sql = "INSERT INTO servicios_tecnico_trabajados VALUES(:folio, :idTecnico, :status)";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
    $stm->bindParam(":idTecnico", $idtec, PDO::PARAM_INT);
    $stm->bindParam(":status", $status, PDO::PARAM_INT);
    $stm->execute();

    echo "{";
    echo "\"status\" : \"1\",";
    echo "\"error\" : \"none\"";
    echo "}";
}catch(PDOException $ex){
    echo "{";
    echo "\"status\" : \"-1\",";
    echo "\"error\" : \"".$ex->getMessage()."\"";
    echo "}";
}
?>
