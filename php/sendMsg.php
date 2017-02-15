<?php
include 'db-variables.php';
$msg = $_POST["msg"];
$idt = $_POST["idt"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "INSERT INTO mensajes(idTecnico, msg) VALUES(:idt, :msg)";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":idt", $idt, PDO::PARAM_INT );
    $stm->bindParam(":msg", $msg, PDO::PARAM_STR );
    if( $stm->execute() ){
        echo "{\"status\":\"1\"}";
    }else
        die("{\"status\":\"-2\"}");

}catch(PDOException $ex){
    die("{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}");
}
?>