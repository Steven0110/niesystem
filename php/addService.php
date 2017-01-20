<?php

include "db-variables.php";

$folio = $_POST["folio"];
$idtec = $_POST["idtec"];
$status = $_POST["status"];
$mano_obra = $_POST["mo"];
$casetas = $_POST["casetas"];
$desp = $_POST["desp"];
$iva = $_POST["iva"];
$cobro = $_POST["cobro"];
$tipo = $_POST["tipo"];
$gar = $_POST["gar"];
$type = $_POST["type"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");
    if( $type == 0 ){
        $sql = "INSERT INTO servicios_tecnico_trabajados VALUES(:folio, :idTecnico, :status, :mo, :cas, :desp, :iva, :cobro, NULL, NULL, :tipo, :gar)";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
        $stm->bindParam(":idTecnico", $idtec, PDO::PARAM_INT);
        $stm->bindParam(":status", $status, PDO::PARAM_INT);
        $stm->bindParam(":mo", $mano_obra, PDO::PARAM_INT);
        $stm->bindParam(":cas", $casetas, PDO::PARAM_INT);
        $stm->bindParam(":desp", $desp, PDO::PARAM_INT);
        $stm->bindParam(":iva", $iva, PDO::PARAM_INT);
        $stm->bindParam(":cobro", $cobro, PDO::PARAM_INT);
        $stm->bindParam(":tipo", $tipo, PDO::PARAM_STR);
        $stm->bindParam(":gar", $gar, PDO::PARAM_INT);
        if( $stm->execute() ){
            echo "{";
            echo "\"status\" : \"1\",";
            echo "\"error\" : \"none\"";
            echo "}";
        }else{
            echo "{";
            echo "\"status\" : \"-1\",";
            echo "\"error\" : \"$sql\"";
            echo "}";
        }
    }else{
        $mod = $_POST["mod"];
        $serie = $_POST["serie"];
        
        $sql = "INSERT INTO servicios_tecnico_trabajados VALUES(:folio, :idTecnico, :status, :mo, :cas, :desp, :iva, :cobro, NULL, NULL, :tipo, :gar)";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
        $stm->bindParam(":idTecnico", $idtec, PDO::PARAM_INT);
        $stm->bindParam(":status", $status, PDO::PARAM_INT);
        $stm->bindParam(":mo", $mano_obra, PDO::PARAM_INT);
        $stm->bindParam(":cas", $casetas, PDO::PARAM_INT);
        $stm->bindParam(":desp", $desp, PDO::PARAM_INT);
        $stm->bindParam(":iva", $iva, PDO::PARAM_INT);
        $stm->bindParam(":cobro", $cobro, PDO::PARAM_INT);
        $stm->bindParam(":tipo", $tipo, PDO::PARAM_STR);
        $stm->bindParam(":gar", $gar, PDO::PARAM_INT);
        if( $stm->execute() ){
            
            $sql = "INSERT INTO servicios_cargo VALUES(:folio, :mod, :serie)";
            $stm = $pdo->prepare( $sql );
            $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
            $stm->bindParam(":mod", $mod, PDO::PARAM_STR);
            $stm->bindParam(":serie", $serie, PDO::PARAM_STR);
            if( $stm->execute() ){
                echo "{";
                echo "\"status\" : \"1\",";
                echo "\"error\" : \"none\"";
                echo "}";
            }else{
                echo "{";
                echo "\"status\" : \"-1\",";
                echo "\"error\" : \"$sql\"";
                echo "}";
            }
        }else{
            echo "{";
            echo "\"status\" : \"-1\",";
            echo "\"error\" : \"$sql\"";
            echo "}";
        }
    }

}catch(PDOException $ex){
    echo "{";
    echo "\"status\" : \"-1\",";
    echo "\"error\" : \"".$ex->getMessage()."\"";
    echo "}";
}
?>
