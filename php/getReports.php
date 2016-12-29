<?php
include 'db-variables.php';
$idt = $_POST["idt"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin );
    $pdo->setAttribute( PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "SELECT * FROM reporte WHERE idtecnico=:idt ORDER BY revision DESC";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":idt", $idt, PDO::PARAM_INT );
    if( $stm->execute() ){
        $rs = $stm->fetchAll();
        $response = "{\"reports\":[";
        foreach( $rs as $report ){
            $response .= "{";
            $response .= "\"idr\":\"".$report[ 0 ]."\",";
            $response .= "\"fecha\":\"".$report[ 1 ]."\",";
            $response .= "\"tipo\":\"".$report[ 2 ]."\",";
            $response .= "\"idt\":\"".$report[ 3 ]."\",";
            $response .= "\"semana\":\"".$report[ 4 ]."\",";
            $response .= "\"com\":\"".$report[ 5 ]."\",";
            $response .= "\"rev\":\"".$report[ 6 ]."\"";
            $response .= "},";
        }
        $response = trim($response, ",");
        $response .= "],";
        $response .= "\"status\":\"1\"}";
        echo $response;
    }else{
        echo "{";
        echo "\"status\":\"-2\"";
        echo "}";
    }
}catch(PDOException $ex){
    echo "{";
    echo "\"status\":\"-1\",";
    echo "\"error\":\"".$ex->getMessage()."\"";
    echo "}";
}
?>
