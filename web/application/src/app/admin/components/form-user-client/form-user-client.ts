import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../../app.request';
import { LoginAdminService } from '../../login/login.service';

@Component({
	selector: 'form-user-client',
	templateUrl: './form-user-client.html',
})
export class FormUserClientComponent {
	@Input() idUser;
	@Input() idClient;
	user:any = {id:'',contrasena:''};

	constructor(private serviceLoginAdmin: LoginAdminService,
		private route: ActivatedRoute,
		private serviceRequest: RequestService,
		private router: Router){
	}

	ngOnInit() {
		if (this.idUser != null) {
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getAdminUsuario', idUsuario: this.idUser})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							alert("Ocurrió un error");
							break;
						case 1:
							this.user = result.data;
							break;
						case 2:
							alert("Usuario incorrecto");
							break;
					}
				},
				(error) =>  {
					console.log(error)
				});
		}else{
			this.idClient = '';
		}
	}

	setUser(){
		let dataAdmin = this.serviceLoginAdmin.getSession();
		this.user.idAdmin = dataAdmin.id;
		this.user.idCuenta = this.idClient;
		this.user.accion = 'setAdminUsuario';
		this.serviceRequest.post('https://enc.brm.co/app.php', this.user)
			.subscribe(
			(result) => {
				switch (result.error) {
					case 0:
						alert("Ocurrió un error");
						break;
					case 1:
						if (this.idUser != '') {
							alert("Actualizó correctamente al usuario");
						}else{
							alert("Agregó correctamente al usuario");
						}
						this.router.navigate(['admin/clients']);
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