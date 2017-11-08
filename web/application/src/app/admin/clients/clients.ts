import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';


@Component({
  templateUrl: './clients.html',
  // styleUrls: ['./reports.css'],
  providers: [RequestService, LoginAdminService]
})

export class AdminClients {
	clientes:any = [];
	activeS:boolean = false;
	constructor(private serviceLoginAdmin: LoginAdminService,
		private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
		if (!this.serviceLoginAdmin.validateSession()) {
			this.router.navigate(['admin']);
		}else{
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getAdminClientes'})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							alert("Ocurrió un error");
							break;
						case 1:
							this.clientes = result.data;
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

	goToClient(idClient){
		this.router.navigate(['admin/client', { i: idClient } ]);
	}

	goToUserClient(idUser,idClient){
		this.router.navigate(['admin/user-client', { iu: idUser, ic: idClient}]);
	}
	goToReports(){
		
	}
	
	toggleClass(){
      this.activeS = !this.activeS;
  	}

  	deleteClient(idClient){
		var conf = confirm("Desea eliminar el cliente?");
		if (conf == true) {
	  		this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'deleteAdminCliente',idCliente: idClient})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							alert("Ocurrió un error");
							break;
						case 1:
							this.clientes = result.data;
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

}
