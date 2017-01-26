<?php
include 'db-variables.php';
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8" );
    $sql = "SELECT semana FROM reporte GROUP BY semana ORDER BY 1";
    $stm = $pdo->prepare( $sql );
    if( $stm->execute() ){
        $response = "{\"week\":[";
        $rs = $stm->fetchAll(PDO::FETCH_ASSOC);
        foreach( $rs as $week ){
            $response .= "{";
            $response .= "\"no\":\"".$week["semana"]."\"";
            $response .= "},";
        }
        $response = trim($response, ",");
        $response .= "],\"status\":\"1\"}";
        echo $response;
    }else{
        die("{\"status\":\"-2\"}");
    }
}catch(PDOException $ex){
    die("{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}");
}
?>