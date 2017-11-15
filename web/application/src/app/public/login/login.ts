import { Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginService } from './login.service';
import { DOCUMENT } from '@angular/platform-browser';
import { AlertToastComponent } from '../components/alert-toast/alert-toast';


@Component({
  templateUrl: './login.html',
  // styleUrls: ['./login.css'],
  providers: [RequestService, LoginService]
})

export class Login {
	usuario:string = '';
	contrasena:string = '';
	activeI=false;
	activeO=false;

	@ViewChild(AlertToastComponent) toast:AlertToastComponent;

	constructor(private serviceLogin: LoginService,
		private serviceRequest: RequestService,
		@Inject(DOCUMENT) private document: any,
		private router: Router) { }

	ngOnInit() {
		if (this.serviceLogin.validateSession()) {
			this.router.navigate(['form']);
		}

		this.document.body.classList.add('login')
	}

	login(){
		if (this.usuario == "" || this.usuario == undefined || this.contrasena == "" || this.contrasena == undefined) {
			this.toast.openToast("Datos incorrectos, por favor ingrese datos",null,5,null);
		}else{
			this.toast.openLoader();
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'login', usuario: this.usuario, contrasena: this.contrasena})
				.subscribe(
				(result) => {
					this.toast.closeLoader();
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.serviceLogin.setSession(result.data);
							this.router.navigate(['form']);
							break;
						case 2:
							this.toast.openToast("Usuario incorrecto, verifique sus datos",null,5,null);
							break;
						case 3:
							this.toast.openToast("Usuario incorrecto, verifique sus datos",null,5,null);
							break;
						case 4:
							this.toast.openToast("La encuesta ya se respondió correctamente",null,5,null);
							break;
					}
				},
				(error) =>  {
					this.toast.closeLoader();
					console.log(error)
				});
		}
	}
}
