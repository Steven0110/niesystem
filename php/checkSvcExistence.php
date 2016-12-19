<?php

include "db-variables.php";

$folio = $_POST["folio"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");

    $existe = 0;
    $sql = "SELECT Modelo FROM registro_gspn WHERE Reclamacion_del_ASC=:folio";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
    $stm->execute();
    if( $stm->rowCount() == 0 ){
        echo "{";
        echo "\"status\" : \"0\",";
        echo "\"error\" : \"none\"";
        echo "}";
    }else{

        $sql = "SELECT * FROM servicios_tecnico_trabajados WHERE folio=:folio";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
        $stm->execute();

        echo "{";
        echo "\"status\" : \"1\",";
        echo "\"cantidad\" : \"".$stm->rowCount()."\",";
        echo "\"error\" : \"none\"";
        echo "}";
    }
}catch(PDOException $ex){
    echo "{";
    echo "\"status\" : \"-1\",";
    echo "\"error\" : \"".$ex->getMessage()."\"";
    echo "}";
}
?>
