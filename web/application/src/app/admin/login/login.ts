import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from './login.service';



@Component({
  templateUrl: './login.html',
  // styleUrls: ['./login.css'],
  providers: [RequestService, LoginAdminService]
})

export class AdminLogin {
	usuario:string = '';
	contrasena:string = '';
	activeI=false;
	activeO=false;

	constructor(private serviceLogin: LoginAdminService,
		private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
		if (this.serviceLogin.validateSession()) {
			this.router.navigate(['form']);
		}

		document.body.classList.add('login')
	}

	login(){
		this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'login', usuario: this.usuario, contrasena: this.contrasena})
			.subscribe(
			(result) => {
				switch (result.error) {
					case 0:
						alert("Ocurrió un error");
						break;
					case 1:
						this.serviceLogin.setSession(result.data);
						this.router.navigate(['form']);
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
