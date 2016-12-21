$(document).ready(function(){
    $(".fecha").dateDropper();
    //Close session
    $("#close").click(function(){
        $.removeCookie("usuario");
        location.href = "./";
    });

    //Add listener to datedropper
    $("#fecha").change( setSemana );
    $("#gen-report").click( function(){
        //Generar reporte
        $(".mid-panel").slideUp("slow");
        $("#gen-report-panel").slideDown("slow");

    });
    $("#show-reports").click( function(){
        //Visualizar reporte
        $(".mid-panel").slideUp("slow");
        $("#view-reports-panel").slideDown("slow");
        getServices();
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
                            $("#add-svc").attr("disabled", "disabled");
                            cleanFields();
                        });
                    }
                }else if( data.status == "0"){
                    swal({
                        title : "Advertencia",
                        type : "warning",
                        text : "El folio que intentas agregar no existe en la base de datos"
                    },function(){
                        $("#loading-icon").slideUp("slow");
                        cleanFields();
                        $("#add-svc").attr("disabled", "disabled");
                    });
                }else{
                    //Error desconocido
                    swal({
                        title : "Error",
                        text : data.error,
                        type : "error"
                    }, function(){ cleanFields(); $("#add-svc").attr("disabled", "disabled"); } );
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
                $("#cas").val( Math.ceil ( data.cas ) );
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
    var mo = ( $("#mo-1").val() === "" ) ? 0 : $("#mo-1").val();
    var casetas = ( $("#cas-1").val() === "" ) ? 0 : $("#cas-1").val();
    var desp = ( $("#des-1").val() === "" ) ? 0 : $("#des-1").val();
    var iva = ( $("#iva-1").val() === "" ) ? 0 : $("#iva-1").val();
    var cobro = ( $("#cobro-1").val() === "" ) ? 0 : $("#cobro-1").val();
    var obs = ( $("#obs-1").val() === "" ) ? 0 : $("#obs-1").val();
    var tos = $('#tos').find(":selected").val();
    $.post({
        data : {
            "folio" : folio,
            "idtec" : idt,
            "status" : status,
            "mo" : mo,
            "casetas" : casetas,
            "desp" : desp,
            "iva" : iva,
            "cobro" : cobro,
            "obs" : obs,
            "tipo" : tos
        },
        url : "php/addService.php",
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "1" ){
                swal({
                    title : "OK",
                    text : "Servicio agregado correctamente",
                    type : "success"
                }, function(){ cleanFields(); $("#add-svc").attr("disabled", "disabled"); $("#check-ok").slideUp("slow"); } );
            }else{
                swal({
                    title : "Error",
                    text : data.error,
                    type : "error"
                }, function(){ cleanFields(); $("#add-svc").attr("disabled", "disabled"); $("#check-ok").slideUp("slow"); } );
            }
        }
    });
}
function cleanFields(){
    $(".report-input").val("");
    $(".report-input-2").val("");
}
function setSemana(){
    var date = new Date( $(this).val() );
    var day = getWeekNumber( date );
    $("#num_semana").text( day );
    $("#num_semana").slideDown("slow");
}

