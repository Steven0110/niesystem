var num_svcs, num_svcs_c, num_svcs_ih;
$(document).ready(function(){
    
    if( !isIE() ){
        swal({
            title : "Navegador no compatible",
            text : "Para poder usar el sistema es necesario usar uno de los siguientes navegadores: <strong>Chrome, Firefox, Opera, Edge, Internet Explorer(versión 9 o superior)</strong>",
            type : "error",
            html : true
        },function(){
            location.href = "index.html";
        });
    }
    
    $(".fecha").dateDropper();
    //Close session
    $("#close").click(function(){
        $.removeCookie("usuario");
        location.href = "./";
    });
    //Calcular mano de obra
    $("#calc-mo").click( setMO );

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
    $(".view-checked-reports").click(function(){
        //Ver reportes anteriores
        $(".mid-panel").slideUp("slow");
        $("#last-reports-panel").slideDown("slow");
        getReports();
    });
    $("#rejected-services").click(function(){
        $(".mid-panel").slideUp("slow");
        $("#rej-services-panel").slideDown("slow");
    });

    var salute = "Bienvenido " + JSON.parse( $.cookie("usuario")).name;
    $("#saludo").text( salute );

    $("#checkFolio").click( checkSvcExistence );

    $("#add-svc").click( addService );

    $("#generate-report").click( genReport );

    $("#tipo-reporte").change( setDesp );

    $("#check-tarifas").click( openPopUpTarifas );

    $("#close-tarifas").click( closePopUpTarifas );
    
    $("#contact").click( openContact );
    
    $("#close-contact").click( closeContact );
    
    
    getRejectedServices();

});


