import { Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from './login.service';
import { DOCUMENT } from '@angular/platform-browser';
import { AlertToastComponent } from '../components/alert-toast/alert-toast';


@Component({
  templateUrl: './login.html',
  // styleUrls: ['./login.css'],
  providers: [RequestService, LoginAdminService]
})

export class AdminLogin {
	correo:string = '';
	contrasena:string = '';
	activeI=false;
	activeO=false;

	@ViewChild(AlertToastComponent) toast:AlertToastComponent;

	constructor(private serviceLogin: LoginAdminService,
		private serviceRequest: RequestService,
		@Inject(DOCUMENT) private document: any,
		private router: Router) { }

	ngOnInit() {
		if (this.serviceLogin.validateSession()) {
			this.router.navigate(['admin/dashboard']);
		}

		this.document.body.classList.add('login');

		// console.log('el body' + this.document.body)
	}

	login(){
		if (this.correo == "" || this.correo == undefined || this.contrasena == "" || this.contrasena == undefined) {
			this.toast.openToast("Datos incorrectos, por favor ingrese datos",null,5);
		}else{
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'loginAdmin', correo: this.correo, contrasena: this.contrasena})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.serviceLogin.setSession(result.data);
							this.router.navigate(['admin/dashboard']);
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
	toggleFixed(){
		this.document.body.classList.add('login-active');
	}
}
