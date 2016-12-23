<?php

include "db-variables.php";

$folios = $_POST["folios"];
$mos = $_POST["mos"];
$casetas = $_POST["casetas"];
$desps = $_POST["desps"];
$ivas = $_POST["ivas"];
$cobros = $_POST["cobros"];
$idr = $_POST["idr"];
$idt = $_POST["idt"];
$fecha = $_POST["fecha"];
$tipo = $_POST["tipo"];
$semana = $_POST["semana"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");
    //Crea el reporte
    $sql = "INSERT INTO reporte VALUES(:idr, str_to_date(:fecha, '%m/%d/%Y'), :tipo, :idt, :semana, NULL)";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":idr", $idr, PDO::PARAM_INT);
    $stm->bindParam(":fecha", $fecha, PDO::PARAM_STR);
    $stm->bindParam(":idt", $idt, PDO::PARAM_INT);
    $stm->bindParam(":semana", $semana, PDO::PARAM_INT);
    $stm->bindParam(":tipo", $tipo, PDO::PARAM_STR);
    if( $stm->execute() ){
        //Actualiza valores
        for( $i = 0 ; $i < count( $folios ) ; $i++ ){
            $sql = "UPDATE servicios_tecnico_trabajados SET status=10, mano_obra=:mo, casetas=:cas, desplazamiento=:desp, partes_iva=:iva, cobro=:cobro, observacion=NULL, idreporte=:idr WHERE folio=:folio";
            $stm = $pdo->prepare( $sql );
            $stm->bindParam(":folio", $folios[ $i ], PDO::PARAM_INT);
            $stm->bindParam(":mo", $mos[ $i ], PDO::PARAM_INT);
            $stm->bindParam(":cas", $casetas[ $i ], PDO::PARAM_INT);
            $stm->bindParam(":desp", $desps[ $i ], PDO::PARAM_INT);
            $stm->bindParam(":iva", $ivas[ $i ], PDO::PARAM_INT);
            $stm->bindParam(":cobro", $cobros[ $i ], PDO::PARAM_INT);
            $stm->bindParam(":idr", $idr, PDO::PARAM_INT);
            $stm->execute();
        }
        echo "{";
        echo "\"status\":\"1\"";
        echo "}";
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
