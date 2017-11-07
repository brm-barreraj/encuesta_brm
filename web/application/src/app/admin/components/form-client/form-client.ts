import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../../app.request';
import { LoginAdminService } from '../../login/login.service';

@Component({
	selector: 'form-client',
	templateUrl: './form-client.html',
})
export class FormClientComponent {
	@Input() idClient;
	client:any = [];

	constructor(private serviceLoginAdmin: LoginAdminService,
		private route: ActivatedRoute,
		private serviceRequest: RequestService,
		private router: Router){
	}

	ngOnInit() {
		if (this.idClient != null) {
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getAdminCliente', idCuenta: this.idClient})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							alert("Ocurrió un error");
							break;
						case 1:
							this.client = result.data;
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

	setClient(){
		let user = this.serviceLoginAdmin.getSession();
		this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'setAdminCliente', idCuenta: this.idClient, nombre: this.client.nombre, imagen: this.client.imagen, color: this.client.color, idAdmin: user.id})
			.subscribe(
			(result) => {
				switch (result.error) {
					case 0:
						alert("Ocurrió un error");
						break;
					case 1:
						if (this.idClient != null) {
							alert("Actualizó correctamente al cliente");
						}else{
							alert("Agregó correctamente al cliente");
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