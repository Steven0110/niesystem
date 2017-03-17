<?php
include 'db-variables.php';

function esCargo( $cad ){
    return ( strpos( $cad, "-") !== false ) ? true : false;
}
function fixVal( $cad ){
    if( $cad == "")
        return "0.0";
    else 
        return $cad.".0";
}

$no_sheet = intval($_GET["val"]);
$idt = $_GET["idt"];
//Arreglos: Folios que no existen, folios que ya fueron registrados.
$svc_nx = array();
$svc_rg = array();
$svc_ok = array();

if ( 0 < $_FILES['file']['error'] ) {
    //-3, error al leer la variable global $_FILES 
    die("{\"status\":\"-3\",\"error\":\"".$_FILES['file']['error']."\"}");
}
else{
    $pdo = null;
    try{
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
        $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    }catch(PDOException $ex){
        //Error en el PDO (-1)
        echo "{\"status\":\"-1\", \"error\":\"".$ex->getMessage()."\"}";
    }
    $inputFile = $_FILES["file"]["tmp_name"];
    date_default_timezone_set('America/Mexico_City');
    require_once "../plugins/PHPExcel/Classes/PHPExcel.php";
    try{
        $inputFileType = PHPExcel_IOFactory::identify( $inputFile );
        $objReader = PHPExcel_IOFactory::createReader( $inputFileType );
        $objPHPExcel = $objReader->load( $inputFile );
    }catch(Exception $e) {
        //Error al leer el archivo XLSX (-4)
        die( "{\"status\":\"-4\",\"error\":\"".$e->getMessage()."\"}" );
    }
    //LECTURA DE LA HOJA DE CALCULO
    //Hoja activa variable
    $sheet = $objPHPExcel->getSheet( $no_sheet );
    //$highestRow = $sheet->getHighestRow(); 
    $highestRow = 36; //Max
    $highestColumn = $sheet->getHighestColumn();
    for ($row = 7; $row <= $highestRow; $row++ ){
        //TO DO:  FOLIO, MO, DESP, CASETAS, PARTES, MODELO, SERIE, COBRO
        
        
        $folio = $sheet->getCell("B".$row)->getValue();
        if( $folio == "") continue;
        
        $mo = fixVal( $sheet->getCell("C".$row)->getValue() );
        $desp = fixVal($sheet->getCell("E".$row)->getValue() );
        $cas = fixVal($sheet->getCell("F".$row)->getValue() );
        $partes = fixVal( $sheet->getCell("G".$row)->getValue() );
        $mod = $sheet->getCell("I".$row)->getValue();
        $serie = $sheet->getCell("J".$row)->getValue();
        $cobro = fixVal( $sheet->getCell("M".$row)->getValue() );
        
        if( !esCargo( $folio ) ){
            //Check if exists
            $sql = "SELECT Modelo FROM registro_gspn WHERE Reclamacion_del_ASC=:folio";
            $stm = $pdo->prepare( $sql );
            $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
            if( $stm->execute() ){
                if( $stm->rowCount() == 0 ){
                    array_push($svc_nx, $folio);
                }else{
                    $sql = "SELECT * FROM servicios_tecnico_trabajados WHERE folio=:folio";
                    $stm = $pdo->prepare( $sql );
                    $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
                    if( $stm->execute() ){
                        if( $stm->rowCount() == 0 ){
                            //Inserts
                            array_push($svc_ok, $folio);
                            $sql = "INSERT INTO servicios_tecnico_trabajados VALUES(:folio, :idTecnico, 1, :mo, :cas, :desp, :iva, :cobro, NULL, NULL, 1, 0)";
                            $stm = $pdo->prepare( $sql );
                            $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
                            $stm->bindParam(":idTecnico", $idt, PDO::PARAM_STR);
                            $stm->bindParam(":mo", $mo, PDO::PARAM_STR);
                            $stm->bindParam(":cas", $cas, PDO::PARAM_STR);
                            $stm->bindParam(":desp", $desp, PDO::PARAM_STR);
                            $stm->bindParam(":iva", $partes, PDO::PARAM_STR);
                            $stm->bindParam(":cobro", $cobro, PDO::PARAM_STR);
                            if( !$stm->execute() )
                                die("{\"status\":\"-5\"}");
                        }
                        else
                            array_push($svc_rg, $folio);
                    }else    
                        die("{\"status\":\"-2\"}");
                }
            }else
                die("{\"status\":\"-2\"}");
        }else{
            //Check if registered yet
            $sql = "SELECT * FROM servicios_tecnico_trabajados WHERE folio=:folio";
            $stm = $pdo->prepare( $sql );
            $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
            if( $stm->execute() ){
                if( $stm->rowCount() == 0 ){
                    //Inserts
                    array_push( $svc_ok, $folio );
                    $sql = "INSERT INTO servicios_tecnico_trabajados VALUES(:folio, :idTecnico, 1, :mo, :cas, :desp, :iva, :cobro, NULL, NULL, 1, 0)";
                    $stm = $pdo->prepare( $sql );
                    $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
                    $stm->bindParam(":idTecnico", $idt, PDO::PARAM_STR);
                    $stm->bindParam(":mo", $mo, PDO::PARAM_STR);
                    $stm->bindParam(":cas", $cas, PDO::PARAM_STR);
                    $stm->bindParam(":desp", $desp, PDO::PARAM_STR);
                    $stm->bindParam(":iva", $partes, PDO::PARAM_STR);
                    $stm->bindParam(":cobro", $cobro, PDO::PARAM_STR);
                    if( $stm->execute() ){
                        $sql = "INSERT INTO servicios_cargo VALUES(:folio, :mod, :serie)";
                        $stm = $pdo->prepare( $sql );
                        $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
                        $stm->bindParam(":mod", $mod, PDO::PARAM_STR);
                        $stm->bindParam(":serie", $serie, PDO::PARAM_STR);
                        if( !$stm->execute() )
                            die("{\"status\":\"-5\"}");
                    }
                    else
                        die("{\"status\":\"-5\"}");
                }
                else
                    array_push( $svc_rg, $folio );
            }else
                die("{\"status\":\"-2\"}");            
        }
    }
    $status = 1;
    $json_response = new stdClass();
    $json_response->svcOk = $svc_ok;
    $json_response->svcNx = $svc_nx;
    $json_response->svcRg = $svc_rg;
    $json_response->status = $status;
    echo json_encode( $json_response );
}
?>