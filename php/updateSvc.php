<?php
include 'db-variables.php';
$folio = $_POST["folio"];
$mo = intval($_POST["mo"]);
$cas = intval($_POST["cas"]);
$desp = intval($_POST["desp"]);
$partes = intval($_POST["partes"]);
$cobro = intval($_POST["cobro"]);
$obs = $_POST["obs"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    //Get $$$
    $sql  = "SELECT mano_obra, casetas, desplazamiento, partes_iva, cobro FROM servicios_tecnico_trabajados WHERE folio=:folio";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":folio", $folio, PDO::PARAM_STR );
    if( $stm->execute() ){
        $rs = $stm->fetchAll(PDO::FETCH_ASSOC);
        $mo_org = intval($rs[ 0 ]["mano_obra"]);
        $cas_org = intval($rs[ 0 ]["casetas"]);
        $desp_org = intval($rs[ 0 ]["desplazamiento"]);
        $partes_org = intval($rs[ 0 ]["partes_iva"]);
        $cobro_org = intval($rs[ 0 ]["cobro"]);
        
        $diff_cas = - $cas_org + $cas;
        $diff_desp = - $cas_org + $cas;
        $diff_partes = - $partes_org + $partes;
        $diff_cobro = $cobro_org - $cobro;
        
        $diff_mo = $diff_cas + $diff_desp + $diff_partes + $diff_cobro;
        $new_mo = $mo - $diff_mo;
        
        $sql = "UPDATE servicios_tecnico_trabajados SET mano_obra=:mo, casetas=:cas, observacion=:obs,  desplazamiento=:desp, partes_iva=:partes, cobro=:cobro WHERE folio=:folio";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam(":mo", $new_mo, PDO::PARAM_INT );
        $stm->bindParam(":cas", $cas, PDO::PARAM_INT );
        $stm->bindParam(":desp", $desp, PDO::PARAM_INT );
        $stm->bindParam(":partes", $partes, PDO::PARAM_INT );
        $stm->bindParam(":cobro", $cobro, PDO::PARAM_INT );
        $stm->bindParam(":folio", $folio, PDO::PARAM_STR );
        $stm->bindParam(":obs", $obs, PDO::PARAM_STR );
        if( $stm->execute() ){
            echo "{\"status\":\"1\",\"new_mo\":\"".$new_mo."\"}";
        }else{
            echo "{\"status\":\"-2\"}";
        }
    }else
         echo "{\"status\":\"-2\"}";
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>