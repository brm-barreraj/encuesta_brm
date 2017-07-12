import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginService } from '../login/login.service';

@Component({
  templateUrl: './form.html',
  styleUrls: ['./form.css']
})

export class Form {
	categorias:any = [];
	respuestas:Array<{idCategoria:number,idPregunta:number,puntaje:number}> = [];
	constructor(private serviceLogin: LoginService,
		private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
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

	votoPregunta(idCategoria, idPregunta, puntaje){
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

	enviarEncuesta(){
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
