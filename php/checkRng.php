<?php
$series = $_POST["series"];
$folios = $_POST["folios"];
$rng = array();
include 'db-variables.php';
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    for( $i = 0 ; $i < count( $series ) ; $i++ ){
        $sql = "SELECT * FROM (SELECT Nro_de_Serie FROM registro_gspn UNION ALL SELECT serie FROM servicios_cargo) AS u WHERE u.Nro_de_Serie=:serie";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam(":serie", $series[ $i ]["serie"], PDO::PARAM_STR);
        if( $stm->execute() ){
            if($stm->rowCount() > 1 )
                array_push( $rng, $folios[ $i ]["folio"]);
        }else{
            die("{\"status\":\"-2\"}");
        }
    }
    if( count( $rng ) == 0 )
        echo "{\"status\":\"1\"}";
    else{
        $response = new stdClass();
        $response->status = "2";
        $response->rng = $rng;
        echo json_encode( $response );
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>