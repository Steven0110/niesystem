<?php

include "db-variables.php";

$user = $_POST["user"];
$psw = $_POST["psw"];

//$user = $_GET["user"];
//$psw = $_GET["psw"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");


    $sql = "SELECT u.*, p.nombre, p.idTecnico FROM user u, persona p WHERE u.rfc=:username AND u.password=:password AND u.rfc=p.rfc";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":username", $user, PDO::PARAM_STR);
    $stm->bindParam(":password", $psw, PDO::PARAM_STR);
    $stm->execute();
    if( $stm->rowCount() == 0 ){
        echo "{\"rfc\" : \"none\",";
        echo "\"tipo\" : \"none\",";
        echo "\"nombre\" : \"none\",";
        echo "\"idt\" : \"none\",";
        echo "\"error\" : \"none\",";
        echo "\"status\" : \"0\"}";
    }
    else{
        $rs = $stm->fetchAll();
        echo "{\"rfc\" : \"".$rs[ 0 ][ 0 ]."\",";
        echo "\"tipo\" : \"".$rs[ 0 ][ 2 ]."\",";
        echo "\"nombre\" : \"".$rs[ 0 ][ 3 ]."\",";
        echo "\"idt\" : \"".$rs[ 0 ][ 4 ]."\",";
        echo "\"error\" : \"none\",";
        echo "\"status\" : \"1\"}";
    }

}catch(PDOException $ex){
        echo "{\"rfc\" : \"none\",";
        echo "\"error\" : \"".$ex->getMessage()."\",";
        echo "\"nombre\" : \"none\",";
        echo "\"tipo\" : \"none\",";
        echo "\"status\" : \"-1\"}";
}
?>
