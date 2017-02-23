<?php
include 'db-variables.php';
$idt = $_POST["idt"];
$name = $_POST["name"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "SELECT s.folio, s.mano_obra, s.casetas, s.desplazamiento, s.partes_iva, s.cobro, s.observacion, s.garantia, r.semana, p.nombre FROM servicios_tecnico_trabajados s, reporte r, persona p WHERE r.idreporte=s.idreporte AND r.idtecnico=:idt AND r.idtecnico=p.idtecnico ORDER BY 9, 10, 1";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam( ":idt", $idt, PDO::PARAM_INT );
    if( $stm->execute() ){
        $rs = $stm->fetchAll(PDO::FETCH_ASSOC);
        date_default_timezone_set('America/Mexico_City');
        require_once "../plugins/PHPExcel/Classes/PHPExcel.php";
        $objPHPExcel = new PHPExcel();
        $objPHPExcel->getProperties()->setCreator("Gerardo Cabello@Niesystem")
            ->setTitle("Reporte")
            ->setDescription("Reporte del tecnico ".$idt);
        $title = "Reporte del técnico";
        $cols = array("Folio", "Mano de obra", "Semana", "Desplazamiento", "Casetas", "Partes con IVA", "Tecnico");
        $objPHPExcel->setActiveSheetIndex(0)->mergeCells("A1:G1");
        $objPHPExcel->setActiveSheetIndex(0)->setCellValue("A1", $title)
            ->setCellValue("A2", $cols[ 0 ])
            ->setCellValue("B2", $cols[ 1 ])
            ->setCellValue("C2", $cols[ 2 ])
            ->setCellValue("D2", $cols[ 3 ])
            ->setCellValue("E2", $cols[ 4 ])
            ->setCellValue("F2", $cols[ 5 ])
            ->setCellValue("G2", $cols[ 6 ]);
        for( $i = 0 ; $i < $stm->rowCount() ; $i++ ){
            $j = $i + 3;
            $objPHPExcel->setActiveSheetIndex(0)->setCellValue("A".$j, $rs[ $i ]["folio"])
                ->setCellValue("B".$j, $rs[ $i ]["mano_obra"])
                ->setCellValue("C".$j, $rs[ $i ]["semana"])
                ->setCellValue("D".$j, $rs[ $i ]["desplazamiento"])
                ->setCellValue("E".$j, $rs[ $i ]["casetas"])
                ->setCellValue("F".$j, $rs[ $i ]["partes_iva"])
                ->setCellValue("G".$j, $name);
        }
        for( $i = 'A' ; $i <= 'G' ; $i++ ){
            $objPHPExcel->setActiveSheetIndex(0)->getColumnDimension($i)->setAutoSize(TRUE);
        }
        
        $objPHPExcel->getActiveSheet()->setTitle("Reporte");
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getActiveSheet(0)->freezePaneByColumnAndRow(0,7);
        $filename = "reporte_".$name."_".date("Y-m-d").".xlsx";
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