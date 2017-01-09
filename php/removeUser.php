<?php
include 'db-variables.php';
$idt = $_POST["idt"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "DELETE FROM persona WHERE rfc=:idt";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam( ":idt", $idt, PDO::PARAM_STR);
    if( $stm->execute() ){
        $sql = "DELETE FROM user WHERE rfc=:idt";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam( ":idt", $idt, PDO::PARAM_STR);
        if( $stm->execute() ){
            echo "{\"status\":\"1\"}";
        }else{
            echo "{\"status\":\"-3\"}";
        }
    }else{
        echo "{\"status\":\"-2\"}";
    }
}catch( PDOException $ex ){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>
