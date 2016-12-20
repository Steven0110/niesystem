$(document).ready(function(){
    $(".fecha").dateDropper();
    //Close session
    $("#close").click(function(){
        $.removeCookie("usuario");
        location.href = "./";
    });

    //Add listener to datedropper
    $("#fecha-fin").change(function(){
        var date = new Date( $(this).val() );
        var day = getWeekNumber( date );
        $("#num_semana").text( day );
        $("#num_semana").slideDown("slow");
    });

    $("#gen-report").click( function(){
        //Generar reporte
        $(".mid-panel").slideUp("slow");
        $("#gen-report-panel").slideDown("slow");

    });
    $("#show-reports").click( function(){
        //Visualizar reporte
    });

    var salute = "Bienvenido " + JSON.parse( $.cookie("usuario")).name;
    $("#saludo").text( salute );

    $("#checkFolio").click( checkSvcExistence );

    $("#add-svc").click( addService );



});

function getWeekNumber( d ) {
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0,0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return weekNo;
}

function checkSvcExistence(){

        //Revisa que el folio no haya sido cobrado

        $("#loading-icon").slideDown("slow");
        $("#check-ok").slideUp("fast");

        var folio = $("#folio").val();
        $.post({
            url : "php/checkSvcExistence.php",
            data : { "folio" : folio },
            success : function( response ){
                var data = JSON.parse( response );
                if( data.status == "1" ){
                    if( data.cantidad == "0" ){
                        //OK
                        $("#loading-icon").slideUp("slow", function(){
                            $("#check-ok").slideDown("slow", function(){
                                $("#add-svc").removeAttr("disabled");
                                getInfoSvc( folio );
                            });
                            //Carga la informacion a los campos de texto correspondientes

                        });
                    }else{
                        //Ya hay un folio registrado
                        swal({
                            title : "Advertencia",
                            type : "warning",
                            text : "El folio ya ha sido registrado"
                        },function(){
                            $("#loading-icon").slideUp("slow");
                        });
                    }
                }else if( data.status == "0"){
                    swal({
                        title : "Advertencia",
                        type : "warning",
                        text : "El folio que intentas agregar no existe en la base de datos"
                    },function(){
                        $("#loading-icon").slideUp("slow");
                    });
                }else{
                    //Error desconocido
                    swal({
                        title : "Error",
                        text : data.error,
                        type : "error"
                    });
                }
            }
        });
}

function getInfoSvc( folio ){
    $.post({
        data : { "folio" : folio },
        url : "php/getInfoSvc.php",
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status ==  "1" ){
                $("#sem").val( data.mo );
                $("#mod").val( data.modelo );
                $("#serie").val( data.serie );
            }else{
                swal({
                    title : "Error",
                    text : data.error,
                    type : "error"
                });
            }
        }
    });
}
function addService(){
    var folio = $("#folio").val();
    var idt = ( JSON.parse( $.cookie("usuario") ) ).idt;
    var status = 1;
    var mo = ( $("#mo-1").val() === undefined ) ? 0 : $("#mo-1").val();
    var casetas = ( $("#cas-1").val() === undefined ) ? 0 : $("#cas-1").val();
    var desp = ( $("#des-1").val() === undefined ) ? 0 : $("#des-1").val();
    var iva = ( $("#iva-1").val() === undefined ) ? 0 : $("#iva-1").val();
    var cobro = ( $("#cobro-1").val() === undefined ) ? 0 : $("#cobro-1").val();
    var obs = ( $("#obs-1").val() === undefined ) ? 0 : $("#obs-1").val();
}

