
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
                    btn.attr("onclick", "checkReport(" + i + ")" );
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
