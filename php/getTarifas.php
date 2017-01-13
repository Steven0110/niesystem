<?php

include "db-variables.php";
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");


    $sql = "SELECT * from tarifas ORDER BY 4, 1";
    $stm = $pdo->prepare( $sql );
    $stm->execute();
    $rs = $stm->fetchAll();

    $response = "{ \"item\":[";
    foreach( $rs as $row ){
        $response .= "{";
        $response .= "\"desc\" : \"".$row[ 0 ]."\",";
        $response .= "\"mo\" : \"".$row[ 1 ]."\",";

        $response .= "\"rev\" : \"".$row[ 2 ]."\",";
        $response .= "\"cat\" : \"".$row[ 3 ]."\",";
        $response .= "\"id\" : \"".$row[ 4 ]."\"";
        $response .= "},";
    }
    $response = trim( $response, "," );
    $response .= "],\"status\" : \"1\" ";
    $response .= "}";
    echo $response;

}catch(PDOException $ex){
        echo "{\"status\" : \"-1\",";
        echo "\"error\" : \"".$ex->getMessage()."\"}";
}
?>