function checkSvcExistence(){
    //Detecta si el folio es de samsung o de cargo
    var folio = $("#folio").val();
    var isSamsung = true;
    if( folio.length == 10 ){
        for( var i = 0 ; i < folio.length ; i++ ){
            if( isNaN(folio.charAt( i ) ) )
                isSamsung = false;
        }
    }else if( !folio.includes("GRMS") ) isSamsung = false;
    
        
    if( isSamsung ){
        //Para los folios de SAMSUNG
        //Revisa que el folio no haya sido cobrado
        $("#loading-icon").slideDown("slow");
        $("#check-ok").slideUp("fast");

        $.post({
            url : "php/checkSvcExistence.php",
            // 0 Samsung, 1 Cargo
            data : { "folio" : folio, "type" : 0 },
            success : function( response ){
                var data = JSON.parse( response );
                if( data.status == "1" ){
                    if( data.cantidad == "0" ){
                        //OK
                        $("#check-cargo").removeAttr("checked");
                        $("#loading-icon").slideUp("slow", function(){
                            $("#check-ok").slideDown("slow", function(){
                                $("#add-svc").removeAttr("disabled");
                                $("#mod").attr("disabled", "disabled");
                                $("#serie").attr("disabled", "disabled");
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
                        text : "El folio que intentas agregar no existe en la base de datos. Tal vez la base de datos aún no sea actualizada por el administrador"
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
    }else{
        //Para los servicios de cargo
        $("#loading-icon").slideDown("slow");
        $("#check-ok").slideUp("fast");
        $.post({
            data : { "folio" : folio, "type" : 1 },
            url : "php/checkSvcExistence.php",
            success : function( response ){
                var data = JSON.parse( response );
                if( data.status == "1" ){
                    if( data.cantidad == "0" ){
                        //OK
                        cleanFields_2();
                        $("#check-cargo").attr("checked", "checked");
                        $("#loading-icon").slideUp("slow", function(){
                            $("#check-ok").slideDown("slow", function(){
                                $("#add-svc").removeAttr("disabled");
                                $("#mod").removeAttr("disabled");
                                $("#serie").removeAttr("disabled");
                                
                            });
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
                $("#cas-1").val( Math.ceil ( Number( data.cas ) ) );
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
    var tos = ( $("#check-cargo").prop("checked") == true ) ? 1 : 0;
    if( tos == 0 ){
        var folio = $("#folio").val();
        var idt = ( JSON.parse( $.cookie("usuario") ) ).idt;
        var status = 1;
        var mo = ( $("#mo-1").val() === "" ) ? 0 : $("#mo-1").val();
        var casetas = ( $("#cas-1").val() === "" ) ? 0 : $("#cas-1").val();
        var desp = ( $("#des-1").val() === "" ) ? 0 : $("#des-1").val();
        var iva = ( $("#iva-1").val() === "" ) ? 0 : $("#iva-1").val();
        var cobro = ( $("#cobro-1").val() === "" ) ? 0 : $("#cobro-1").val();
        var obs = ( $("#obs-1").val() === "" ) ? 0 : $("#obs-1").val();
        var gar = ( $("#check-gar").prop("checked") == true ) ? 1 : 0;
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
                "tipo" : tos,
                "gar" : gar,
                "type" : tos
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
                }else if( data.status == "2"){
                    
                }
                else{
                    swal({
                        title : "Error",
                        text : data.error,
                        type : "error"
                    }, function(){ cleanFields(); $("#add-svc").attr("disabled", "disabled"); $("#check-ok").slideUp("slow"); } );
                }
            }
        });
    }else{
        var folio = $("#folio").val();
        var idt = ( JSON.parse( $.cookie("usuario") ) ).idt;
        var status = 1;
        var mo = ( $("#mo-1").val() === "" ) ? 0 : $("#mo-1").val();
        var casetas = ( $("#cas-1").val() === "" ) ? 0 : $("#cas-1").val();
        var desp = ( $("#des-1").val() === "" ) ? 0 : $("#des-1").val();
        var iva = ( $("#iva-1").val() === "" ) ? 0 : $("#iva-1").val();
        var cobro = ( $("#cobro-1").val() === "" ) ? 0 : $("#cobro-1").val();
        var obs = ( $("#obs-1").val() === "" ) ? 0 : $("#obs-1").val();
        var gar = ( $("#check-gar").prop("checked") == true ) ? 1 : 0;
        var mod = ( $("#mod").val() === "" ) ? 0 : $("#mod").val();
        var serie = ( $("#serie").val() === "" ) ? 0 : $("#serie").val();
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
                "tipo" : tos,
                "gar" : gar,
                "type" : tos,
                "mod" : mod,
                "serie" : serie
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
}
function cleanFields(){
    $(".report-input").val("");
    $(".report-input-2").val("");
}
function cleanFields_2(){
    $(".report-input").val("");
}
function setSemana(){
    var date = new Date( $(this).val() );
    var day = getWeekNumber( date );
    $("#num_semana").text( day );
    $("#num_semana").slideDown("slow");
}

function getServices(){
    //Set id tecnico
    $("#id-tecnico").text( JSON.parse( $.cookie("usuario") ).idt);
    
    $.post({
        url : "php/getSvcs.php",
        data : { "idt" : JSON.parse( $.cookie("usuario") ).idt },
        success : function( response ){
            var data = JSON.parse( response );
            //Generacion de tabla de servicios de cargo
            var table = $("#report-table-c");
            table.empty();
            var header = $("<tr><th>Folio</th><th>Modelo</th><th>Serie</th><th>M. de obra</th><th>SEM</th><th>Casetas</th><th>Desplazamiento</th><th>Partes</th><th>Cobro</th><th>Garantía</th></tr>");
            table.append( header );
            //Servicios de cargo
            var i, j=0;
            for( i = 1 ; i <= data.svcCargo.length ; i++ ){

                var svc_tr = $("<tr></tr>");
                svc_tr.attr("id", "svc-" + i );

                var td_folio = $("<td></td>");
                var input_folio = $("<input/>");
                input_folio.addClass("input");
                input_folio.attr("size", "5");
                input_folio.attr("id", "folio_td-" + i );
                input_folio.attr("value", data.svcCargo[ i - 1 ].folio );
                input_folio.attr("disabled", "disabled");
                td_folio.append( input_folio );
                if( input_folio.val().length > 5 )
                    input_folio.attr("size", input_folio.val().length + 2 );
                else
                    input_folio.attr("size", "5" );


                var td_mod = $("<td></td>");
                var input_mod = $("<input/>");
                input_mod.addClass("input");
                input_mod.attr("size", "5");
                input_mod.attr("id", "mod_td-" + i );
                input_mod.attr("value", data.svcCargo[ i - 1 ].mod );
                input_mod.attr("disabled", "disabled");
                td_mod.append( input_mod );
                if( input_mod.val().length > 5 )
                    input_mod.attr("size", input_mod.val().length + 2 );
                else
                    input_mod.attr("size", "5" );

                var td_serie = $("<td></td>");
                var input_serie = $("<input/>");
                input_serie.addClass("input");
                input_serie.attr("size", "5");
                input_serie.attr("id", "serie_td-" + i );
                input_serie.attr("value", data.svcCargo[ i - 1 ].serie );
                input_serie.attr("disabled", "disabled");
                td_serie.append( input_serie );
                if( input_serie.val().length > 5 )
                    input_serie.attr("size", input_serie.val().length + 2  );
                else
                    input_serie.attr("size", "5" );

                var td_mo = $("<td></td>");
                var input_mo = $("<input/>");
                input_mo.addClass("input");
                input_mo.attr("size", "5");
                input_mo.attr("id", "mo_td-" + i );
                input_mo.attr("value", data.svcCargo[ i - 1 ].mo );
                input_mo.attr("onkeyup", "calcularTotales()");
                input_mo.attr("onchange", "calcularTotales()");
                td_mo.append( input_mo );
                if( input_mo.val().length > 5 )
                    input_mo.attr("size", input_mo.val().length + 2  );
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
                    input_sem.attr("size", input_sem.val().length+ 2  );
                else
                    input_sem.attr("size", "5" );

                var td_cas = $("<td></td>");
                var input_cas = $("<input/>");
                input_cas.addClass("input");
                input_cas.attr("size", "5");
                input_cas.attr("id", "cas_td-" + i );
                input_cas.attr("value", data.svcCargo[ i - 1 ].cas );
                td_cas.append( input_cas );
                input_cas.attr("onkeyup", "calcularTotales()");
                if( input_cas.val().length > 5 )
                    input_cas.attr("size", input_cas.val().length+ 2  );
                else
                    input_cas.attr("size", "5" );


                var td_desp = $("<td></td>");
                var input_desp = $("<input/>");
                input_desp.addClass("input");
                input_desp.attr("size", "5");
                input_desp.attr("id", "desp_td-" + i );
                input_desp.attr("value", data.svcCargo[ i - 1 ].desp );
                input_desp.attr("onkeyup", "calcularTotales()");
                td_desp.append( input_desp );
                if( input_desp.val().length > 5 )
                    input_desp.attr("size", input_desp.val().length+ 2  );
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
                    input_partes.attr("size", input_partes.val().length+ 2  );
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
                    input_obs.attr("size", input_obs.val().length+ 2  );
                else
                    input_obs.attr("size", "5" );

                var td_cobro = $("<td></td>");
                var input_cobro = $("<input/>");
                input_cobro.addClass("input");
                input_cobro.attr("size", "5");
                input_cobro.attr("id", "cobro_td-" + i );
                input_cobro.attr("onkeyup", "calcularTotales()");
                input_cobro.attr("value", data.svcCargo[ i - 1 ].cobro );
                td_cobro.append( input_cobro );
                if( input_cobro.val().length > 5 )
                    input_cobro.attr("size", input_cobro.val().length+ 2  );
                else
                    input_cobro.attr("size", "5" );


                var td_gar = $("<td></td>");
                td_gar.addClass("checkbox-block");
                var input_gar = $("<input/>");
                input_gar.attr("type", "checkbox");
                input_gar.addClass("checkbox-md");
                input_gar.attr("id", "gar_td-" + i );
                if( data.svcCargo[ i - 1 ].gar == "1" ){
                    input_gar.attr( "checked", "checked" );
                    input_cobro.attr("disabled", "disabled");
                }
                input_gar.attr( "disabled", "disabled" );
                td_gar.append( input_gar );
                var td_img = $("<td></td>");
                var img = $("<img/>");
                img.addClass("table-icon");
                img.attr( "id", "delete-" + i );
                img.attr( "src", "imgs/delete.png");
                img.attr( "alt", "Eliminar servicio");
                img.attr("onclick", "deleteSvc(" + i + ")" );
                td_img.append( img );
                
                //Indicador de cargo
                var id_cargo = $("<td></td>");
                id_cargo.attr("id", "cargo_td-" + i);
                id_cargo.attr("hidden", "hidden");
                id_cargo.val("1");
                

                svc_tr.append( td_folio );
                svc_tr.append( td_mod );
                svc_tr.append( td_serie );
                svc_tr.append( td_mo );
                svc_tr.append( td_sem );
                svc_tr.append( td_cas );
                svc_tr.append( td_desp );
                svc_tr.append( td_partes );
                svc_tr.append( td_cobro );
                svc_tr.append( id_cargo );
                //svc_tr.append( td_obs );
                svc_tr.append( td_gar );
                svc_tr.append( td_img );

                table.append( svc_tr );
                num_svcs = i;
                j = i;
            }
            j++;
            //Generacion de tabla de servicios in home
            var table = $("#report-table-ih");
            table.empty();
            var header = $("<tr><th>Folio</th><th>Modelo</th><th>Serie</th><th>M. de obra</th><th>SEM</th><th>Casetas</th><th>Desplazamiento</th><th>Partes</th><th>Cobro</th><th>Garantía</th></tr>");
            table.append( header );
            //Servicios in home
            for( i = 1 ; i <= data.svcIH.length ; i++ ){

                var svc_tr = $("<tr></tr>");
                svc_tr.attr("id", "svc-" + j );

                var td_folio = $("<td></td>");
                var input_folio = $("<input/>");
                input_folio.addClass("input");
                input_folio.attr("size", "5");
                input_folio.attr("id", "folio_td-" + j );
                input_folio.attr("value", data.svcIH[ i - 1 ].folio );
                input_folio.attr("disabled", "disabled");
                td_folio.append( input_folio );
                if( input_folio.val().length > 5 )
                    input_folio.attr("size", input_folio.val().length + 2 );
                else
                    input_folio.attr("size", "5" );


                var td_mod = $("<td></td>");
                var input_mod = $("<input/>");
                input_mod.addClass("input");
                input_mod.attr("size", "5");
                input_mod.attr("id", "mod_td-" + j );
                input_mod.attr("value", data.svcIH[ i - 1 ].mod );
                input_mod.attr("disabled", "disabled");
                td_mod.append( input_mod );
                if( input_mod.val().length > 5 )
                    input_mod.attr("size", input_mod.val().length + 2 );
                else
                    input_mod.attr("size", "5" );

                var td_serie = $("<td></td>");
                var input_serie = $("<input/>");
                input_serie.addClass("input");
                input_serie.attr("size", "5");
                input_serie.attr("id", "serie_td-" + j );
                input_serie.attr("value", data.svcIH[ i - 1 ].serie );
                input_serie.attr("disabled", "disabled");
                td_serie.append( input_serie );
                if( input_serie.val().length > 5 )
                    input_serie.attr("size", input_serie.val().length + 2  );
                else
                    input_serie.attr("size", "5" );

                var td_mo = $("<td></td>");
                var input_mo = $("<input/>");
                input_mo.addClass("input");
                input_mo.attr("size", "5");
                input_mo.attr("id", "mo_td-" + j );
                input_mo.attr("value", data.svcIH[ i - 1 ].mo );
                input_mo.attr("onkeyup", "calcularTotales()");
                input_mo.attr("onchange", "calcularTotales()");
                td_mo.append( input_mo );
                if( input_mo.val().length > 5 )
                    input_mo.attr("size", input_mo.val().length + 2  );
                else
                    input_mo.attr("size", "5" );

                var td_sem = $("<td></td>");
                var input_sem = $("<input/>");
                input_sem.addClass("input");
                input_sem.attr("size", "5");
                input_sem.attr("id", "sem_td-" + j );
                input_sem.attr("value", data.svcIH[ i - 1 ].sem );
                input_sem.attr("disabled", "disabled");
                td_sem.append( input_sem );
                if( input_sem.val().length > 5 )
                    input_sem.attr("size", input_sem.val().length+ 2  );
                else
                    input_sem.attr("size", "5" );

                var td_cas = $("<td></td>");
                var input_cas = $("<input/>");
                input_cas.addClass("input");
                input_cas.attr("size", "5");
                input_cas.attr("id", "cas_td-" + j );
                input_cas.attr("value", data.svcIH[ i - 1 ].cas );
                input_cas.attr("onkeyup", "calcularTotales()");
                td_cas.append( input_cas );
                if( input_cas.val().length > 5 )
                    input_cas.attr("size", input_cas.val().length+ 2  );
                else
                    input_cas.attr("size", "5" );


                var td_desp = $("<td></td>");
                var input_desp = $("<input/>");
                input_desp.addClass("input");
                input_desp.attr("size", "5");
                input_desp.attr("id", "desp_td-" + j );
                input_desp.attr("value", data.svcIH[ i - 1 ].desp );
                input_desp.attr("onkeyup", "calcularTotales()");
                td_desp.append( input_desp );
                if( input_desp.val().length > 5 )
                    input_desp.attr("size", input_desp.val().length+ 2  );
                else
                    input_desp.attr("size", "5" );

                var td_partes = $("<td></td>");
                var input_partes = $("<input/>");
                input_partes.addClass("input");
                input_partes.attr("size", "5");
                input_partes.attr("id", "partes_td-" + j );
                input_partes.attr("value", data.svcIH[ i - 1 ].iva );
                td_partes.append( input_partes );
                if( input_partes.val().length > 5 )
                    input_partes.attr("size", input_partes.val().length+ 2  );
                else
                    input_partes.attr("size", "5" );

                var td_obs = $("<td></td>");
                var input_obs = $("<input/>");
                input_obs.addClass("input");
                input_obs.attr("size", "5");
                input_obs.attr("id", "obs_td-" + j );
                input_obs.attr("value", data.svcIH[ i - 1 ].obs );
                td_obs.append( input_obs );
                if( input_obs.val().length > 5 )
                    input_obs.attr("size", input_obs.val().length+ 2  );
                else
                    input_obs.attr("size", "5" );

                var td_cobro = $("<td></td>");
                var input_cobro = $("<input/>");
                input_cobro.addClass("input");
                input_cobro.attr("size", "5");
                input_cobro.attr("id", "cobro_td-" + j );
                input_cobro.attr("onkeyup", "calcularTotales()");
                input_cobro.attr("value", data.svcIH[ i - 1 ].cobro );
                td_cobro.append( input_cobro );
                if( input_cobro.val().length > 5 )
                    input_cobro.attr("size", input_cobro.val().length+ 2  );
                else
                    input_cobro.attr("size", "5" );

                var td_gar = $("<td></td>");
                td_gar.addClass("checkbox-block");
                var input_gar = $("<input/>");
                input_gar.attr("type", "checkbox");
                input_gar.addClass("checkbox-md");
                input_gar.attr("id", "gar_td-" + j );
                if( data.svcIH[ i - 1 ].gar == "1" ){
                    input_gar.attr( "checked", "checked" );
                    input_cobro.attr("disabled", "disabled");
                }
                input_gar.attr( "disabled", "disabled" );
                td_gar.append( input_gar );

                var td_img = $("<td></td>");
                var img = $("<img/>");
                img.addClass("table-icon");
                img.attr( "id", "delete-" + j );
                img.attr( "src", "imgs/delete.png");
                img.attr( "alt", "Eliminar servicio");
                img.attr("onclick", "deleteSvc(" + j + ")" );
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
                svc_tr.append( td_gar );
                //svc_tr.append( td_obs );
                svc_tr.append( td_img );

                table.append( svc_tr );
                num_svcs = j;
                console.log("Numero de servicios: " + num_svcs );
                j++;
            }
        }
    });
}
function deleteSvc( num ){
    console.log("Eliminar: " + num );
    $("#svc-" + num ).remove();
    calcularTotales();
}
function genReport(){
    console.log( num_svcs );
    var id_report = JSON.parse( $.cookie("usuario") ).idt + $("#fecha").val() + Math.floor(Math.random() * 999);
    id_report = id_report.replace(/\//g, "");
    var validacion_general = true;
    for( var i = 1 ; i <= num_svcs ; i++ ){
        if( $("#folio_td-" + i ).val() !== undefined ){
            if( !validarServicio( i ) ){
                validacion_general = false;
                break;
            }
        }
    }
    if( validacion_general ){
        var idt = JSON.parse( $.cookie("usuario") ).idt;
        var fecha = $("#fecha").val();
        var date = new Date( $("#fecha").val() );
        var semana = getWeekNumber( date );
        var tipo = $('#tipo-reporte').find(":selected").val();
        addReport( id_report, fecha, semana, idt, tipo );
    }
}
function validarServicio( num ){
    console.log( "Revisar folio " + num );
    var cobro = Number( $( "#cobro_td-" + num ).val());
    var sem = Number( $( "#sem_td-" + num ).val());
    var mo = Number( $( "#mo_td-" + num ).val());
    var cas = Number( $( "#cas_td-" + num ).val());
    var desp = Number( $( "#desp_td-" + num ).val());
    var partes = Number( $( "#partes_td-" + num ).val());
    var folio = $("#folio_td-" + num).val();
    var gar = ( $("#gar_td-" + num ).prop("checked") == true ) ? 1 : 0;
    if( gar == 0 ){
        var total_tecnico = sem + mo + cas + desp + partes;
        if( total_tecnico < cobro ){
            swal({
                type : "error",
                title : "Error en el cobro del servicio " + folio,
                text : "La suma total es menor a lo que se le cobró al cliente "
            });
            return false;
        }else if( total_tecnico > cobro ){
            swal({
                type : "error",
                title : "Error en el cobro del servicio " + folio,
                text : "La suma total es mayor a lo que se le cobró al cliente "
            });
            return false;
        }else return true;
    }else{
        //El folio es de garantia
        if( $("#cargo_td-" + num).val() === undefined ){
            var total_mo = sem - cas - desp - partes;
            if( mo > total_mo ){
                swal({
                    type : "error",
                    title : "Error en el cobro del servicio " + folio,
                    text : "La mano de obra es mayor a la que deberia ser ($" + total_mo + ")"
                });
                return false;
            }else if( mo < total_mo ){
                swal({
                    type : "error",
                    title : "Error en el cobro del servicio " + folio,
                    text : "La mano de obra es menor a la que deberia ser ($" + total_mo + ")"
                });
                return false;
            }else return true;
        }else return true;
    }
}

function calcularTotales(){
    var total_mo_c = 0, total_desp_c = 0, total_cas_c = 0, total_labor_c = 0;
    var total_mo_ih = 0, total_desp_ih = 0, total_cas_ih = 0, total_labor_ih = 0;
    //Calculo para cargo
    var mo_cargo = $("#report-table-c .input[id^=\"mo_td-\"]");
    var desp_cargo = $("#report-table-c .input[id^=\"desp_td-\"]");
    var cas_cargo = $("#report-table-c .input[id^=\"cas_td-\"]");
    for( var i = 0 ; i < mo_cargo.length ; i++ ){
        //var index = getIndex( $(mo_cargo[ i ]).attr("id") );
        total_mo_c += Number( $(mo_cargo[ i ]).val() );
        total_cas_c += Number( $(cas_cargo[ i ]).val() );
        total_desp_c += Number( $(desp_cargo[ i ]).val() );
    }
    total_labor_c = ((total_mo_c * 0.3914) + (total_mo_c * 0.3914 * 0.16)).toFixed(2);
    $("#total-mo-c").text("$" + total_mo_c );
    $("#total-cas-c").text("$" + total_cas_c );
    $("#total-desp-c").text("$" + total_desp_c );
    $("#total-sub-c").text( "$" + (total_mo_c * 0.3914).toFixed(2) );
    $("#total-iva-c").text( "$" + (total_mo_c * 0.3914 * 0.16).toFixed(2) );
    $("#total-labor-c").text("$" + total_labor_c );

    //Calculo para in home
    var mo_ih = $("#report-table-ih .input[id^=\"mo_td-\"]");
    var desp_ih = $("#report-table-ih .input[id^=\"desp_td-\"]");
    var cas_ih = $("#report-table-ih .input[id^=\"cas_td-\"]");

    for( var i = 0 ; i < mo_ih.length ; i++ ){
        total_mo_ih += Number( $(mo_ih[ i ]).val() );
        total_cas_ih += Number( $(cas_ih[ i ]).val() );
        total_desp_ih += Number( $(desp_ih[ i ]).val() );
    }
    total_labor_ih = ((total_mo_ih * 0.5) + (total_mo_ih * 0.5 * 0.16)).toFixed(2);
    $("#total-mo-ih").text("$" + total_mo_ih );
    $("#total-cas-ih").text("$" + total_cas_ih );
    $("#total-desp-ih").text("$" + total_desp_ih );
    $("#total-sub-ih").text( "$" + (total_mo_ih * 0.5).toFixed(2));
    $("#total-iva-ih").text( "$" + (total_mo_ih * 0.5 * 0.16).toFixed(2) );
    $("#total-labor-ih").text("$" + total_labor_ih );
    var total_reporte = Number(total_labor_c )+ Number(total_labor_ih);
    $("#total-rep").text( "$" + total_reporte.toFixed(2) );
}

function addReport( idr, fecha, semana, idt, tipo ){
    var folios = new Array();
    var mos = new Array();
    var casetas = new Array();
    var desps = new Array();
    var ivas = new Array();
    var cobros = new Array();
    for( var i = 1 ; i <= num_svcs ; i++ ){
        if( $("#folio_td-" + i ).val() !== undefined ){
            folios.push( $("#folio_td-" + i).val() );
            mos.push( $("#mo_td-" + i).val() );
            casetas.push( $("#cas_td-" + i).val() );
            desps.push( $("#desp_td-" + i).val() );
            ivas.push( $("#partes_td-" + i).val() );
            cobros.push( $("#cobro_td-" + i).val() );
        }
    }
    $.post({
        url : "php/addReport.php",
        data : {
            "folios" : folios,
            "mos" : mos,
            "casetas" : casetas,
            "desps" : desps,
            "ivas" : ivas,
            "cobros" : cobros,
            "idr" : idr,
            "idt" : idt,
            "fecha" : fecha,
            "tipo" : tipo,
            "semana" : semana
        },
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "1")
                swal({
                    title : "OK",
                    text : "Reporte generado exitosamente",
                    type : "success"
                },function(){
                    location.reload();
                });
            else if( data.status == "-1" )
                swal({
                    title : "Error",
                    text : "error: " + data.error,
                    type : "error"
                });
            else
                swal({
                    title : "Error desconocido",
                    type : "error"
                });
        }
    });
}

function setDesp(){
    var tipo = $(this).find(":selected").val();
    if( tipo == "LB" ){
        var desp_c = $("#report-table-c .input[id^=\"desp_td-\"]");
        for( var i = 0 ; i < desp_c.length ; i++ ){
            desp_c.val(25);
        }
        var desp_ih = $("#report-table-ih .input[id^=\"desp_td-\"]");
        for( var i = 0 ; i < desp_ih.length ; i++ ){
            desp_ih.val(25);
        }
    }else{
        var desp_c = $("#report-table-c .input[id^=\"desp_td-\"]");
        for( var i = 0 ; i < desp_c.length ; i++ ){
            desp_c.val(0);
        }
        var desp_ih = $("#report-table-ih .input[id^=\"desp_td-\"]");
        for( var i = 0 ; i < desp_ih.length ; i++ ){
            desp_ih.val(100);
        }
    }
    setMO();
    calcularTotales();
}
function setMO(){
    var mo_c = $("#report-table-c .input[id^=\"mo_td-\"]");
    var mo_ih = $("#report-table-ih .input[id^=\"mo_td-\"]");
    for( var i = 0 ; i < mo_c.length ; i++ ){
        var index = getIndex( $(mo_c[ i ]).attr("id") );
        if( $("#gar_td-" + index ).prop("checked") == true ){
            if( $("#cargo_td-" + index).val() === undefined ){
                $("#mo_td-" + index ).val( Number( $("#sem_td-" + index ).val() ) - Number( $("#desp_td-" + index).val() ) - Number( $("#cas_td-" + index).val() ) - Number( $("#partes_td-" + index ).val() )  );
            }
        }
        else{
            $("#mo_td-" + index ).val( - Number( $("#sem_td-" + index ).val() ) - Number( $("#desp_td-" + index).val() ) - Number( $("#cas_td-" + index).val() ) - Number( $("#partes_td-" + index ).val() ) + Number( $("#cobro_td-" + index).val() )  );
        }
    }
    for( var i = 0 ; i < mo_ih.length ; i++ ){
        var index = getIndex( $(mo_ih[ i ]).attr("id") );
        if( $("#gar_td-" + index ).prop("checked") == true )
            $("#mo_td-" + index ).val( Number( $("#sem_td-" + index ).val() ) - Number( $("#desp_td-" + index).val() ) - Number( $("#cas_td-" + index).val() ) - Number( $("#partes_td-" + index ).val() )  );
        else
            $("#mo_td-" + index ).val( - Number( $("#sem_td-" + index ).val() ) - Number( $("#desp_td-" + index).val() ) - Number( $("#cas_td-" + index).val() ) - Number( $("#partes_td-" + index ).val() ) + Number( $("#cobro_td-" + index).val() )  );
    }
    calcularTotales();
}

function getWeekNumber( d ) {
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0,0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(),0,1);
    // Calculate full weeks to ne
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}
function closePopUpTarifas(){
    $("#popup-layer").fadeOut("slow");
    $("#tarifas-block").fadeOut("slow");
}
function openPopUpTarifas(){
    $("#popup-layer").fadeIn("slow");
    $("#tarifas-block").fadeIn("slow");
    showTarifas();
}
function getIndex( cadena ){
    var aux = cadena.split("-");
    return Number( aux[ 1 ] );
}
function showTarifas(){
    var table = $("#tarifas-table");
    table.empty();
    $.post({
        url : "php/getTarifas.php",
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "1" ){
                var row_header = $("<tr></tr>");
                var header = $("<th>Descripción</th><th>Mano de obra</th><th>Costo revisión</th><th>Categoría</th>");
                row_header.append( header );
                table.append( row_header );
                for( var i = 0 ; i < data.item.length ; i++ ){
                    var tr = $("<tr></tr>");

                    var td_desc = $("<td>" + data.item[ i ].desc +  "</td>");
                    var td_mo = $("<td>" + data.item[ i ].mo +  "</td>");
                    var td_rev = $("<td>" + data.item[ i ].rev +  "</td>");
                    var td_cat = $("<td>" + data.item[ i ].cat +  "</td>");

                    tr.append( td_desc );
                    tr.append( td_mo );
                    tr.append( td_rev );
                    tr.append( td_cat );

                    table.append( tr );
                }
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

function getReports(){
    var idt = ( JSON.parse( $.cookie("usuario") ) ).idt;
    $.post({
        data : { "idt" : idt },
        url : "php/getReports.php",
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "1"){
                var table = $("#prev-reports-table");
                table.empty();
                var header = $("<th>ID Reporte</th><th>Fecha</th><th>Tipo</th><th>Semana</th><th>Revisión</th>");
                var row_header = $("<tr></tr>");
                row_header.append( header );
                table.append( row_header );
                for( var i = 0 ; i < data.reports.length ; i++ ){
                    var tr = $("<tr></tr>");
                    var td_idr = $("<td>" + data.reports[ i ].idr + "</td>");
                    td_idr.attr("id", "td_pr_idr-" + i );
                    var td_fecha = $("<td>" + data.reports[ i ].fecha + "</td>");
                    td_fecha.attr("id", "td_pr_fecha-" + i );
                    var td_tipo = $("<td>" + data.reports[ i ].tipo + "</td>");
                    td_tipo.attr("id", "td_pr_tipo-" + i );
                    var td_semana = $("<td>" + data.reports[ i ].semana + "</td>");
                    td_semana.attr("id", "td_pr_semana-" + i );
                    var td_rev = $("<td></td>");
                    td_rev.attr("id", "td_pr_rev-" + i );
                    var img = $("<img/>");
                    img.addClass("table-icon");
                    img.attr("onclick", "describeReport('" + data.reports[ i ].idr + "')")
                    if( data.reports[ i ].rev == "0")
                        img.attr("src", "imgs/wait.png");
                    else
                        img.attr("src", "imgs/ok.png");
                    td_rev.append( img );
                    tr.append(td_idr);
                    tr.append(td_fecha);
                    tr.append(td_tipo);
                    tr.append(td_semana);
                    tr.append(td_rev);
                    table.append( tr );
                }
            }else if( data.status == "-2"){
                swal({
                    title : "Error desconocido",
                    type : "error"
                });
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
function describeReport( idr ){
    $(".mid-panel").slideUp("slow");
    $("#desc-report").slideDown("slow");
    $("#no-reporte").text( idr );


    var total_mo_c = 0, total_desp_c = 0, total_cas_c = 0, total_labor_c = 0;
    var total_mo_ih = 0, total_desp_ih = 0, total_cas_ih = 0, total_labor_ih = 0;

    var idt = ( JSON.parse( $.cookie("usuario") ) ).idt;
    var table_c = $("#desc-report-table-c");
    var table_ih = $("#desc-report-table-ih");
    table_c.empty();
    table_ih.empty();
    var row_header_c = $("<tr><th>Folio</th><th>Modelo</th><th>Serie</th><th>M. de obra</th><th>SEM</th><th>Casetas</th><th>Desplazamiento</th><th>Partes</th><th>Cobro</th><th>Garantía</th></tr>");
    var row_header_ih = $("<tr><th>Folio</th><th>Modelo</th><th>Serie</th><th>M. de obra</th><th>SEM</th><th>Casetas</th><th>Desplazamiento</th><th>Partes</th><th>Cobro</th><th>Garantía</th></tr>");
    table_c.append( row_header_c );
    table_ih.append( row_header_ih );
    $.post({
        data : {
           "idt" : idt,
           "idr" : idr
        },
        url : "php/getSvcs.php",
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "1" ){
                for( i = 1 ; i <= data.svcCargo.length ; i++ ){

                    //Sumatoria de valores

                    total_mo_c += Number( data.svcCargo[ i - 1 ].mo );
                    total_cas_c += Number( data.svcCargo[ i - 1 ].cas );
                    total_desp_c += Number( data.svcCargo[ i - 1 ].desp );
                    var svc_tr = $("<tr></tr>");
                    svc_tr.attr("id", "svc-" + i );

                    var td_folio = $("<td></td>");
                    var input_folio = $("<input/>");
                    input_folio.addClass("input");
                    input_folio.attr("id", "folio_td-" + i );
                    input_folio.attr("value", data.svcCargo[ i - 1 ].folio );
                    input_folio.attr("disabled", "disabled");
                    if( input_folio.val().length > 5 )
                        input_folio.attr("size", input_folio.val().length + 2 );
                    else
                        input_folio.attr("size", "5" );
                    td_folio.append( input_folio );

                    var td_mod = $("<td></td>");
                    var input_mod = $("<input/>");
                    input_mod.addClass("input");
                    input_mod.attr("size", "5");
                    input_mod.attr("id", "mod_td-" + i );
                    input_mod.attr("value", data.svcCargo[ i - 1 ].mod );
                    input_mod.attr("disabled", "disabled");
                    td_mod.append( input_mod );
                    if( input_mod.val().length > 5 )
                        input_mod.attr("size", input_mod.val().length + 2 );
                    else
                        input_mod.attr("size", "5" );

                    var td_serie = $("<td></td>");
                    var input_serie = $("<input/>");
                    input_serie.addClass("input");
                    input_serie.attr("size", "5");
                    input_serie.attr("id", "serie_td-" + i );
                    input_serie.attr("value", data.svcCargo[ i - 1 ].serie );
                    input_serie.attr("disabled", "disabled");
                    td_serie.append( input_serie );
                    if( input_serie.val().length > 5 )
                        input_serie.attr("size", input_serie.val().length + 2  );
                    else
                        input_serie.attr("size", "5" );

                    var td_mo = $("<td></td>");
                    var input_mo = $("<input/>");
                    input_mo.addClass("input");
                    input_mo.attr("size", "5");
                    input_mo.attr("id", "mo_td-" + i );
                    input_mo.attr("value", data.svcCargo[ i - 1 ].mo );
                    input_mo.attr("disabled", "disabled");
                    td_mo.append( input_mo );
                    if( input_mo.val().length > 5 )
                        input_mo.attr("size", input_mo.val().length + 2  );
                    else
                        input_mo.attr("size", "5" );

                    var td_sem = $("<td></td>");
                    var input_sem = $("<input/>");
                    input_sem.addClass("input");
                    input_sem.attr("size", "5");
                    input_sem.attr("id", "sem_td-" + i );
                    input_sem.attr("value", data.svcCargo[ i - 1 ].sem );
                    input_sem.attr("disabled", "disabled");
                    td_sem.append( input_sem );
                    if( input_sem.val().length > 5 )
                        input_sem.attr("size", input_sem.val().length+ 2  );
                    else
                        input_sem.attr("size", "5" );

                    var td_cas = $("<td></td>");
                    var input_cas = $("<input/>");
                    input_cas.addClass("input");
                    input_cas.attr("size", "5");
                    input_cas.attr("id", "cas_td-" + i );
                    input_cas.attr("value", data.svcCargo[ i - 1 ].cas );
                    td_cas.append( input_cas );
                    input_cas.attr("disabled", "disabled");
                    if( input_cas.val().length > 5 )
                        input_cas.attr("size", input_cas.val().length+ 2  );
                    else
                        input_cas.attr("size", "5" );


                    var td_desp = $("<td></td>");
                    var input_desp = $("<input/>");
                    input_desp.addClass("input");
                    input_desp.attr("size", "5");
                    input_desp.attr("id", "desp_td-" + i );
                    input_desp.attr("value", data.svcCargo[ i - 1 ].desp );
                    input_desp.attr("disabled", "disabled");
                    td_desp.append( input_desp );
                    if( input_desp.val().length > 5 )
                        input_desp.attr("size", input_desp.val().length+ 2  );
                    else
                        input_desp.attr("size", "5" );

                    var td_partes = $("<td></td>");
                    var input_partes = $("<input/>");
                    input_partes.addClass("input");
                    input_partes.attr("size", "5");
                    input_partes.attr("disabled", "disabled");
                    input_partes.attr("id", "partes_td-" + i );
                    input_partes.attr("value", data.svcCargo[ i - 1 ].iva );
                    td_partes.append( input_partes );
                    if( input_partes.val().length > 5 )
                        input_partes.attr("size", input_partes.val().length+ 2  );
                    else
                        input_partes.attr("size", "5" );

                    var td_cobro = $("<td></td>");
                    var input_cobro = $("<input/>");
                    input_cobro.addClass("input");
                    input_cobro.attr("size", "5");
                    input_cobro.attr("id", "cobro_td-" + i );
                    input_cobro.attr("disabled", "disabled");
                    input_cobro.attr("value", data.svcCargo[ i - 1 ].cobro );
                    td_cobro.append( input_cobro );
                    if( input_cobro.val().length > 5 )
                        input_cobro.attr("size", input_cobro.val().length+ 2  );
                    else
                        input_cobro.attr("size", "5" );


                    var td_gar = $("<td></td>");
                    td_gar.addClass("checkbox-block");
                    var input_gar = $("<input/>");
                    input_gar.attr("type", "checkbox");
                    input_gar.addClass("checkbox-md");
                    input_gar.attr("id", "gar_td-" + i );
                    if( data.svcCargo[ i - 1 ].gar == "1" ){
                        input_gar.attr( "checked", "checked" );
                        input_cobro.attr("disabled", "disabled");
                    }
                    input_gar.attr( "disabled", "disabled" );
                    td_gar.append( input_gar );
                    
                    var div_obs = $("<div></div>");
                    div_obs.attr("data-toggle", "tooltip");
                    if( data.svcCargo[ i - 1 ].obs == "" ){
                        div_obs.addClass("green-led");
                        div_obs.attr("data-original-title", "OK");
                    }
                    else{
                        div_obs.addClass("orange-led");
                        div_obs.attr("data-original-title", data.svcCargo[ i - 1 ].obs);
                    }
                    div_obs.tooltip();
                    var td_obs = $("<td></td>");
                    td_obs.append( div_obs )
                    
                    svc_tr.append( td_folio );
                    svc_tr.append( td_mod );
                    svc_tr.append( td_serie );
                    svc_tr.append( td_mo );
                    svc_tr.append( td_sem );
                    svc_tr.append( td_cas );
                    svc_tr.append( td_desp );
                    svc_tr.append( td_partes );
                    svc_tr.append( td_cobro );
                    svc_tr.append( td_gar );
                    svc_tr.append( td_obs );

                    table_c.append( svc_tr );
                }

                total_labor_c = ((total_mo_c * 0.3914) + (total_mo_c * 0.3914 * 0.16)).toFixed(2);
                $("#desc-total-mo-c").text( "$" + total_mo_c );
                $("#desc-total-cas-c").text( "$" + total_cas_c );
                $("#desc-total-desp-c").text( "$" + total_desp_c );
                $("#desc-total-sub-c").text( "$" + (total_mo_c * 0.3914).toFixed(2));
                $("#desc-total-iva-c").text( "$" + (total_mo_c * 0.3914 * 0.16).toFixed(2));
                $("#desc-total-labor-c").text( "$" + total_labor_c );

                for( i = 1 ; i <= data.svcIH.length ; i++ ){


                    //Sumatoria de valores

                    total_mo_ih += Number(  data.svcIH[ i - 1 ].mo );
                    total_cas_ih += Number( data.svcIH[ i - 1 ].cas );
                    total_desp_ih += Number( data.svcIH[ i - 1 ].desp );

                    var svc_tr = $("<tr></tr>");
                    svc_tr.attr("id", "svc-" + i );

                    var td_folio = $("<td></td>");
                    var input_folio = $("<input/>");
                    input_folio.addClass("input");
                    input_folio.attr("size", "5");
                    input_folio.attr("id", "folio_td-" + i );
                    input_folio.attr("value", data.svcIH[ i - 1 ].folio );
                    input_folio.attr("disabled", "disabled");
                    if( input_folio.val().length > 5 )
                        input_folio.attr("size", input_folio.val().length + 2 );
                    else
                        input_folio.attr("size", "5" );
                    td_folio.append( input_folio );


                    var td_mod = $("<td></td>");
                    var input_mod = $("<input/>");
                    input_mod.addClass("input");
                    input_mod.attr("size", "5");
                    input_mod.attr("id", "mod_td-" + i );
                    input_mod.attr("value", data.svcIH[ i - 1 ].mod );
                    input_mod.attr("disabled", "disabled");
                    td_mod.append( input_mod );
                    if( input_mod.val().length > 5 )
                        input_mod.attr("size", input_mod.val().length + 2 );
                    else
                        input_mod.attr("size", "5" );

                    var td_serie = $("<td></td>");
                    var input_serie = $("<input/>");
                    input_serie.addClass("input");
                    input_serie.attr("size", "5");
                    input_serie.attr("id", "serie_td-" + i );
                    input_serie.attr("value", data.svcIH[ i - 1 ].serie );
                    input_serie.attr("disabled", "disabled");
                    td_serie.append( input_serie );
                    if( input_serie.val().length > 5 )
                        input_serie.attr("size", input_serie.val().length + 2  );
                    else
                        input_serie.attr("size", "5" );

                    var td_mo = $("<td></td>");
                    var input_mo = $("<input/>");
                    input_mo.addClass("input");
                    input_mo.attr("size", "5");
                    input_mo.attr("id", "mo_td-" + i );
                    input_mo.attr("value", data.svcIH[ i - 1 ].mo );
                    input_mo.attr("disabled", "disabled");
                    td_mo.append( input_mo );
                    if( input_mo.val().length > 5 )
                        input_mo.attr("size", input_mo.val().length + 2  );
                    else
                        input_mo.attr("size", "5" );

                    var td_sem = $("<td></td>");
                    var input_sem = $("<input/>");
                    input_sem.addClass("input");
                    input_sem.attr("size", "5");
                    input_sem.attr("id", "sem_td-" + i );
                    input_sem.attr("value", data.svcIH[ i - 1 ].sem );
                    input_sem.attr("disabled", "disabled");
                    td_sem.append( input_sem );
                    if( input_sem.val().length > 5 )
                        input_sem.attr("size", input_sem.val().length+ 2  );
                    else
                        input_sem.attr("size", "5" );

                    var td_cas = $("<td></td>");
                    var input_cas = $("<input/>");
                    input_cas.addClass("input");
                    input_cas.attr("size", "5");
                    input_cas.attr("id", "cas_td-" + i );
                    input_cas.attr("value", data.svcIH[ i - 1 ].cas );
                    td_cas.append( input_cas );
                    input_cas.attr("disabled", "disabled");
                    if( input_cas.val().length > 5 )
                        input_cas.attr("size", input_cas.val().length+ 2  );
                    else
                        input_cas.attr("size", "5" );


                    var td_desp = $("<td></td>");
                    var input_desp = $("<input/>");
                    input_desp.addClass("input");
                    input_desp.attr("size", "5");
                    input_desp.attr("id", "desp_td-" + i );
                    input_desp.attr("value", data.svcIH[ i - 1 ].desp );
                    input_desp.attr("disabled", "disabled");
                    td_desp.append( input_desp );
                    if( input_desp.val().length > 5 )
                        input_desp.attr("size", input_desp.val().length+ 2  );
                    else
                        input_desp.attr("size", "5" );

                    var td_partes = $("<td></td>");
                    var input_partes = $("<input/>");
                    input_partes.addClass("input");
                    input_partes.attr("size", "5");
                    input_partes.attr("id", "partes_td-" + i );
                    input_partes.attr("disabled", "disabled");
                    input_partes.attr("value", data.svcIH[ i - 1 ].iva );
                    td_partes.append( input_partes );
                    if( input_partes.val().length > 5 )
                        input_partes.attr("size", input_partes.val().length+ 2  );
                    else
                        input_partes.attr("size", "5" );

                    var td_cobro = $("<td></td>");
                    var input_cobro = $("<input/>");
                    input_cobro.addClass("input");
                    input_cobro.attr("size", "5");
                    input_cobro.attr("id", "cobro_td-" + i );
                    input_cobro.attr("disabled", "disabled");
                    input_cobro.attr("value", data.svcIH[ i - 1 ].cobro );
                    td_cobro.append( input_cobro );
                    if( input_cobro.val().length > 5 )
                        input_cobro.attr("size", input_cobro.val().length+ 2  );
                    else
                        input_cobro.attr("size", "5" );


                    var td_gar = $("<td></td>");
                    td_gar.addClass("checkbox-block");
                    var input_gar = $("<input/>");
                    input_gar.attr("type", "checkbox");
                    input_gar.addClass("checkbox-md");
                    input_gar.attr("id", "gar_td-" + i );
                    if( data.svcIH[ i - 1 ].gar == "1" ){
                        input_gar.attr( "checked", "checked" );
                        input_cobro.attr("disabled", "disabled");
                    }
                    input_gar.attr( "disabled", "disabled" );
                    td_gar.append( input_gar );
                    
                    
                    var div_obs = $("<div></div>");
                    div_obs.attr("data-toggle", "tooltip")
                    if( data.svcIH[ i - 1 ].obs == "" ){
                        div_obs.addClass("green-led");
                        div_obs.attr("data-original-title", "OK");
                    }
                    else{
                        div_obs.addClass("orange-led");
                        div_obs.attr("data-original-title", data.svcIH[ i - 1 ].obs);
                    }
                    div_obs.tooltip();
                    var td_obs = $("<td></td>");
                    td_obs.append( div_obs )
                    
                    svc_tr.append( td_folio );
                    svc_tr.append( td_mod );
                    svc_tr.append( td_serie );
                    svc_tr.append( td_mo );
                    svc_tr.append( td_sem );
                    svc_tr.append( td_cas );
                    svc_tr.append( td_desp );
                    svc_tr.append( td_partes );
                    svc_tr.append( td_cobro );
                    svc_tr.append( td_gar );
                    svc_tr.append( td_obs );

                    table_ih.append( svc_tr );
                }
                total_labor_ih = ((total_mo_ih * 0.5) + (total_mo_ih * 0.5 * 0.16)).toFixed(2);
                $("#desc-total-mo-ih").text( "$" + total_mo_ih );
                $("#desc-total-cas-ih").text( "$" + total_cas_ih );
                $("#desc-total-desp-ih").text( "$" + total_desp_ih );
                $("#desc-total-sub-ih").text( "$" + (total_mo_ih * 0.5).toFixed(2) );
                $("#desc-total-iva-ih").text( "$" + (total_mo_ih * 0.5 * 0.16).toFixed(2));
                $("#desc-total-labor-ih").text( "$" + total_labor_ih );
                var total_rep = Number( total_labor_ih ) + Number( total_labor_c );
                $("#desc-total-rep").text("$" + total_rep );
            }else if( data.status == "-2"){
                swal({
                    title : "Error desconocido",
                    type : "error"
                });
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
function getRejectedServices(){
    var idt = ( JSON.parse( $.cookie("usuario") ) ).idt;
    var table = $("#rej-svc-table");
    table.empty();
    var header = $("<tr><th>Folio</th><th>Observación</th></tr>");
    table.append( header );
    $.post({
        url : "php/getRejectedServices.php",
        data : {
            "idt" : idt
        },
        success : function( response ){
            var data = JSON.parse( response );
            //Despliega el numero de servicios rechazados en la opcion correspondiente
            $("#no-rechazados").text( data.svc.length );

            if( data.status == "1" ){
                for( var i = 0 ; i < data.svc.length ; i++ ){
                    var tr = $("<tr></tr>");
                    var td_folio = $("<td></td>");
                    var input_folio = $("<input/>");
                    input_folio.addClass("input");
                    input_folio.attr("size", "5");
                    input_folio.attr("id", "folio_td-" + i );
                    input_folio.attr("value", data.svc[ i ].folio );
                    input_folio.attr("disabled", "disabled");
                    if( input_folio.val().length > 5 )
                        input_folio.attr("size", input_folio.val().length + 2 );
                    else
                        input_folio.attr("size", "5" );
                    td_folio.append( input_folio );

                    var td_obs = $("<td class='wrapped'></td>");
                    td_obs.text(data.svc[ i ].obs);

                    tr.append( td_folio );
                    tr.append( td_obs );
                    table.append( tr );
                }
            }else if( data.status == "-2"){
                swal({
                    title : "Error desconocido",
                    type : "error"
                });
            }else{
                swal({
                    title : "Error",
                    type : "error",
                    text : data.error
                });
            }
        }
    });
}
function closeContact(){
    $("#popup-layer").fadeOut("slow");
    $("#contact-block").fadeOut("slow");
}
function openContact(){
    $("#popup-layer").fadeIn("slow");
    $("#contact-block").fadeIn("slow");
}
function isIE(){
    var user_agent = window.navigator.userAgent;
    var version = Number( user_agent.indexOf("MSIE ") );
    if( version > 0 && version < 9 ){
        return false;
    }else return true;
}