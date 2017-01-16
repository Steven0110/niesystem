<?php
include 'db-variables.php';
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
    $sheet = $objPHPExcel->getSheet( 0 ); 
    $highestRow = $sheet->getHighestRow(); 
    $highestColumn = $sheet->getHighestColumn();
    for ($row = 2; $row <= $highestRow; $row++ ){ 
    //for ($row = 1; $row <= $highestRow; $row++ ){ 
        //  Read a row of data into an array
        $Reclamacion_del_ASC = $sheet->getCell("D".$row)->getValue();
        //echo $Reclamacion_del_ASC."  ";
        $Modelo = $sheet->getCell("L".$row)->getValue();
        //echo $Modelo."  ";
        $Serie = $sheet->getCell("M".$row)->getValue();
        //echo $Serie."  ";
        $MO = $sheet->getCell("AA".$row)->getValue();
        //echo $MO."  ";
        $Flete = ( $sheet->getCell("AC".$row)->getValue() == "" ) ? "0.0" : $sheet->getCell("AC".$row)->getValue().".0";
        //echo $Flete."  ";
        $Status = ( $sheet-> getCell("AJ".$row)->getValue() == "" ) ? "0.0" : $sheet->getCell("AJ".$row)->getValue().".0";
        //echo $Status."  ";
        $Ing = $sheet->getCell("AK".$row)->getValue();
        //echo $Ing."  \n";
        $sql = "INSERT IGNORE INTO registro_gspn VALUES(:asc, :mod, :serie, :mo, :fletes, :status, :ing)";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam(":asc", $Reclamacion_del_ASC, PDO::PARAM_STR);
        $stm->bindParam(":mod", $Modelo, PDO::PARAM_STR);
        $stm->bindParam(":serie", $Serie, PDO::PARAM_STR);    
        $stm->bindParam(":mo", $MO, PDO::PARAM_STR);
        $stm->bindParam(":fletes", $Flete, PDO::PARAM_STR);
        $stm->bindParam(":status", $Status, PDO::PARAM_INT);
        $stm->bindParam(":ing", $Ing, PDO::PARAM_INT);
        //Error al insertar (-2)
        if( !$stm->execute() )
            die("{\"status\":\"-2\"}");
    }
    echo("{\"status\":\"1\"}");
}
?>