import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';

import { RequestService } from '../../app.request';
import { LoginService } from '../login/login.service';
import { AlertToastComponent } from '../components/alert-toast/alert-toast';


@Component({
	templateUrl: './form.html',
  // styleUrls: ['./form.css'],
})

export class Form {
	categorias:any = [];
	catShow = 0;
	resShow = null;
	nombreUsuario = null;
	dataSesssion = null;
	respuestas:Array<{idCategoria:number,idPregunta:number,puntaje:number}> = [];
	comentarios:Array<{idCategoria:number,texto:string}> = [];
	comentario:Array<any> = [];

	@ViewChild(AlertToastComponent) toast:AlertToastComponent;

	constructor(private serviceLogin: LoginService,
		private serviceRequest: RequestService,
		private router: Router,
		@Inject(DOCUMENT) private document: any,
		private elementRef: ElementRef) { }

	ngOnInit() {
		this.document.body.classList.remove('login');
		this.dataSesssion = this.serviceLogin.getSession();
		if (!this.serviceLogin.validateSession()) {
			this.router.navigate(['login']);
		}else{
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getPreguntas', idCuenta: this.dataSesssion.idCuenta})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.categorias = result.data;
							break;
						case 2:
							this.toast.openToast("Usuario incorrecto",null,5,null);
							break;
						
					}
				},
				(error) =>  {
					console.log(error)
				});
		}
	}

	showRespuesta(idPregunta): void{
		document.querySelector('.resp-'+idPregunta).classList.add('active');
	}

	volverCat(){
		if (this.catShow > 0) {
			this.resShow = null;
			this.catShow--;
		}
	}

	validarRespuestas(idCategoria){
		let tempPreg = document.querySelectorAll(".cat-"+idCategoria+" > .pregunta");
		let respCompletas = true;
		let respuestaEsta = false;
		// Recorre todas las preguntas
		for(let i = 0; i < tempPreg.length;i++){
			respuestaEsta = false;
			// Valida que la respuesta de la pregunta este
			for(let j = 0; j < this.respuestas.length;j++){
				if (this.respuestas[j].idPregunta == parseInt(tempPreg[i].id)) {
					respuestaEsta = true;
					break;
				}
			}
			if (!respuestaEsta) {
				respCompletas = false;
				break;
			}
		}
		return respCompletas;
	}

	siguienteCat(idCategoria){
		let respCompletas = this.validarRespuestas(idCategoria);
		if (!respCompletas) {
			this.toast.openToast("Por favor, responda todas las preguntas",null,5,null);
		}else if (this.catShow < this.categorias.length) {
			this.resShow = null;
			this.catShow++;
			document.body.scrollTop = 0;
		}
	}

	guardarComentario(idCategoria,comentario){
		if (comentario!="" && comentario!=undefined) {
			let key = -1;
			// Valida si la respuesta ya existe
			if (this.comentarios.length > 0) {
				for (var i = 0; i < this.comentarios.length; ++i) {
					if (this.comentarios[i].idCategoria == idCategoria) {
						key = i;
						break;
					}
				}
			}

			if (key >= 0) {
				// Actualiza el comentario si ya existe
				this.comentarios[key].texto = comentario;
			}else{
				// Crea un nuevo comentario si no existe
				this.comentarios.push({
					idCategoria:idCategoria,
					texto:comentario
				});
			}
			console.log(this.comentarios,"comentarios");
		}
	}

	votoPregunta(e,idCategoria, idPregunta, puntaje): void{
		let activo = e.target.parentNode.querySelectorAll('a.active');
		let resp = document.querySelector('.resp-'+idPregunta).classList;
		let restTitle = document.querySelector('.respTitle-'+idPregunta);

		// Quitamos el div de respuestas
		setTimeout(function(){
			resp.remove('active');
			switch (puntaje) {
		    	case 0:
		    		restTitle.innerHTML = "N/A";
		    		break;
		    	case 1:
		    		restTitle.innerHTML = "Malo";
		    		break;
		    	case 2:
		    		restTitle.innerHTML = "Regular";
		    		break;

		    	case 3:
		    		restTitle.innerHTML = "Bueno";
		    		break;

		    	case 4:
		    		restTitle.innerHTML = "Excelente";
		    		break;
		    }
	    },300);

		if(activo.length > 0){
			for(let x = 0; x < activo.length; x ++){
				activo[x].classList.remove('active')
			}
		};

		e.target.classList.add('active');

		let key = -1;
		// Valida si la respuesta ya existe
		if (this.respuestas.length > 0) {
			for (var i = 0; i < this.respuestas.length; ++i) {
				if (this.respuestas[i].idCategoria == idCategoria && this.respuestas[i].idPregunta == idPregunta) {
					key = i;
					break;
				}
			}
		}

		if (key >= 0) {
			// Actualiza el puntaje si ya existe la respuesta
			this.respuestas[key].puntaje = puntaje;
		}else{
			// Crea una nueva respuesta si no existe
			this.respuestas.push({
				idCategoria:idCategoria,
				idPregunta:idPregunta,
				puntaje:puntaje
			});
		}
		console.log(this.respuestas,"this.respuestas");
	}

	enviarEncuesta(idCategoria): void{
		let respCompletas = this.validarRespuestas(idCategoria);
		if (!respCompletas) {
			this.toast.openToast("Por favor, responda todas las preguntas",null,5,null);
		}else if (this.catShow < this.categorias.length) {
			let idUsuario = this.serviceLogin.getSession().id;
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'setEncuesta', idUsuario: idUsuario, respuestas: JSON.stringify(this.respuestas), comentarios: JSON.stringify(this.comentarios)})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.toast.openToast("Se ha insertado la encuesta correctamente",null,5,()=>{
								this.serviceLogin.deleteSession();
    							this.router.navigate(['login']);
							});
							
							break;
						case 2:
							this.toast.openToast("Ya se ha respondido esta encuesta",null,5,null);
							break;
						
					}
				},
				(error) =>  {
					console.log(error)
				});
		}
	}

}
