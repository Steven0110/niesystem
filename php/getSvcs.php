<?php

include "db-variables.php";

$idt = $_POST["idt"];

try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET names utf8");
    if( !isset($_POST["idr"])){
        //Primero los de cargo
        $sql = "SELECT s.folio, s.mano_obra, s.casetas, s.desplazamiento, s.partes_iva, s.cobro, s.observacion, r.modelo, r.serie, 0, s.garantia FROM servicios_tecnico_trabajados s, servicios_cargo r WHERE s.idTecnico=:idt AND s.tipo=1 AND r.folio=s.folio AND (s.status <> 20 AND s.status <> 10 ) ORDER BY garantia DESC";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam( ":idt", $idt, PDO::PARAM_INT );
        $stm->execute();
        $rs = $stm->fetchAll();

        $response = "{ \"svcCargo\" : [";
        foreach( $rs as $row ){
            $response .= "{";
            $response .= "\"folio\": \"".$row["folio"]."\",";
            #$response .= "\"folio\": \"".$row[ 0 ]."\",";
            $response .= "\"mo\": \"".$row[ 1 ]."\",";
            $response .= "\"cas\": \"".$row[ 2 ]."\",";
            $response .= "\"desp\": \"".$row[ 3 ]."\",";
            $response .= "\"iva\": \"".$row[ 4 ]."\",";
            $response .= "\"cobro\": \"".$row[ 5 ]."\",";
            $response .= "\"obs\": \"".$row[ 6 ]."\",";
            $response .= "\"mod\": \"".$row[ 7 ]."\",";
            $response .= "\"serie\": \"".$row[ 8 ]."\",";
            $response .= "\"sem\": \"".$row[ 9 ]."\",";
            $response .= "\"gar\": \"".$row[ 10 ]."\"";
            $response .= "},";
        }
        $response = trim( $response, "," );
        //COntinuamos creando los de Garantía
        $sql = "SELECT s.folio, s.mano_obra, s.casetas, s.desplazamiento, s.partes_iva, s.cobro, s.observacion, r.Modelo, r.Nro_de_Serie, r.Valor_de_la_Mano_de_Obra, s.garantia FROM servicios_tecnico_trabajados s, registro_gspn r WHERE s.idTecnico=:idt AND s.tipo=0 AND r.Reclamacion_del_ASC=s.folio AND (s.status <> 20 AND s.status <> 10 ) ORDER BY garantia DESC";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam( ":idt", $idt, PDO::PARAM_INT );
        $stm->execute();
        $rs = $stm->fetchAll();

        $response .= "], \"svcIH\" : [";

        foreach( $rs as $row ){
            $response .= "{";
            $response .= "\"folio\": \"".$row[ 0 ]."\",";
            $response .= "\"mo\": \"".$row[ 1 ]."\",";
            $response .= "\"cas\": \"".$row[ 2 ]."\",";
            $response .= "\"desp\": \"".$row[ 3 ]."\",";
            $response .= "\"iva\": \"".$row[ 4 ]."\",";
            $response .= "\"cobro\": \"".$row[ 5 ]."\",";
            $response .= "\"obs\": \"".$row[ 6 ]."\",";
            $response .= "\"mod\": \"".$row[ 7 ]."\",";
            $response .= "\"serie\": \"".$row[ 8 ]."\",";
            $response .= "\"sem\": \"".$row[ 9 ]."\",";
            $response .= "\"gar\": \"".$row[ 10 ]."\"";
            $response .= "},";
        }
        $response = trim( $response, "," );
        $response .= "],\"status\":\"1\" }";
        echo $response;
    }else{
        $idr = $_POST["idr"];
        //Primero los de cargo
        $sql = "SELECT s.folio, s.mano_obra, s.casetas, s.desplazamiento, s.partes_iva, s.cobro, s.observacion, r.modelo, r.serie, 0, s.garantia FROM servicios_tecnico_trabajados s, servicios_cargo r WHERE s.idTecnico=:idt AND s.tipo=1 AND r.folio=s.folio AND s.idreporte=:idr AND s.status<>5 ORDER BY garantia DESC";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam( ":idt", $idt, PDO::PARAM_INT );
        $stm->bindParam( ":idr", $idr, PDO::PARAM_INT );
        $stm->execute();
        $rs = $stm->fetchAll();

        $response = "{ \"svcCargo\" : [";
        foreach( $rs as $row ){
            $response .= "{";
            $response .= "\"folio\": \"".$row[ "folio" ]."\",";
            $response .= "\"mo\": \"".$row[ 1 ]."\",";
            $response .= "\"cas\": \"".$row[ 2 ]."\",";
            $response .= "\"desp\": \"".$row[ 3 ]."\",";
            $response .= "\"iva\": \"".$row[ 4 ]."\",";
            $response .= "\"cobro\": \"".$row[ 5 ]."\",";
            $response .= "\"obs\": \"".$row[ 6 ]."\",";
            $response .= "\"mod\": \"".$row[ 7 ]."\",";
            $response .= "\"serie\": \"".$row[ 8 ]."\",";
            $response .= "\"sem\": \"".$row[ 9 ]."\",";
            $response .= "\"gar\": \"".$row[ 10 ]."\"";
            $response .= "},";
        }
        $response = trim( $response, "," );
        //COntinuamos creando los de IN HOME
        $sql = "SELECT s.folio, s.mano_obra, s.casetas, s.desplazamiento, s.partes_iva, s.cobro, s.observacion, r.Modelo, r.Nro_de_Serie, r.Valor_de_la_Mano_de_Obra, s.garantia FROM servicios_tecnico_trabajados s, registro_gspn r WHERE s.idTecnico=:idt AND s.tipo=0 AND s.idreporte=:idr AND r.Reclamacion_del_ASC=s.folio AND s.status <> 5 ORDER BY garantia DESC";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam( ":idt", $idt, PDO::PARAM_INT );
        $stm->bindParam( ":idr", $idr, PDO::PARAM_INT );
        $stm->execute();
        $rs = $stm->fetchAll();

        $response .= "], \"svcIH\" : [";

        foreach( $rs as $row ){
            $response .= "{";
            $response .= "\"folio\": \"".$row[ "folio" ]."\",";
            $response .= "\"mo\": \"".$row[ 1 ]."\",";
            $response .= "\"cas\": \"".$row[ 2 ]."\",";
            $response .= "\"desp\": \"".$row[ 3 ]."\",";
            $response .= "\"iva\": \"".$row[ 4 ]."\",";
            $response .= "\"cobro\": \"".$row[ 5 ]."\",";
            $response .= "\"obs\": \"".$row[ 6 ]."\",";
            $response .= "\"mod\": \"".$row[ 7 ]."\",";
            $response .= "\"serie\": \"".$row[ 8 ]."\",";
            $response .= "\"sem\": \"".$row[ 9 ]."\",";
            $response .= "\"gar\": \"".$row[ 10 ]."\"";
            $response .= "},";
        }
        $response = trim( $response, "," );
        $response .= "],\"status\":\"1\"}";
        echo $response;
    }

}catch(PDOException $ex){
    echo "{";
    echo "\"status\":\"-1\",";
    echo "\"error\":\"".$ex->getMessage()."\"";
    echo "}";
}
?>
