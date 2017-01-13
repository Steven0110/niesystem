<?php
include 'db-variables.php';
if ( 0 < $_FILES['file']['error'] ) {
    echo 'Error: ' . $_FILES['file']['error'] . '<br>';
}
else {
    var_dump( $_FILES["file"]["tmp_name"] );
}
?>