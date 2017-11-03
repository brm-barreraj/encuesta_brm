import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';

@Component({
  templateUrl: './client.html',
  // styleUrls: ['./reports.css'],
  providers: [RequestService, LoginAdminService]
})

export class AdminClient {
	client:any = [];
	idClient: any;
	constructor(private serviceLoginAdmin: LoginAdminService,
		private route: ActivatedRoute,
		private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
        this.idClient = this.route.snapshot.params['i'];

		console.log(this.idClient);

		this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getAdminClientes', idCuenta: this.idClient})
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
	}

	goToClient(idClient){
		this.router.navigate(['admin/client', {i: idClient}]);
	}

	goToUserClient(idUser){
		this.router.navigate(['admin/user-client', { i: idUser}]);
	}

	editClient(){
		this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'upAdminCliente', idCuenta: this.client.id, nombre: this.client.nombre})
			.subscribe(
			(result) => {
				switch (result.error) {
					case 0:
						alert("Ocurrió un error");
						break;
					case 1:
						alert("Actualizó correctamente el cliente");
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
