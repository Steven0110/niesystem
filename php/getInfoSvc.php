<?php

include "db-variables.php";

$folio = $_POST["folio"];
//$folio = $_GET["folio"];

try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");


    $sql = "SELECT Modelo, Nro_de_Serie, Valor_de_la_Mano_de_Obra, FLETES FROM registro_gspn WHERE Reclamacion_del_ASC=:folio";
    $stm = $pdo->prepare($sql);
    $stm->bindParam( ":folio", $folio, PDO::PARAM_STR );
    $stm->execute();
    $rs = $stm->fetchAll();
    echo "{";
    echo "\"modelo\" : \"".$rs[ 0 ][ 0 ]."\",";
    echo "\"serie\" : \"".$rs[ 0 ][ 1 ]."\",";
    echo "\"mo\" : \"".$rs[ 0 ][ 2 ]."\",";
    echo "\"cas\" : \"".$rs[ 0 ][ 3 ]."\",";
    echo "\"status\" : \"1\"";
    echo "}";

}catch(PDOException $ex){
    echo "{";
    echo "\"status\" : \"-1\",";
    echo "\"error\" : \"".$ex->getMessage()."\"";
    echo "}";
}
?>
