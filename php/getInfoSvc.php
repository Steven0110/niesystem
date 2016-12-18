<?php

include "db-variables.php";

$folio = $_POST["folio"];
//$folio = $_GET["folio"];

try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");


    $sql = "SELECT * FROM registro_gspn WHERE Reclamacion_del_ASC=:folio";
    $stm = $pdo->prepare($sql);
    $stm->bindParam( ":folio", $folio, PDO::PARAM_STR );


}catch(PDOException $ex){
}
?>
