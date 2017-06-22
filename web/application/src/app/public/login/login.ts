import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginService } from './login.service';



@Component({
  templateUrl: './login.html',
  // styleUrls: ['./login.css'],
  providers: [RequestService, LoginService]
})

export class Login {
	usuario:string = '';
	contrasena:string = '';

	constructor(private serviceLogin: LoginService,
		private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
		if (this.serviceLogin.validateSession()) {
			this.router.navigate(['form']);
		}
	}

	login(){
		this.serviceRequest.post('http://127.0.0.1/encuestas_brm/web/server/app.php', { accion: 'login', usuario: this.usuario, contrasena: this.contrasena})
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
