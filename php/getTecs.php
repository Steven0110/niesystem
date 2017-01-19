<?php
include 'db-variables.php';
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "SELECT p.idTecnico, p.nombre, p.ap FROM persona p, user u WHERE u.rfc=p.rfc AND u.tipo='TEC'";
    $stm = $pdo->prepare( $sql );
    if( $stm->execute() ){
        if( $stm->rowCount() == 0 )
            die("{\"status\":\"-3\"}");
        else{
            $response = "{\"tec\":[";
            $rs = $stm->fetchAll(PDO::FETCH_ASSOC);
            foreach( $rs as $tec ){
                $response .= "{";
                $response .= "\"idt\":\"".$tec["idTecnico"]."\",";
                $response .= "\"nom\":\"".$tec["nombre"]."\",";
                $response .= "\"ap\":\"".$tec["ap"]."\"";
                $response .= "},";
            }
            $response = trim( $response, ",");
            $response .= "],\"status\":\"1\"}";
            echo $response;
        }
    }else{
        die("{\"status\":\"-2\"}");
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>