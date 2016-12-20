$(document).ready(function(){

    if($.cookie("usuario"))
        location.href = "tecnicos.html";
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
