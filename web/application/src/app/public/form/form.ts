import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginService } from '../login/login.service';

@Component({
  templateUrl: './form.html',
  // styleUrls: ['./form.css']
})

export class Form {
	categorias:any = [];
	catShow = 0;
	resShow = null;
	respuestas:Array<{idCategoria:number,idPregunta:number,puntaje:number}> = [];
	constructor(private serviceLogin: LoginService,
		private serviceRequest: RequestService,
		private router: Router,
		private elementRef: ElementRef) { }

	ngOnInit() {
		document.body.classList.remove('login')
		if (!this.serviceLogin.validateSession()) {
			this.router.navigate(['login']);
		}else{
			let idCuenta = this.serviceLogin.getSession().idCuenta;
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getPreguntas', idCuenta: idCuenta})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							alert("Ocurrió un error");
							break;
						case 1:
							this.categorias = result.data;
							break;
						case 2:
							alert("Usuario incorrecto");
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

	siguienteCat(idCategoria){
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

		if (!respCompletas) {
			alert("Por favor, responda todas las preguntas");
		}else if (this.catShow < this.categorias.length) {
			this.resShow = null;
			this.catShow++;
		}
	}

	votoPregunta(e,idCategoria, idPregunta, puntaje): void{
		let activo = e.toElement.parentNode.querySelectorAll('a.active');
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
			// Actualiza el pintaje si ya existe la respuesta
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

	enviarEncuesta(): void{
		let idUsuario = this.serviceLogin.getSession().id;
		this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'setEncuesta', idUsuario: idUsuario, respuestas: this.respuestas})
			.subscribe(
			(result) => {
				switch (result.error) {
					case 0:
						alert("Ocurrió un error");
						break;
					case 1:
						alert("Se ha insertado la encuesta correctamente");
						break;
					case 2:
						alert("Ya se ha respondido esta encuesta");
						break;
					
				}
			},
			(error) =>  {
				console.log(error)
			});
	}

}
