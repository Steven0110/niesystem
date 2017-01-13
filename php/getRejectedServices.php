<?php

include 'db-variables.php';
$idt = $_POST["idt"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "SELECT s.folio, s.observacion FROM servicios_tecnico_trabajados s WHERE s.status = 5 AND s.idtecnico=:idt";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":idt", $idt, PDO::PARAM_STR);
    if( $stm->execute() ){
        $response = "{\"svc\": [";
        $rs = $stm->fetchAll();
        foreach( $rs as $svc ){
            $response .= "{";
            $response .= "\"folio\":\"".$svc[ 0 ]."\",";
            $response .= "\"obs\":\"".$svc[ 1 ]."\"";
            $response .= "},";
        }
        $response = trim( $response, "," );
        $response .= "],\"status\":\"1\"}";
        echo $response;
    }else{
        echo "{\"status\":\"-2\"}";
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",";
    echo "\"error\":\"".$ex->getMessage()."\"}";
}

?>
