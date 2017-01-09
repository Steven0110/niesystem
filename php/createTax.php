<?php
include 'db-variables.php';
$desc = $_POST["desc"];
$mo = $_POST["mo"];
$rev = $_POST["rev"];
$cat = $_POST["cat"];
try{
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $usr_admin, $psw_admin);
    $pdo->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES utf8");
    $sql = "INSERT INTO tarifas(descripcion, mano_obra, revision, categoria ) VALUES( :desc, :mo, :rev, :cat )";
    $stm = $pdo->prepare( $sql );
    $stm->bindParam(":desc", $desc, PDO::PARAM_STR);
    $stm->bindParam(":mo", $mo, PDO::PARAM_INT);
    $stm->bindParam(":rev", $rev, PDO::PARAM_INT);
    $stm->bindParam(":cat", $cat, PDO::PARAM_STR);
    if( $stm->execute() ){
        echo "{\"status\":\"1\"}";
    }else{
        echo "{\"status\":\"-2\"}";
    }
}catch(PDOException $ex){
    echo "{\"status\":\"-1\",\"error\":\"".$ex->getMessage()."\"}";
}
?>
