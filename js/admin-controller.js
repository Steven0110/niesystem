
$(document).ready(function(){
    //Close session
    $("#close").click(function(){
        $.removeCookie("usuario");
        location.href = "./";
    });

    $("#check-reports").click( function(){
        //Visualizar reportes pendientes
        $(".mid-panel").slideUp("slow");
        $("#check-reports-panel").slideDown("slow");
        showUncheckedReports();
    });
    $("#feed-db").click( function(){
        //Alimentar la base de datos con la informacion del GSPN
        $(".mid-panel").slideUp("slow");
        $("#feed-db-panel").slideDown("slow");
    });

    var salute = "Bienvenido " + JSON.parse( $.cookie("usuario")).name;
    $("#saludo").text( salute );

    $(".view-checked-reports").click(function(){
        //Ver reportes anteriores
        $(".mid-panel").slideUp("slow");
        $("#check-reports-panel").slideDown("slow");
        showUncheckedReports();
    });
    $("#mng-usr").click(function(){
        //Ver gestion de usuarios
        $(".mid-panel").slideUp("slow");
        $("#mng-usr-panel").slideDown("slow");
    });
    $("#tax").click(function(){
        //Ver gestion de usuarios
        $(".mid-panel").slideUp("slow");
        $("#tax-panel").slideDown("slow");
        showTaxes();
    });

    $("#add-usr").click( addUser );

    $("#rm-usr").click( removeUser );

    $("#confirm-report").click( confirmReport );
    //Upload files
    $("#upload-mat").click( uploadMaterial );
    $("#upload-gspn").click( uploadGSPN );
    //Validation for file update
    $('.file-input').change(function(){
        var file = this.files[0];
        var type = file.type;
        if( type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ){
            swal("Error. El archivo no es formato .xslx", "Si es .xsl favor de guardar el documento como documento .xlsx y volver a subirlo", "error");
            $("#upload-gspn").attr("disabled", "disabled");
            $("#upload-mat").attr("disabled", "disabled");
        }else{
            $("#upload-gspn").removeAttr("disabled");
            $("#upload-mat").removeAttr("disabled");
        }
    });
    $("#val-rep").click( validateReport );
    
    $("#dwnld-tec").click( showDTPanel );
    $("#dwnld-tec-btn").click( getReportsEX );
    
});
function showUncheckedReports(){
    $.post({
        url : "php/getUncheckedReports.php",
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "-1" ){
                swal({
                    title : "Error",
                    text : data.error,
                    type : "error"
                });
            }else if( data.status == "-2"){
                swal({
                    title : "Error desconocido",
                    type : "error"
                });
            }else{
                var table = $("#reports-table");
                table.empty();
                var header = $("<th>ID Reporte</th><th>Técnico</th><th>Semana</th><th>Tipo</th>")
                table.append( header );
                for( var i = 1 ; i <= data.reports.length ; i++ ){
                    var tr = $("<tr></tr>");
                    tr.attr( "id", "rp-" + i );
                    var td_idr = $("<td>" + data.reports[ i - 1 ].idr + "</td>");
                    td_idr.attr( "id","idr-" + i );
                    var td_nombre = $("<td>" + data.reports[ i - 1 ].nombre + "</td>");
                    td_nombre.attr( "id", "nom-" + i);
                    var td_semana = $("<td>" + data.reports[ i - 1 ].semana + "</td>");
                    td_semana.attr( "id", "semana-" + i);
                    var tipo_r = ( data.reports[ i - 1 ].tipo == "E" ) ? "Electrónica" : "Línea Blanca";
                    var td_tipo = $("<td>" + tipo_r + "</td>");
                    td_tipo.attr( "id", "tipo-" + i);
                    var btn = $("<button>Revisar</button>");
                    btn.attr("onclick", "checkReport('" + data.reports[ i - 1 ].idr + "', '" + data.reports[i - 1 ].idt + "')" );
                    btn.addClass("btn btn-blue");
                    tr.append( td_idr );
                    tr.append( td_nombre );
                    tr.append( td_semana );
                    tr.append( td_tipo );
                    tr.append( btn );
                    table.append(tr);
                }
            }
        }
    });
}


