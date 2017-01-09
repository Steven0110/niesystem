<?php
include 'db-variables.php';
$name = $_POST["name"];
$ap = $_POST["ap"];
$rfc = $_POST["rfc"];
$idt = $_POST["idt"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset:utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "INSERT INTO user VALUES(:rfc, :psw, 'TEC')";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":rfc", $rfc, PDO::PARAM_STR);
    $stm->bindParam(":psw", $rfc, PDO::PARAM_STR);
    if( $stm->execute() ){
        $sql = "INSERT INTO persona VALUES(:nom, :ap, :rfc, :idt)";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam(":nom", $name, PDO::PARAM_STR);
        $stm->bindParam(":ap", $ap, PDO::PARAM_STR);
        $stm->bindParam(":rfc", $rfc, PDO::PARAM_STR);
        $stm->bindParam(":idt", $idt, PDO::PARAM_INT);
        if( $stm->execute() ){
            echo "{\"status\":\"1\"}";
        }else{
            echo "{\"status\":\"-3\"}";
        }

    }else{
        echo "{\"error\":\"-2\"}";
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>
