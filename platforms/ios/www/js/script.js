//var urlWS = "http://localhost/zombieapi";
var urlWS = "http://graphicsandcode.com/proyectos/zombieapi";

$(document).ready(function(){
	/* CAMBIAR AMBITO */
	$(document).on('click', '.cambiarambito', function(e){
		localStorage.removeItem('ambito');
		localStorage.setItem('ambito',$(this).attr('rel'));
		//input_ambito
	});
	/* SESION YA INICIADA */
	if(localStorage.getItem('auth')=='true'){
		mainView.loadPage('home.html');
	}
	/* INICIAR SESIÓN */
	$(document).on('click', '#btn_iniciar_sesion', function(e){
		$.ajax({
			headers: {
			    "email" : $('#input_email').val(),
			    "pass" : $('#input_pass').val()
			},
			url : urlWS+'/login',
			method : 'POST',
			beforeSend : function(){
				myApp.showIndicator();
			},
			success : function(data){
				localStorage.setItem('auth', true);
				localStorage.setItem('apikey', data[0].apikey);
				localStorage.setItem('userid', data[0].user_id);
				localStorage.setItem('avatar', data[0].avatar);
				localStorage.setItem('nombre', data[0].nombre);
				localStorage.setItem('paterno', data[0].paterno);
				localStorage.setItem('correo', data[0].correo);
				$('#contacto_nombre').val(localStorage.getItem('nombre')+" "+localStorage.getItem('paterno'));
				$('#contacto_email').val(localStorage.getItem('correo'));
				$('.avatar').attr('src',urlWS+'/'+localStorage.getItem('avatar'));
				$('.nombreusuario').html(localStorage.getItem('nombre')+' '+localStorage.getItem('paterno'));
				mainView.loadPage('home.html');
			},
			complete : function(data){
				myApp.hideIndicator();
			},
			error : function(data){
				myApp.alert('Usuario o contraseña incorrectos', '<i class="fa fa-exclamation-circle" aria-hidden="true" style="color:red"></i> Error');                 
			}
		})
	});
	/* CERRAR SESIÓN */
	$(document).on('click', '#btn_cerrar_sesion', function(e){
		localStorage.clear();
		mainView.loadPage('index.html');
	});
	$(document).on('click', '#login_facebook', function(e){
		facebookConnectPlugin.login(["email","public_profile"], function(response) 
        {
            if (response.authResponse) 
            {
            	//
            	facebookConnectPlugin.api('/me?fields=email,first_name,last_name,picture', ["email","public_profile"],function(response){
            		console.log(response);
            		var postData = {
						correo : response.email,
						nombre: response.first_name,
						paterno : response.last_name,
						imagen : response.picture.data.url
					}
					$.ajax({
						url : urlWS+'/registrofb',
						method : 'POST',
						beforeSend : function(){
							myApp.showIndicator();
						},
						data : postData,
						success : function(data){
							//console.log(data);
							if(data[0].auth==true){
								localStorage.setItem('auth', true);
								localStorage.setItem('apikey', data[0].apikey);
								localStorage.setItem('userid', data[0].user_id);
								localStorage.setItem('avatar', data[0].avatar);
								localStorage.setItem('nombre', data[0].nombre);
								localStorage.setItem('paterno', data[0].paterno);
								localStorage.setItem('correo', data[0].correo);
								$('#contacto_nombre').val(localStorage.getItem('nombre')+" "+localStorage.getItem('paterno'));
								$('#contacto_email').val(localStorage.getItem('correo'));
								$('.avatar').attr('src',localStorage.getItem('avatar'));
								$('.nombreusuario').html(localStorage.getItem('nombre')+' '+localStorage.getItem('paterno'));
								mainView.loadPage('home.html');
							}
						},
						complete : function(data){
							myApp.hideIndicator();
						},
						error : function(data){
							console.log(data);
							myApp.alert('Usuario o contraseña incorrectos', '<i class="fa fa-exclamation-circle" aria-hidden="true" style="color:red"></i> Error');                 
						}
					});
            	},function(error){
            		//console.log(error);
            		//alert(error);
            	})


            } else  {
                // user is not logged in
                alert('not logged');
            }
        });
		
	});
	/* INICIAR SESIÓN FB */
	/* 
	facebookConnectPlugin.login(["email","public_profile"], function(response) 
        {
            if (response.authResponse) 
            {
                alert('loged');
            } else  {
                // user is not logged in
                alert('not logged');
            }
        });
	*/
	/* AGREGAR META */
	$(document).on('click', '#btn_agregar_meta', function(e){
		ambito = localStorage.getItem('ambito');
		texto = $('#input_meta').val();
		if(texto == ''){
			myApp.alert('Todos los campos son necesarios', '<i class="fa fa-exclamation-circle" aria-hidden="true" style="color:red"></i> Error');                 
		}else{
			var postData = {
				id_usuario : localStorage.getItem('userid'),
				ambito: localStorage.getItem('ambito'),
				texto : $('#input_meta').val()
			}
			$.ajax({
				method : 'POST',
				url : urlWS+'/meta',
				headers: {
					"token": localStorage.getItem("apikey")
				},
				data : postData,
				beforeSend : function(){
					myApp.showIndicator();
				},
				success : function(data){
					//REFRESCAR METAS
					mainView.loadPage('metas.html?ambito='+ambito);
				},
				complete : function(data){
					myApp.hideIndicator();
				},
			});
		}
	});
	/* ELIMINAR META */
	$(document).on('click', '.borrameta', function(e){
		id_meta = $(this).attr('rel');
		myApp.confirm('¿Está seguro de querer eliminar?','', function () {
			eliminarMeta(id_meta,localStorage.getItem("ambito"));
	    });
		//input_ambito
	});
	/* EDITAR META */
	$(document).on('click', '#btn_editar_meta', function(e){
		ambito = localStorage.getItem('ambito');
		id_meta = $('#id_meta').val();
		texto_meta = $('#input_meta').val();
		var postData = {
			texto : texto_meta
		}
		$.ajax({
			method : 'POST',
			url : urlWS+'/meta/'+id_meta,
			headers: {
				"token": localStorage.getItem("apikey")
			},
			data : postData,
			beforeSend : function(){
				myApp.showIndicator();
			},
			success : function(data){
				mainView.reloadPreviousPage('metas.html?ambito='+ambito);
				mainView.back();

			},
			complete : function(data){
				myApp.hideIndicator();
			}
		})
	});

	/* AGREGAR TAREA */
	$(document).on('click', '#btn_agregar_tarea', function(e){
		texto = $('#input_tarea').val();
		if(texto == ''){
			myApp.alert('Todos los campos son necesarios', '<i class="fa fa-exclamation-circle" aria-hidden="true" style="color:red"></i> Error');                 
		}else{
			var postData = {
				id_usuario : localStorage.getItem('userid'),
				id_meta : $('#id_meta').val(),
				ambito: localStorage.getItem('ambito'),
				texto : texto
			}
			$.ajax({
				method : 'POST',
				url : urlWS+'/tarea',
				headers: {
					"token": localStorage.getItem("apikey")
				},
				data : postData,
				beforeSend : function(){
					myApp.showIndicator();
				},
				success : function(data){
					//REFRESCAR METAS
					mainView.loadPage('tareas.html?id_meta='+ $('#id_meta').val());
				},
				complete : function(data){
					myApp.hideIndicator();
				},
			});
		}
	});
	/* ELIMINAR TAREA */
	$(document).on('click', '.borrartarea', function(e){
		id_tarea = $(this).attr('rel');
		myApp.confirm('¿Está seguro de querer eliminar?','', function () {
			eliminarTarea(id_tarea,$('#valor_id_meta').val());
	    });
		//input_ambito
	});

	/* EDITAR META */
	$(document).on('click', '#btn_editar_tarea', function(e){
		ambito = localStorage.getItem('ambito');
		id_tarea = $('#id_tarea').val();
		id_meta = $('#id_meta').val();
		texto_tarea = $('#input_tarea').val();
		var postData = {
			texto : texto_tarea
		}
		$.ajax({
			method : 'POST',
			url : urlWS+'/tarea/'+id_tarea,
			headers: {
				"token": localStorage.getItem("apikey")
			},
			data : postData,
			beforeSend : function(){
				myApp.showIndicator();
			},
			success : function(data){
				mainView.loadPage('tareas.html?id_meta='+ $('#id_meta').val());
			},
			complete : function(data){
				myApp.hideIndicator();
			}
		})
	});

	/* CUMPLIR TAREA */
	$(document).on('click', '.cumplir_tarea', function(e){
		//console.log('cumplir')
		id_tarea =  $(this).attr('rel');
		status =  $(this).attr('status');
		var postData = {
			id_tarea : id_tarea,
			status : status
		}
		$.ajax({
			method : 'POST',
			url : urlWS+'/revision',
			headers: {
				"token": localStorage.getItem("apikey")
			},
			data : postData,
			beforeSend : function(){
				myApp.showIndicator();
			},
			success : function(data){
				mainView.reloadPage('cumpli-metas.html');
			},
			complete : function(data){
				myApp.hideIndicator();
			}
		})
	});

	/* NO CUMPLIR TAREA */
	$(document).on('click', '.no_cumplir_tarea', function(e){
		//console.log('cumplir')
		id_tarea =  $(this).attr('rel');
		status =  $(this).attr('status');
		var postData = {
			id_tarea : id_tarea,
			status : status
		}
		$.ajax({
			method : 'POST',
			url : urlWS+'/revision',
			headers: {
				"token": localStorage.getItem("apikey")
			},
			data : postData,
			beforeSend : function(){
				myApp.showIndicator();
			},
			success : function(data){
				mainView.reloadPage('cumpli-metas.html');	
			},
			complete : function(data){
				myApp.hideIndicator();
			}
		})
	});

	/* SALUD FINANCIERA */
	$(document).on('click', '#btn_calcular_salud', function(e){
		var fijos = 0;
		$('.fijos').each(function(){
			valor = $(this).val();
			if(valor==''){
				valor = 0;
			}
		    fijos += parseFloat(valor);
		});
		var variables = 0;
		$('.variables').each(function(){
			valor = $(this).val();
			if(valor==''){
				valor = 0;
			}
		    variables += parseFloat(valor);
		});
		var egresos = 0;
		$('.egresos').each(function(){
			valor = $(this).val();
			if(valor==''){
				valor = 0;
			}
		    egresos += parseFloat(valor);
		});

		$('#fijos').html(fijos);
		$('#variables').html(variables);
		$('#egresos').html(egresos);
		$('#ahorro').html((fijos+variables)-egresos);

		localStorage.setItem("fijos-enero",$( "#fijos-enero").val());
		localStorage.setItem("fijos-febrero",$( "#fijos-febrero").val());
		localStorage.setItem("fijos-marzo",$( "#fijos-marzo").val());
		localStorage.setItem("fijos-abril",$( "#fijos-abril").val());
		localStorage.setItem("fijos-mayo",$( "#fijos-mayo").val());
		localStorage.setItem("fijos-junio",$( "#fijos-junio").val());
		localStorage.setItem("fijos-julio",$( "#fijos-julio").val());
		localStorage.setItem("fijos-agosto",$( "#fijos-agosto").val());
		localStorage.setItem("fijos-septiembre",$( "#fijos-septiembre").val());
		localStorage.setItem("fijos-octubre",$( "#fijos-octubre").val());
		localStorage.setItem("fijos-noviembre",$( "#fijos-noviembre").val());
		localStorage.setItem("fijos-diciembre",$( "#fijos-diciembre").val());

		localStorage.setItem("variables-enero",$( "#variables-enero").val());
		localStorage.setItem("variables-febrero",$( "#variables-febrero").val());
		localStorage.setItem("variables-marzo",$( "#variables-marzo").val());
		localStorage.setItem("variables-abril",$( "#variables-abril").val());
		localStorage.setItem("variables-mayo",$( "#variables-mayo").val());
		localStorage.setItem("variables-junio",$( "#variables-junio").val());
		localStorage.setItem("variables-julio",$( "#variables-julio").val());
		localStorage.setItem("variables-agosto",$( "#variables-agosto").val());
		localStorage.setItem("variables-septiembre",$( "#variables-septiembre").val());
		localStorage.setItem("variables-octubre",$( "#variables-octubre").val());
		localStorage.setItem("variables-noviembre",$( "#variables-noviembre").val());
		localStorage.setItem("variables-diciembre",$( "#variables-diciembre").val());

		localStorage.setItem("egresos-enero",$( "#egresos-enero").val());
		localStorage.setItem("egresos-febrero",$( "#egresos-febrero").val());
		localStorage.setItem("egresos-marzo",$( "#egresos-marzo").val());
		localStorage.setItem("egresos-abril",$( "#egresos-abril").val());
		localStorage.setItem("egresos-mayo",$( "#egresos-mayo").val());
		localStorage.setItem("egresos-junio",$( "#egresos-junio").val());
		localStorage.setItem("egresos-julio",$( "#egresos-julio").val());
		localStorage.setItem("egresos-agosto",$( "#egresos-agosto").val());
		localStorage.setItem("egresos-septiembre",$( "#egresos-septiembre").val());
		localStorage.setItem("egresos-octubre",$( "#egresos-octubre").val());
		localStorage.setItem("egresos-noviembre",$( "#egresos-noviembre").val());
		localStorage.setItem("egresos-diciembre",$( "#egresos-diciembre").val());
	});

	$(document).on('click', '.confirm-title-ok-cancel', function(e){
		myApp.confirm('¿Está seguro de querer eliminar todas las alarmas?', 'Si hace click en ok se eliminarán', 
	      function () {
	      	$.ajax({
	      		type: 'DELETE',
				url : urlWS+'/alarmas/'+localStorage.getItem('userid'),
				headers: {
					"token": localStorage.getItem("apikey")
				},
				beforeSend : function(){
					myApp.showIndicator();
				},
				success : function(data){
					refrescarAlarmas();
					cancelarTodasLasAlarmas();
				},
				complete : function(data){
					myApp.hideIndicator();
				}
			});
	      },
	      function () {
	        return false;
	      }
	    );
	});
	$(document).on('click', '#btn_agregar_alarma', function(e){
		if($('#input_texto').val() == '' || $('#calendar-default').val()=='' || $('#hora_alarma').val()==''){
			myApp.alert('Todos los campos son necesarios', '<i class="fa fa-exclamation-circle" aria-hidden="true" style="color:red"></i> Error');                 
		}else{
			var postData = {
				id_usuario : localStorage.getItem('userid'),
				texto: $('#input_texto').val(),
				repetir : $('#input_repetir').val(),
				fecha : $('#calendar-default').val()+' '+$('#hora_alarma').val()
			}
			$.ajax({
				method : 'POST',
				url : urlWS+'/alarma',
				headers: {
					"token": localStorage.getItem("apikey")
				},
				data : postData,
				beforeSend : function(){
					myApp.showIndicator();
				},
				success : function(data){
					//REFRESCAR METAS
					mainView.loadPage('recordatorios.html');
					id_alarma = parseInt(data.id);
					fecha = $('#calendar-default').val();
					fecha =  fecha.split("-");
					year = fecha[0];
					month = fecha[1];
					month = month-1;
					day = fecha[2];
					hora = $('#hora_alarma').val();
					hora = hora.split(":");
					hours =hora[0];
					minutes = hora[1];
					fecha = new Date(year, month, day, hours, minutes);
					repetir = $('#input_repetir').val();
					agendarAlarma(id_alarma,fecha,postData.texto,repetir);
					/*
					alert(fecha);
					alert(id_alarma);
					alert(postData.texto);
					*/
					//agendarAlarma();
				},
				complete : function(data){
					myApp.hideIndicator();
				},
			});
		}
	});
	$(document).on('click', '.borraralarma', function(e){
		id_alarma = $(this).attr('rel');
		myApp.confirm('¿Está seguro de querer eliminar?','', function () {
			eliminarAlarma(id_alarma);
			cancelarAlarma(id_alarma);
	    });
	});
	$(document).on('click', '#btn_enviar_mensaje', function(e){
		var postData = {
			contacto_nombre : $('#contacto_nombre').val(),
			contacto_email : $('#contacto_email').val(),
			contacto_tema : $('#contacto_tema').val(),
			contacto_telefono : $('#contacto_telefono').val(),
			contacto_mensaje : $('#contacto_mensaje').val()
		}
		$.ajax({
			method : 'POST',
			url : urlWS+'/contacto',
			headers: {
				"token": localStorage.getItem("apikey")
			},
			data : postData,
			beforeSend : function(){
				myApp.showIndicator();
			},
			success : function(data){
				console.log(data);
				myApp.alert('El mensaje fue enviado correctamente', '<i class="fa fa-exclamation-circle" aria-hidden="true" style="color:green"></i> Éxito');                 

			},
			complete : function(data){
				myApp.hideIndicator();
			},
		});
	});
	$(document).on('click', '.regresartodoadd', function(e){
		console.log(localStorage.getItem("ambito"));
		mainView.loadPage('metas.html?ambito='+localStorage.getItem("ambito"));
	});
	
});

