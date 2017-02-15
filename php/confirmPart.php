<?php
include 'db-variables.php';
$folio = $_POST["folio"];
$parte = $_POST["parte"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "SELECT * FROM partes WHERE folio=:folio AND parte=:parte";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
    $stm->bindParam(":parte", $parte, PDO::PARAM_STR);
    if( $stm->execute() ){
        if( $stm->rowCount() == 0 )
            die("{\"status\":\"-3\"}");
        else{
            //Obtiene el costo de la parte
            $rs = $stm->fetchAll(PDO::FETCH_ASSOC);
            $costo = floatval($rs[ 0 ]["costo"]);
            //Obtiene el valor total de las partes
            $sql = "SELECT * FROM material_cargo WHERE folio=:folio";
            $stm = $pdo->prepare( $sql );
            $stm->bindParam(":folio", $folio, PDO::PARAM_STR );
            if( $stm->execute() ){
                if( $stm->rowCount() == 0 )
                    die("{\"status\":\"-4\"}");
                else{
                    $rs = $stm->fetchAll(PDO::FETCH_ASSOC);
                    $costo_total = floatval($rs[ 0 ]["partes_iva"]);
                    $costo_final = $costo_total - $costo;
                    //Actualiza el costo
                    $sql = "UPDATE material_cargo SET partes_iva=:new WHERE folio=:folio";
                    $stm = $pdo->prepare( $sql );
                    $stm->bindParam(":new", $costo_final, PDO::PARAM_STR );
                    $stm->bindParam(":folio", $folio, PDO::PARAM_STR );
                    if( $stm->execute() ){
                        //Mueve la parte de tabla
                        $sql = "INSERT INTO partes_confirmadas(folio, parte, costo) VALUES (:folio, :costo, :parte)";
                        $stm = $pdo->prepare( $sql );
                        $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
                        $stm->bindParam(":parte", $parte, PDO::PARAM_STR);
                        $stm->bindParam(":costo", $costo, PDO::PARAM_STR);
                        if( $stm->execute() ){
                            $sql = "DELETE FROM partes WHERE parte=:parte AND folio=:folio";
                            $stm = $pdo->prepare( $sql );
                            $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
                            $stm->bindParam(":parte", $parte, PDO::PARAM_STR);
                            if($stm->execute())
                                die("{\"status\":\"1\"}");
                            else
                                die("{\"status\":\"-2\"}");
                        }
                        else
                            die("{\"status\":\"-2\"}");
                    }else
                        die("{\"status\":\"-2\"}");
                }
            }else
                die("{\"status\":\"-4\"}");    
        }
    }else{
        die("{\"status\":\"-2\"}");
    }
}catch(PDOException $ex){
    die("{\"status\":\"-1\",\"error\",\"".$ex->getMessage()."\"}");
}
?>