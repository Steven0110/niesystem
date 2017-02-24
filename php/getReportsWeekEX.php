<?php
include 'db-variables.php';
$week = $_POST["week"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "SELECT s.folio, s.mano_obra, s.casetas, s.desplazamiento, s.partes_iva, s.cobro, s.observacion, s.garantia, r.semana, p.nombre FROM servicios_tecnico_trabajados s, reporte r, persona p WHERE r.idreporte=s.idreporte AND r.semana=:week AND r.idtecnico=p.idtecnico ORDER BY 9, 10, 1";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam( ":week", $week, PDO::PARAM_INT );
    if( $stm->execute() ){
        $rs = $stm->fetchAll(PDO::FETCH_ASSOC);
        date_default_timezone_set('America/Mexico_City');
        require_once "../plugins/PHPExcel/Classes/PHPExcel.php";
        $objPHPExcel = new PHPExcel();
        $objPHPExcel->getProperties()->setCreator("Gerardo Cabello@Niesystem")
            ->setTitle("Reporte")
            ->setDescription("Reporte de la semana ".$week);
        $title = "Reporte del técnico";
        $cols = array("Folio", "Mano de obra", "Semana", "Desplazamiento", "Casetas", "Partes con IVA", "Tecnico", "Mano de obra TLP");
        $objPHPExcel->setActiveSheetIndex(0)->mergeCells("A1:G1");
        $objPHPExcel->setActiveSheetIndex(0)->setCellValue("A1", $title)
            ->setCellValue("A2", $cols[ 0 ])
            ->setCellValue("B2", $cols[ 1 ])
            ->setCellValue("C2", $cols[ 2 ])
            ->setCellValue("D2", $cols[ 3 ])
            ->setCellValue("E2", $cols[ 4 ])
            ->setCellValue("F2", $cols[ 5 ])
            ->setCellValue("G2", $cols[ 6 ])
            ->setCellValue("H2", $cols[ 7 ]);
        for( $i = 0 ; $i < $stm->rowCount() ; $i++ ){
            $j = $i + 3;
            
            
            //URL ABSOLUTA DE LA PC DE SANTANA
            /*$aux_str = '=VLOOKUP(A'.$j.',\'C:\Users\dasac\Mis Archivos\DOCUMENTACION Y ORGANIZAC DE  NIESA\CONTABILIDAD TLP Y COY\EQUIPOS REP SEM POR TECNICOS\[EQUIPOS REPARADOS POR TECNICOS TLP.xlsx]REPORTE ACUMUL\'!$A$1:$B$1048576, 2, 0)';
            //URL RELATIVA DE LA PC DE PRUEBAS DE LA RED DE NIESA*/
            $aux_str = '=VLOOKUP(A'.$j.',\'[EQUIPOS REPARADOS POR TECNICOS TLP.xlsx]REPORTE ACUMUL\'!$A$1:$B$1048576, 2, 0)';
            
            $objPHPExcel->setActiveSheetIndex(0)->setCellValue("A".$j, $rs[ $i ]["folio"])
                ->setCellValue("B".$j, $rs[ $i ]["mano_obra"])
                ->setCellValue("C".$j, $rs[ $i ]["semana"])
                ->setCellValue("D".$j, $rs[ $i ]["desplazamiento"])
                ->setCellValue("E".$j, $rs[ $i ]["casetas"])
                ->setCellValue("F".$j, $rs[ $i ]["partes_iva"])
                ->setCellValue("G".$j, $rs[ $i ]["nombre"])
                ->setCellValue("H".$j, $aux_str);
        }
        for( $i = 'A' ; $i <= 'G' ; $i++ ){
            $objPHPExcel->setActiveSheetIndex(0)->getColumnDimension($i)->setAutoSize(TRUE);
        }
        
        $objPHPExcel->getActiveSheet()->setTitle("Reporte");
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getActiveSheet(0)->freezePaneByColumnAndRow(0,7);
        $filename = "reporte_semana_".$week."_".date("Y-m-d").".xlsx";
        //header("Content-Type: application/vnd.ms-excel");
        //header("Content-Disposition: attachment; filename=".$filename);
        //header("Cache-Control: max-age=1");
        //Save
        $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, "Excel2007");
        $objWriter->save("temp/".$filename);
        echo "{\"status\":\"1\",\"url\":\"temp/".$filename."\"}";
    }else
        die("{\"status\":\"-2\"}");
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>