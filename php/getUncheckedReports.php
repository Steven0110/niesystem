<?php

include "db-variables.php";

try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");
    $sql = "SELECT r.idreporte, r.semana, r.tipo, p.nombre from reporte r, persona p WHERE revision=0 AND r.idtecnico=p.idtecnico";
    $stm = $pdo->prepare( $sql );
    $response = "";
    if( $stm->execute() ){
        $response.= "{\"reports\":[";
        $rs = $stm->fetchAll();
        foreach( $rs as $row ){
            $response.= "{";
            $response.= "\"idr\":\"".$row[ 0 ]."\",";
            $response.= "\"semana\":\"".$row[ 1 ]."\",";
            $response.= "\"tipo\":\"".$row[ 2 ]."\",";
            $response.= "\"nombre\":\"".$row[ 3 ]."\"";
            $response.= "},";
        }
        $response = trim($response, ",");
        $response.= "],\"status\":\"1\"}";
        echo $response;
    }else{
        echo "{";
        echo "\"status\":\"-2\"";
        echo "}";
    }

}catch(PDOException $ex){
    echo "{";
    echo "\"status\" : \"-1\",";
    echo "\"error\" : \"".$ex->getMessage()."\"";
    echo "}";
}
?>
