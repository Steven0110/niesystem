<?php
include 'db-variables.php';
$folio = $_POST["folio"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "SELECT partes_iva FROM material_cargo WHERE folio=:folio";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
    if( $stm->execute() ){
        if( $stm->rowCount() == 0 )
            echo "{\"status\":\"-3\"}";
        else{
            $rs = $stm->fetchAll(PDO::FETCH_ASSOC);
            echo "{\"status\":\"1\",\"partes\":\"".$rs[ 0 ]["partes_iva"]."\"}";
        }
    }else{
        echo "{\"status\":\"-2\"}";
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>