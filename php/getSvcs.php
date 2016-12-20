<?php

include "db-variables.php";

$idt = $_POST["idt"];

try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");

    $sql = "SELECT folio, mano_obra, casetas, desplazamiento, partes_iva, cobro, observacion FROM servicios_tecnico_trabajados WHERE idTecnico=:idt";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam( ":idt", $idt, PDO::PARAM_INT );
    $stm->execute();
    $rs = $stm->fetchAll();

    $response = "{ \"svc\" : [";
    foreach( $rs as $row ){

    }
    $response .= "]}";

}catch(PDOException $ex){
    echo "{";
    echo "\"status\" : \"-1\",";
    echo "\"error\" : \"".$ex->getMessage()."\"";
    echo "}";
}
?>