function refrescarMetas(ambito){
	$.ajax({
		url : urlWS+'/metas/'+localStorage.getItem('userid')+'/'+ambito,
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			$('#list_metas').html('');
			var output = '';
			$.each( data, function( key, value ) {
				output += '<li class="swipeout primarystatus"><div class="item-content swipeout-content"><a class="item-content item-link" href="tareas.html?id_meta='+value.id+'"><div class="item-media"><i class="fa fa-trophy" aria-hidden="true"></i></div><div class="item-inner"><div class="item-title-row"><div class="item-title">'+value.texto+'</div></div></div></a></div><div class="swipeout-actions-right"><a href="#" class="borrar borrameta" rel="'+value.id+'" >Eliminar</a><a href="editar-meta.html?id_meta='+value.id+'" class="swipeout-update editarmeta"  rel="'+value.id+'">Editar</a></div></li>';
			})
			$('#list_metas').html(output);
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
}

function refrescarAlarmas(){
	$.ajax({
		url : urlWS+'/alarmas/'+localStorage.getItem('userid'),
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			$('#list_recordatorios').html('');
			var output = '';
			$.each( data, function( key, value ) {
				output += '<li class="swipeout primarystatus"><div class="item-content swipeout-content"><!--<a class="item-content item-link" href="tareas.html?id_meta='+value.id+'">--><div class="item-media"><i class="fa fa-clock-o" aria-hidden="true"></i></div><div class="item-inner"><div class="item-title-row"><div class="item-title">'+value.texto+'</div></div></div><!--</a>--></div><div class="swipeout-actions-right"><a href="#" class="borrar borraralarma" rel="'+value.id+'" >Eliminar</a><!--<a href="editar-meta.html?id_meta='+value.id+'" class="swipeout-update editarmeta"  rel="'+value.id+'">Editar</a>--></div></li>';
			})
			$('#list_recordatorios').html(output);
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
}

function eliminarMeta(id,ambito){
	$.ajax({
		url : urlWS+'/meta/'+id,
		type: 'DELETE',
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			mainView.reloadPage('metas.html?ambito='+ambito);
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
}

function eliminarTarea(id,id_meta){
	$.ajax({
		url : urlWS+'/tarea/'+id,
		type: 'DELETE',
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			mainView.reloadPage('tareas.html?id_meta='+id_meta);
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
}


function eliminarAlarma(id){
	$.ajax({
		url : urlWS+'/alarma/'+id,
		type: 'DELETE',
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			mainView.reloadPage('recordatorios.html');
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
}

function refrescarTareas(id){
	$.ajax({
		url : urlWS+'/tareas/'+id,
		type: 'GET',
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			$('#list_metas').html('');
			var output = '';
			$.each( data, function( key, value ) {
				output += '<li class="swipeout primarystatus"><div class="item-content swipeout-content"><div class="item-media"><i class="fa fa-trophy" aria-hidden="true"></i></div><div class="item-inner"><div class="item-title-row"><div class="item-title">'+value.texto+'</div></div></div></div><div class="swipeout-actions-right"><a href="#" class="borrar borrartarea" rel="'+value.id+'" rel_id_meta="" >Eliminar</a><a href="editar-tarea.html?id_tarea='+value.id+'&id_meta='+$('#valor_id_meta').val()+'" class="swipeout-update editarmeta"  rel="'+value.id+'">Editar</a></div></li>';
			})
			$('#list_tareas').html(output);
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
}

myApp.onPageInit('metas', function (page) {
	refrescarMetas(page.query.ambito);
});   


myApp.onPageInit('tareas', function (page) {
	refrescarTareas(page.query.id_meta);
	$('#valor_id_meta').val(page.query.id_meta);
	$('.borrartarea').attr('rel_id_meta',page.query.id_meta);
	$('#boton_nueva_tarea').attr('href','tareaadd.html?id_meta='+page.query.id_meta);
	$('#atras_tarea').attr('href','metas.html?ambito='+localStorage.getItem("ambito"));
});  
myApp.onPageInit('tareaadd', function (page) {
	$('#id_meta').val(page.query.id_meta)
});   


myApp.onPageInit('editar-meta', function (page) {
	id_meta = page.query.id_meta;
	$.ajax({
		url : urlWS+'/meta/'+id_meta,
		type: 'GET',
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			$('#id_meta').val(data[0].id);
			$('#input_meta').val(data[0].texto);
			//mainView.reloadPage(ambito+'.html');
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
});  

myApp.onPageInit('editar-tarea', function (page) {
	id_tarea = page.query.id_tarea;
	id_meta = page.query.id_meta;
	$('#id_meta').val(id_meta);
	$.ajax({
		url : urlWS+'/tarea/'+id_tarea,
		type: 'GET',
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			$('#id_tarea').val(data[0].id);
			$('#input_tarea').val(data[0].texto);
			//mainView.reloadPage(ambito+'.html');
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
});   

myApp.onPageInit('cumplimetas', function (page) {
	id_usuario = localStorage.getItem('userid');
	$.ajax({
		url : urlWS+'/todas_tareas/'+id_usuario,
		type: 'GET',
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			var output = ''; 
			var pintar = 0;
			$.each( data, function( key, value ) {
				if(value.meta!='' && value.tareas!=''){
					output += '<li>'+value.meta.texto+':</li>';
					var tareas = value.tareas;
					$.each( tareas, function( key2, value2 ) {
						output += ' <li class="conteo_quitar"><a href="#" class="no_cumplir_tarea" rel="'+value2.id+'" status="0"><i class="fa fa-times-circle-o" aria-hidden="true"></i></a><a href="#" class="cumplir_tarea"  rel="'+value2.id+'" status="1"><i class="fa fa-check-circle-o" aria-hidden="true"></i></a>'+value2.texto+'</li>'
					})
				}
			});
			$.each( data, function( key, value ) {
				if(value.meta!='' && value.tareas!=''){
					pintar = 1;
					return false;
				}
			});	
			if(pintar==0){
				$('#lista_cumplir').html('<li>No hay más tareas el día de hoy</li>');
			}else{
				$('#lista_cumplir').html(output);
			}
			//console.log(data);
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
});   

myApp.onPageInit('avances', function (page) {
	id_usuario = localStorage.getItem('userid');
	$.ajax({
		url : urlWS+'/avances/'+id_usuario,
		type: 'GET',
		headers: {
			"token": localStorage.getItem("apikey")
		},
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			var cont = 0;
			var output = '';
			// <div id="gauge" class="200x160px"></div>
			$.each( data, function( key, value ) {
				output += '<div class="card col-100 tablet-50"><div class="card-content"> <div id="gauge'+cont+'" class="200x160px"></div></div></div>';
				cont++;
			});
			$('#contenedoravances').html(output);
			for (i = 0; i < cont; i++) { 
				valor = data[i].porcentaje;
				meta = data[i].meta; 
				valor = valor.replace('%','');
				var g = new JustGage({
					id: "gauge"+i,
					value: Math.ceil(valor),
					min: 0,
					max: 100,
					title: meta
				});
			}
		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
});   

myApp.onPageInit('salud-financiera', function (page) {

		$( "#fijos-enero").val(localStorage.getItem("fijos-enero"));
		$( "#fijos-febrero").val(localStorage.getItem("fijos-febrero"));
		$( "#fijos-marzo").val(localStorage.getItem("fijos-marzo"));
		$( "#fijos-abril").val(localStorage.getItem("fijos-abril"));
		$( "#fijos-mayo").val(localStorage.getItem("fijos-mayo"));
		$( "#fijos-junio").val(localStorage.getItem("fijos-junio"));
		$( "#fijos-julio").val(localStorage.getItem("fijos-julio"));
		$( "#fijos-agosto").val(localStorage.getItem("fijos-agosto"));
		$( "#fijos-septiembre").val(localStorage.getItem("fijos-septiembre"));
		$( "#fijos-octubre").val(localStorage.getItem("fijos-octubre"));
		$( "#fijos-noviembre").val(localStorage.getItem("fijos-noviembre"));
		$( "#fijos-diciembre").val(localStorage.getItem("fijos-diciembre"));

		$( "#variables-enero").val(localStorage.getItem("variables-enero"));
		$( "#variables-febrero").val(localStorage.getItem("variables-febrero"));
		$( "#variables-marzo").val(localStorage.getItem("variables-marzo"));
		$( "#variables-abril").val(localStorage.getItem("variables-abril"));
		$( "#variables-mayo").val(localStorage.getItem("variables-mayo"));
		$( "#variables-junio").val(localStorage.getItem("variables-junio"));
		$( "#variables-julio").val(localStorage.getItem("variables-julio"));
		$( "#variables-agosto").val(localStorage.getItem("variables-agosto"));
		$( "#variables-septiembre").val(localStorage.getItem("variables-septiembre"));
		$( "#variables-octubre").val(localStorage.getItem("variables-octubre"));
		$( "#variables-noviembre").val(localStorage.getItem("variables-noviembre"));
		$( "#variables-diciembre").val(localStorage.getItem("variables-diciembre"));
		
		$( "#egresos-enero").val(localStorage.getItem("egresos-enero"));
		$( "#egresos-febrero").val(localStorage.getItem("egresos-febrero"));
		$( "#egresos-marzo").val(localStorage.getItem("egresos-marzo"));
		$( "#egresos-abril").val(localStorage.getItem("egresos-abril"));
		$( "#egresos-mayo").val(localStorage.getItem("egresos-mayo"));
		$( "#egresos-junio").val(localStorage.getItem("egresos-junio"));
		$( "#egresos-julio").val(localStorage.getItem("egresos-julio"));
		$( "#egresos-agosto").val(localStorage.getItem("egresos-agosto"));
		$( "#egresos-septiembre").val(localStorage.getItem("egresos-septiembre"));
		$( "#egresos-octubre").val(localStorage.getItem("egresos-octubre"));
		$( "#egresos-noviembre").val(localStorage.getItem("egresos-noviembre"));
		$( "#egresos-diciembre").val(localStorage.getItem("egresos-diciembre"));
});   

myApp.onPageInit('recordatorios', function (page) {
	refrescarAlarmas();
});   
myApp.onPageInit('alarmaadd', function (page) {
	var calendarDefault = myApp.calendar({
	    input: '#calendar-default',
	}); 
	$('#hora_alarma').timeDropper({
		format : 'H:mm'
	});
});   

myApp.onPageInit('home', function (page) {
	$('.avatar').attr('src',urlWS+'/'+localStorage.getItem('avatar'));
	$('.nombreusuario').html(localStorage.getItem('nombre')+' '+localStorage.getItem('paterno'));
	$.ajax({
		url : urlWS+'/mensajes',
		type: 'GET',
		beforeSend : function(){
			myApp.showIndicator();
		},
		success : function(data){
			$('#q1autor').html(data[0].autor);
			$('#q2autor').html(data[1].autor);
			$('#q3autor').html(data[2].autor);

			$('#q1texto').html(data[0].texto);
			$('#q2texto').html(data[1].texto);
			$('#q3texto').html(data[2].texto);

		},
		complete : function(data){
			myApp.hideIndicator();
		}
	})
});   
  