function checkReport( idr, idt ){
    $(".mid-panel").slideUp("slow");
    $("#desc-report").slideDown("slow");
    $("#no-reporte").text( idr );


    var total_mo_c = 0, total_desp_c = 0, total_cas_c = 0, total_labor_c = 0;
    var total_mo_ih = 0, total_desp_ih = 0, total_cas_ih = 0, total_labor_ih = 0;


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
                var j;
                for( i = 1 ; i <= data.svcCargo.length ; i++ ){
                    j = i;
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
                    input_mod.attr("disabled", "disabled");
                    input_mod.attr("id", "mod_td-" + i );
                    input_mod.attr("value", data.svcCargo[ i - 1 ].mod );
                    td_mod.append( input_mod );
                    if( input_mod.val().length > 5 )
                        input_mod.attr("size", input_mod.val().length + 2 );
                    else
                        input_mod.attr("size", "5" );

                    var td_serie = $("<td></td>");
                    var input_serie = $("<input/>");
                    input_serie.addClass("input");
                    input_serie.attr("size", "5");
                    input_serie.attr("disabled", "disabled");
                    input_serie.attr("id", "serie_td-" + i );
                    input_serie.attr("value", data.svcCargo[ i - 1 ].serie );
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

                    var td_cobro = $("<td></td>");
                    var input_cobro = $("<input/>");
                    input_cobro.addClass("input");
                    input_cobro.attr("size", "5");
                    input_cobro.attr("id", "cobro_td-" + i );
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
                    var td_img_upt = $("<td></td>");
                    var img_upt = $("<img/>");
                    img_upt.addClass("table-icon");
                    img_upt.attr( "id", "update-" + i );
                    img_upt.attr( "src", "imgs/update.ico");
                    img_upt.attr( "alt", "Eliminar servicio");
                    img_upt.attr("onclick", "updateSvc(" + i + ")" );
                    td_img_upt.append( img_upt );

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
                    svc_tr.append( td_img );
                    svc_tr.append( td_img_upt );

                    table_c.append( svc_tr );
                }
                j++;

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
                    svc_tr.attr("id", "svc-" + (i+j) );

                    var td_folio = $("<td></td>");
                    var input_folio = $("<input/>");
                    input_folio.addClass("input");
                    input_folio.attr("size", "5");
                    input_folio.attr("id", "folio_td-" + (i+j) );
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
                    input_mod.attr("id", "mod_td-" + (i+j) );
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
                    input_serie.attr("id", "serie_td-" + (i+j) );
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
                    input_mo.attr("id", "mo_td-" + (i+j) );
                    input_mo.attr("value", data.svcIH[ i - 1 ].mo );
                    td_mo.append( input_mo );
                    if( input_mo.val().length > 5 )
                        input_mo.attr("size", input_mo.val().length + 2  );
                    else
                        input_mo.attr("size", "5" );

                    var td_sem = $("<td></td>");
                    var input_sem = $("<input/>");
                    input_sem.addClass("input");
                    input_sem.attr("size", "5");
                    input_sem.attr("disabled", "disabled");
                    input_sem.attr("id", "sem_td-" + (i+j) );
                    input_sem.attr("value", data.svcIH[ i - 1 ].sem );
                    td_sem.append( input_sem );
                    if( input_sem.val().length > 5 )
                        input_sem.attr("size", input_sem.val().length+ 2  );
                    else
                        input_sem.attr("size", "5" );

                    var td_cas = $("<td></td>");
                    var input_cas = $("<input/>");
                    input_cas.addClass("input");
                    input_cas.attr("size", "5");
                    input_cas.attr("id", "cas_td-" + (i+j) );
                    input_cas.attr("value", data.svcIH[ i - 1 ].cas );
                    td_cas.append( input_cas );
                    if( input_cas.val().length > 5 )
                        input_cas.attr("size", input_cas.val().length+ 2  );
                    else
                        input_cas.attr("size", "5" );


                    var td_desp = $("<td></td>");
                    var input_desp = $("<input/>");
                    input_desp.addClass("input");
                    input_desp.attr("size", "5");
                    input_desp.attr("id", "desp_td-" + (i+j) );
                    input_desp.attr("value", data.svcIH[ i - 1 ].desp );
                    td_desp.append( input_desp );
                    if( input_desp.val().length > 5 )
                        input_desp.attr("size", input_desp.val().length+ 2  );
                    else
                        input_desp.attr("size", "5" );

                    var td_partes = $("<td></td>");
                    var input_partes = $("<input/>");
                    input_partes.addClass("input");
                    input_partes.attr("size", "5");
                    input_partes.attr("id", "partes_td-" + (i+j) );
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
                    input_cobro.attr("id", "cobro_td-" + (i+j) );
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
                    }
                    input_gar.attr( "disabled", "disabled" );
                    td_gar.append( input_gar );

                    var td_img = $("<td></td>");
                    var img = $("<img/>");
                    img.addClass("table-icon");
                    img.attr( "id", "delete-" + i );
                    img.attr( "src", "imgs/delete.png");
                    img.attr( "alt", "Eliminar servicio");
                    img.attr("onclick", "deleteSvc(" + (i+j) + ")" );
                    td_img.append( img );
                    var td_img_upt = $("<td></td>");
                    var img_upt = $("<img/>");
                    img_upt.addClass("table-icon");
                    img_upt.attr( "id", "update-" + (i+j) );
                    img_upt.attr( "src", "imgs/update.ico");
                    img_upt.attr( "alt", "Eliminar servicio");
                    img_upt.attr("onclick", "updateSvc(" + (i+j) + ")" );
                    td_img_upt.append( img_upt );

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
                    svc_tr.append( td_img );
                    svc_tr.append( td_img_upt );

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
function deleteSvc( num ){
    var folio = $( "#folio_td-" + num ).val();
    swal({
        title : "¿Desea rechazar el folio " + folio + "?",
        text : "No podrás deshacer esta operación",
        type : "warning",
        showCancelButton : true,
        confirmButtonColor : "#F43",
        confirmButtonText : "Rechazar servicio",
        cancelButtonText : "Regresar",
        closeOnConfirm : false
    },function(){
        swal({
            title : "Motivo del rechazo",
            type : "input",
            closeOnConfirm : false,
            animation : "slide-from-top",
            inputPlaceHolder : "Motivo"
        }, function( val ){
            if( val === false ) return false;
            if( val === ""){
                swal.showInputError("Favor de escribir un motivo");
                return false;
            }
            $.post({
                url : "php/rejectSvc.php",
                data : { "folio" : folio, "razon" : val },
                success : function( response ){
                    var data = JSON.parse( response );
                    if( data.status == "1" ){
                        swal({
                            "title" : "Servicio rechazado existosamente",
                            "text" : "El técnico correspondiente podrá ver su folio rechazado en su cuenta",
                            "type" :  "success"
                        },function(){
                            $("#svc-" + num).remove();
                        });
                    }else if( data.status == "-1"){
                        swal("Error" , data.error, "error");
                    }else{
                        swal("Error desconocido", "", "error");
                    }
                }
            })
        });
    });

}
function confirmReport(){
    var idr = $("#no-reporte").text();
    swal({
        title : "¿Estás seguro de confirmar el reporte?",
        text : "Recuerde que debe actualizar cada servicio individualmente si es que realizó algún cambio en los valores",
        type : "warning",
        showCancelButton : true,
        confirmButtonColor : "#F43",
        confirmButtonText : "Confirmar",
        cancelButtonText : "Regresar",
        closeOnConfirm : false
    }, function(){
        $.post({
            "url" : "php/confirmReport.php",
            "data" : { "idr" : idr },
            "success" : function( response ){
                var data = JSON.parse( response );
                if( data.status == "1"){
                    swal({
                        "title" : "OK",
                        "text" : "Reporte confirmado exitosamente",
                        "type" : "success"
                    }, function(){
                        //Ver reportes anteriores
                        $(".mid-panel").slideUp("slow");
                        $("#check-reports-panel").slideDown("slow");
                        showUncheckedReports();
                    });
                }else if(data.status == "-1"){
                    swal("Error", error.data, "error");
                }else{
                    swal("Error desconocido", "", "error");
                }
            }
        });
    });
}
function addUser(){
    var name = $("#usr-name").val();
    var ap = $("#usr-ap").val();
    var rfc = $("#usr-rfc").val();
    var idt = $("#usr-idt").val();
    $.post({
        url : "php/createUser.php",
        data : {
            "name" : name,
            "ap" : ap,
            "idt" : idt,
            "rfc" : rfc
        },
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "-3" ){
                swal("Error al crear técnico", "", "error");
            }else if( data.status == "-2" ){
                swal( "Error al crear usuario", "", "error");
            }else if( data.status == "-1"  ){
                swal( "Error", data.error, "error");
            }else{
                swal( "OK", "Cuenta creada correctamente", "success");
                //LImpiar valores
                $("#usr-idt").val("");
                $("#usr-name").val("");
                $("#usr-rfc").val("");
                $("#usr-ap").val("");
            }
        }
    });
}

