<?php

include "db-variables.php";
$folio = $_POST["folio"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "SELECT * FROM servicios_tecnico_trabajados WHERE folio =:folio";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
    if( $stm->execute() ){
        if( $stm->rowCount() == 0 )
            echo "{\"status\":\"1\"}";
        else
            echo "{\"status\":\"-3\"}";
    }else{
        die("{\"status\":\"-2\"}");
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>