function getServices(){
    $.post({
        url : "php/getSvcs.php",
        data : { "idt" : JSON.parse( $.cookie("usuario") ).idt },
        success : function( response ){
            var data = JSON.parse( response );

            console.log( data );

            //Generacion de tabla de servicios
            var table = $("#report-table");
            table.empty();
            var header = $("<tr><th>Folio</th><th>Modelo</th><th>Serie</th><th>M. de obra</th><th>SEM</th><th>Casetas</th><th>Desplazamiento</th><th>Partes</th><th>Cobro</th><th>Observación</th></tr>");
            table.append( header );
            //Servicios de cargo
            for( var i = 1 ; i <= data.svcCargo.length ; i++ ){

                var svc_tr = $("<tr></tr>");

                var td_folio = $("<td></td>");
                var input_folio = $("<input/>");
                input_folio.addClass("input");
                input_folio.attr("size", "5");
                input_folio.attr("id", "folio_td-" + i );
                input_folio.attr("value", data.svcCargo[ i - 1 ].folio );
                td_folio.append( input_folio );
                if( input_folio.val().length > 5 )
                    input_folio.attr("size", "\"" + input_folio.val().length + "\"" );
                else
                    input_folio.attr("size", "5" );


                var td_mod = $("<td></td>");
                var input_mod = $("<input/>");
                input_mod.addClass("input");
                input_mod.attr("size", "5");
                input_mod.attr("id", "mod_td-" + i );
                input_mod.attr("value", data.svcCargo[ i - 1 ].mod );
                td_mod.append( input_mod );
                if( input_mod.val().length > 5 )
                    input_mod.attr("size", "\"" + input_mod.val().length + "\"" );
                else
                    input_mod.attr("size", "5" );

                var td_serie = $("<td></td>");
                var input_serie = $("<input/>");
                input_serie.addClass("input");
                input_serie.attr("size", "5");
                input_serie.attr("id", "serie_td-" + i );
                input_serie.attr("value", data.svcCargo[ i - 1 ].serie );
                td_serie.append( input_serie );
                if( input_serie.val().length > 5 )
                    input_serie.attr("size", "\"" + input_serie.val().length + "\"" );
                else
                    input_serie.attr("size", "5" );

                var td_mo = $("<td></td>");
                var input_mo = $("<input/>");
                input_mo.addClass("input");
                input_mo.attr("size", "5");
                input_mo.attr("id", "mo_td-" + i );
                input_mo.attr("value", data.svcCargo[ i - 1 ].mo );
                td_mo.append( input_mo );
                if( input_mo.val().length > 5 )
                    input_mo.attr("size", "\"" + input_mo.val().length + "\"" );
                else
                    input_mo.attr("size", "5" );

                var td_sem = $("<td></td>");
                var input_sem = $("<input/>");
                input_sem.addClass("input");
                input_sem.attr("size", "5");
                input_sem.attr("id", "sem_td-" + i );
                input_sem.attr("value", data.svcCargo[ i - 1 ].sem );
                td_sem.append( input_sem );
                if( input_sem.val().length > 5 )
                    input_sem.attr("size", "\"" + input_sem.val().length + "\"" );
                else
                    input_sem.attr("size", "5" );

                var td_cas = $("<td></td>");
                var input_cas = $("<input/>");
                input_cas.addClass("input");
                input_cas.attr("size", "5");
                input_cas.attr("id", "cas_td-" + i );
                input_cas.attr("value", data.svcCargo[ i - 1 ].cas );
                td_cas.append( input_cas );
                if( input_cas.val().length > 5 )
                    input_cas.attr("size", "\"" + input_cas.val().length + "\"" );
                else
                    input_cas.attr("size", "5" );


                var td_desp = $("<td></td>");
                var input_desp = $("<input/>");
                input_desp.addClass("input");
                input_desp.attr("size", "5");
                input_desp.attr("id", "desp_td-" + i );
                input_desp.attr("value", data.svcCargo[ i - 1 ].desp );
                td_desp.append( input_desp );
                if( input_desp.val().length > 5 )
                    input_desp.attr("size", "\"" + input_desp.val().length + "\"" );
                else
                    input_desp.attr("size", "5" );

                var td_partes = $("<td></td>");
                var input_partes = $("<input/>");
                input_partes.addClass("input");
                input_partes.attr("size", "5");
                input_partes.attr("id", "partes_td-" + i );
                input_partes.attr("value", data.svcCargo[ i - 1 ].iva );
                td_partes.append( input_partes );
                if( input_partes.val().length > 5 )
                    input_partes.attr("size", "\"" + input_partes.val().length + "\"" );
                else
                    input_partes.attr("size", "5" );

                var td_obs = $("<td></td>");
                var input_obs = $("<input/>");
                input_obs.addClass("input");
                input_obs.attr("size", "5");
                input_obs.attr("id", "obs_td-" + i );
                input_obs.attr("value", data.svcCargo[ i - 1 ].obs );
                td_obs.append( input_obs );
                if( input_obs.val().length > 5 )
                    input_obs.attr("size", "\"" + input_obs.val().length + "\"" );
                else
                    input_obs.attr("size", "5" );

                var td_cobro = $("<td></td>");
                var input_cobro = $("<input/>");
                input_cobro.addClass("input");
                input_cobro.attr("size", "5");
                input_cobro.attr("id", "cobro_td-" + i );
                input_cobro.attr("value", data.svcCargo[ i - 1 ].cobro );
                td_cobro.append( input_cobro );
                if( input_cobro.val().length > 5 )
                    input_cobro.attr("size", "\"" + input_cobro.val().length + "\"" );
                else
                    input_cobro.attr("size", "5" );

                var td_img = $("<td></td>");
                var img = $("<img/>");
                img.addClass("table-icon");
                img.attr( "id", "delete-" + i );
                img.attr( "src", "imgs/delete.png");
                img.attr( "alt", "Eliminar servicio");
                td_img.append( img );

                svc_tr.append( td_folio );
                svc_tr.append( td_mod );
                svc_tr.append( td_serie );
                svc_tr.append( td_mo );
                svc_tr.append( td_sem );
                svc_tr.append( td_cas );
                svc_tr.append( td_desp );
                svc_tr.append( td_partes );
                svc_tr.append( td_cobro );
                svc_tr.append( td_obs );
                svc_tr.append( td_img );

                table.append( svc_tr );
                img.on( "click", deleteSvc( i ) );
            }
        }
    });
}

function deleteSvc( num ){
    console.log("Eliminar: " + num );
}