function removeUser(){
    var idt = $("#rm-usr-idt").val();
    $.post({
        url : "php/removeUser.php",
        data: { "idt" : idt },
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "-2"){
                swal("Error al borrar tecnico" ,"", "error");
            }else if( data.status == "-3"){
                swal("Error al borrar cuenta de usuario", "", "error");
            }else if( data.status == "1"){
                swal("OK", "Cuenta eliminada correctamente", "success");
            }else{
                swal("Error", data.error, "error");
            }
        }
    });
}
function showTaxes(){
    var table = $("#tarifas-table");
    table.empty();
    $.post({
        url : "php/getTarifas.php",
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "1" ){
                var row_header = $("<tr></tr>");
                var header = $("<th>#</th><th>Descripción</th><th>Mano de obra</th><th>Costo revisión</th><th>Categoría</th>");
                row_header.append( header );
                table.append( row_header );
                for( var i = 0 ; i < data.item.length ; i++ ){
                    var tr = $("<tr></tr>");

                    var td_id = $("<td id='idx_td-" + i + "'>" + data.item[ i ].id + "</td>");
                    var td_desc = $("<td>" + data.item[ i ].desc + "</td>");

                    var td_mo = $("<td></td>");
                    var input_mo = $("<input/>");
                    input_mo.addClass("input");
                    input_mo.attr("size", "5");
                    input_mo.attr("id", "mox_td-" + i );
                    input_mo.attr("value", data.item[ i ].mo );
                    if( input_mo.val().length > 5 )
                        input_mo.attr("size", input_mo.val().length + 2  );
                    else
                        input_mo.attr("size", "5" );
                    td_mo.append( input_mo );
                    var td_rev = $("<td></td>");
                    var input_rev = $("<input/>");
                    input_rev.addClass("input");
                    input_rev.attr("size", "5");
                    input_rev.attr("id", "revx_td-" + i );
                    input_rev.attr("value", data.item[ i ].rev );
                    if( input_rev.val().length > 5 )
                        input_rev.attr("size", input_rev.val().length + 2  );
                    else
                        input_rev.attr("size", "5" );
                    td_rev.append( input_rev );
                    var td_cat = $("<td>" + data.item[ i ].cat + "</td>");
                    var td_img = $("<td></td>");
                    var img = $("<img src='imgs/update.ico' class='table-icon'/>");
                    img.attr("onclick", "updateTax(" + i + ")");
                    td_img.append( img );

                    tr.append( td_id );
                    tr.append( td_desc );
                    tr.append( td_mo );
                    tr.append( td_rev );
                    tr.append( td_cat );
                    tr.append( td_img );

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

function updateTax( num ){
    var id = $("#idx_td-" + num ).text();
    var mo = $("#mox_td-" + num ).val();
    var rev = $("#revx_td-" + num ).val();
    $.post({
        url : "php/updateTax.php",
        data : {
            "id" : id,
            "mo" : mo,
            "rev": rev
        },
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "-1"){
                swal("Error", data.error, "error");
            }else if( data.status == "-2"){
                swal("Error en", "", "error");
            }else{
                swal("OK", "Tarifa actualizada correctamente", "success");
                showTaxes();
            }
        }
    });
}

function addTax(){
    var desc = $("#tax-desc").val();
    var mo = $("#tax-mo").val();
    var rev = $("#tax-rev").val();
    var type_letter = $("#tax-type").find(":selected").val();
    var type;
    switch( type_letter ){
        case 'A':
            type = "Audio";
            break;
        case 'V':
            type = "Video";
            break;
        case 'M':
            type = "Microondas";
            break;
        case 'O':
            type = "Oficina";
            break;
        case 'D':
            type = "Domicilio";
            break;
    }
    $.post({
        url : "php/createTax.php",
        data : {
            "desc" : desc,
            "mo" : mo,
            "rev" : rev,
            "cat" : type
        },
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "-1"){
                swal("Error", data.error, "error");
            }else if( data.status == "-2"){
                swal("Error al insertar la nueva tarifa", "", "error");
            }else{
                swal("OK", "Tarifa ingresada correctamente", "success");
                $("#tax-desc").val("");
                $("#tax-mo").val("");
                $("#tax-rev").val("");
            }
        }
    });
}
function updateSvc( num ){
    var folio = $("#folio_td-" + num).val();
    var mo = $("#mo_td-" + num).val();
    var cas = $("#cas_td-" + num ).val();
    var desp = $("#desp_td-" + num ).val();
    var partes = $("#partes_td-" + num).val();
    var cobro = $("#cobro_td-" + num).val();
    console.log( folio + mo + cas + desp + partes + cobro );
    $.post({
        url : "php/updateSvc.php",
        data : {
            "folio" : folio,
            "mo" : mo,
            "cas" : cas,
            "desp" : desp,
            "partes" : partes,
            "cobro" : cobro
        },
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "-1" ){
                swal("Error", data.error, "error");
            }else if( data.status == "-2"){
                swal("Error", "al actualizar el folio", "error");
            }else{
                swal("OK", "Servicio actualizado correctamente", "success");
            }
        }
    });
}
function validateReport(){
    var folios = $("#desc-report-table-c .input[id^=\"folio_td-\"]");
    var partes = $("#desc-report-table-c .input[id^=\"partes_td-\"]");
    var svc_adv = new Array();
    var svc_err = new Array();
    $("#loading-icon-val").slideDown();
    for( var i = 0 ; i < folios.length ; i++ ){
        var valid = true;
        $.post({
            async : false, 
            data : { "folio" : $(folios[ i ]).val() },
            url : "php/getPartes.php",
            success : function( response ){
                var data = JSON.parse( response );
                if( data.status == "-1")
                    swal("Error", data.error, "error");
                else if( data.status == "-2")
                    swal("Error", "al leer la informacion de la base de datos", "error");
                else if( data.status == "-3")
                    swal("Error", "No existe el folio " + $(folios[ i ]).val() + " en la base de datos", "error");
                else if( data.status == "1" ){
                    var iva = $(partes[ i ]).val();
                    var dif = Math.abs( iva - Number( data.partes) ).toFixed(2);
                    if( dif < 50 & dif > 0 )
                        svc_adv.push({"folio" : $(folios[ i ]).val(), "partes_db" : data.partes, "partes" : iva, "dif" : dif });
                    else if( dif > 50 )
                        svc_err.push({"folio" : $(folios[ i ]).val(), "partes_db" : data.partes, "partes" : iva, "dif" : dif });
                }
            }
        });
    }
    if( svc_err.length == 0 && svc_adv.length == 0 )
        swal("OK", "Todos los servicios de cargo son correctos", "success");
    else{
        var html_adv = "";
        var html_err = "";
        if(svc_err.length == 0)
            var html_err = "<p>-- Ninguno --</p>";
        if( svc_adv.length == 0)
            var html_adv = "<p>-- Ninguna --</p>";
        //Errors
        for( var i = 0 ; i < svc_err.length ; i++ )
            html_err += ("<p><strong>Folio:</strong> " + svc_err[ i ].folio + ", <strong>partes (RP): </strong>$" + svc_err[ i ].partes + ",<strong> partes (BD):</strong> $" + svc_err[ i ].partes_db + ", <strong>diferencia: </strong>$" + svc_err[ i ].dif + "</p>");
        //Warnings
        for( var i = 0 ; i < svc_adv.length ; i++ )
            html_adv += ("<p><strong>Folio:</strong> " + svc_adv[ i ].folio + ", <strong>partes (RP):</strong> $" + svc_adv[ i ].partes + ", <strong>partes (BD):</strong> $" + svc_adv[ i ].partes_db + ", <strong>diferencia:</strong> $" + svc_adv[ i ].dif + "</p>");
        swal({
            title : "Se encontraron detalles en los siguientes servicios de cargo: ",
            text : "<h4><strong>Advertencias (Partes dentro del rango permitido):</strong></h4>" + html_adv + "<h4><strong>Errores (Partes fuera del rango permitido):</strong></h4>" + html_err,
            type : "warning",
            html : true
        });
    }
    $("#loading-icon-val").slideUp();
}
function uploadGSPN(){
    var file_data = $('#gspn-reg').prop('files')[0]; 
    $("#loading-icon-gspn").slideDown();
    $("#upload-gspn").hide();
    var formData = new FormData();
    formData.append( "file", file_data );
    $.ajax({
        url : "php/uploadGSPN.php",  //Server script to process data
        data: formData,
        dataType : "text",
        type: 'POST',
        //Ajax events
        success : function( response ){
            $("#loading-icon-gspn").slideUp();
            $("#upload-gspn").show();
            var data = JSON.parse( response );
            if( data.status == "-1" ){
                swal("Error", "al crear la conexión con la base de datos", "error");
            }else if( data.status == "-2"){
                swal("Error", "al almacenar la informacion en la base de datos", "error");
            }else if( data.status == "-3"){
                swal("Error", "al subir el archivo al servidor", "error");
            }else if( data.status == "-4"){
                swal("Error", "al leer la hoja de cálculo", "error");
            }else{
                swal("OK", "Base de datos actualizada correctamente", "success");
            }
            
        },
        // Form data
        //Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
    });
}
function uploadMaterial(){
    var file_data = $('#material').prop('files')[0]; 
    $("#loading-icon-mat").slideDown();
    $("#upload-mat").hide();
    var formData = new FormData();
    formData.append( "file", file_data );
    $.ajax({
        url : "php/updateMat.php",  //Server script to process data
        data: formData,
        dataType : "text",
        type: 'POST',
        //Ajax events
        success : function( response ){
            $("#loading-icon-mat").slideUp();
            $("#upload-mat").show();
            var data = JSON.parse( response );
            if( data.status == "-1" ){
                swal("Error", "al crear la conexión con la base de datos", "error");
            }else if( data.status == "-2"){
                swal("Error", "al almacenar la informacion en la base de datos", "error");
            }else if( data.status == "-3"){
                swal("Error", "al subir el archivo al servidor", "error");
            }else if( data.status == "-4"){
                swal("Error", "al leer la hoja de cálculo", "error");
            }else{
                swal("OK", "Base de datos actualizada correctamente", "success");
            }     
        },
        // Form data
        //Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
    });   
}
function showDTPanel(){
    $(".mid-panel").slideUp();
    $("#dwnld-tec-panel").slideDown();
    $.post({
        url : "php/getTecs.php",
        success : function( response ){
            var data = JSON.parse( response );
            if( data.status == "-1")
                swal("Error", data.error, "error");
            else if( data.status == "-2")
                swal("Error", "al leer  la información de la base de datos", "error");
            else if( data.status == "-3")
                swal("No hay técnicos registrados en el sistema", "", "warning");
            else{
                var select = $("#tecs");
                for( var i = 0 ; i < data.tec.length ; i++ ){
                    var option = $("<option></option>");
                    option.val(data.tec[ i ].idt);
                    option.text(data.tec[ i ].nom + " " + data.tec[ i ].ap);
                    select.append( option );
                }
            }
        }
    });
}
function getReportsEX(){
    var idt = $("#tecs").find(":selected").val();
    var name = $("#tecs").find(":selected").text();
    if( idt == "NONE")
        swal("Por favor selecciona un técnico", "", "warning");
    else{
        $.post({
            url : "php/getReportsEX.php",
            data : { "idt" : idt , "name" : name },
            success : function( response ){
                var data = JSON.parse( response );
                if( data.status == "-1")
                    swal("Error", data.error, "error");
                else if( data.status == "-2" )
                    swal("Error", "al leer la informacion de la base de datos", "error");
                else if( data.status == "1")
                    window.open( "php/" + data.url, "_blank");
            }
        });
    }
}