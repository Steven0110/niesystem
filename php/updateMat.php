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
    
    
    $sheet = $objPHPExcel->getSheet( 2 ); 
    $highestRow = $sheet->getHighestRow(); 
    $highestColumn = $sheet->getHighestColumn();
    for ($row = 2; $row <= $highestRow; $row++ ){
        //  Read a row of data into an array
        $folio = $sheet->getCell("K".$row)->getOldCalculatedValue();
        $partes = $sheet->getCell("O".$row)->getOldCalculatedValue();
        echo $folio."  ";
        echo $partes."  \n";
        $sql = "INSERT IGNORE INTO material_cargo('folio', 'partes_iva') VALUES(:folio, :partes)";
        $stm = $pdo->prepare( $sql );
        $stm->bindParam(":folio", $folio, PDO::PARAM_STR);
        $stm->bindParam(":partes", $partes, PDO::PARAM_INT);
        //Error al insertar (-2)
        if( !$stm->execute() ){
            print_r( $stm->errorInfo() );
            die("{\"status\":\"-2\"}");
        }
    }
    echo("{\"status\":\"1\"}");
}
?>