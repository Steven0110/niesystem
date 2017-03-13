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
    $("#login-action").click(function(){
        if( validateFields() == true ){
            var rfc = $("#rfc").val();
            var psw = $("#psw").val();
            $.post({
                url : "php/login.php",
                data : { "user" : rfc, "psw" : psw },
                success : function( response ){
                    console.log( response );
                    var data = JSON.parse( response );
                    if( data.status == "1" ){
                        swal({
                            title : "Datos correctos",
                            type : "success",
                            text : "Bienvenido " + data.nombre
                        }, function(){
                            var person = {"name" : data.nombre, "rfc" : data.rfc, "idt" : data.idt };
                            $.cookie( "usuario", JSON.stringify( person ) );
                            if( data.tipo == "TEC" )
                                location.href = "tecnicos.html";
                            else if( data.tipo == "DIR" )
                                location.href = "admin.html";

                        });
                    }else if( data.status == "0" ){
                        swal({
                            title : "Datos incorrectos",
                            type : "warning",
                            text : "Recuerda que tu usuario y contraseña son tu RFC"
                        });
                    }else{
                        swal({
                            title : "Error desconocido",
                            type : "warning",
                            text : data.error
                        });
                    }
                }
            });
        }
    });
});

function validateFields(){
    if( $("#psw").val() == "" || $("#rfc").val() == "" ){
        swal({
            title : "Cuidado",
            type : "warning",
            text : "Debes llenar todos los campos"
        });
        return false;
    }else{
        return true;
    }
}

function isIE(){
    var user_agent = window.navigator.userAgent;
    var version = Number( user_agent.indexOf("MSIE ") );
    if( version > 0 && version < 9 ){
        return false;
    }else return true;
}