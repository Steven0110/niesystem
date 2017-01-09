<?php
include 'db-variables.php';
$id = $_POST["id"];
$mo = $_POST["mo"];
$rev = $_POST["rev"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "UPDATE tarifas SET mano_obra=:mo, revision=:rev WHERE idTarifa=:id";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":mo", $mo, PDO::PARAM_INT);
    $stm->bindParam(":rev", $rev, PDO::PARAM_INT);
    $stm->bindParam(":id", $id, PDO::PARAM_INT);
    if( $stm->execute() ){
        echo "{\"status\":\"1\"}";
    }else{
        echo "{\"status\":\"-2\"}";
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>
