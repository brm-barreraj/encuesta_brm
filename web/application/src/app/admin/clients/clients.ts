import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';
import { AlertToastComponent } from '../components/alert-toast/alert-toast';

@Component({
  templateUrl: './clients.html',
  // styleUrls: ['./reports.css'],
  providers: [RequestService, LoginAdminService]
})

export class AdminClients {
	clientes:any = [];
	activeS:boolean = false;

	@ViewChild(AlertToastComponent) toast:AlertToastComponent;

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
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.clientes = result.data;
							break;
						case 2:
							this.toast.openToast("No existen clientes",null,5,null);
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

	insertClient(client){
		this.toast.openToast("Agregó correctamente al cliente",null,5,null);
		this.activeS = false;
		this.clientes.push(client);
	}
	
	toggleClass(){
      this.activeS = !this.activeS;
  	}

  	removeClient(idClient:string,keyClient:number){
		var conf = confirm("Desea eliminar el cliente?");
		if (conf == true) {
	  		this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'removeAdminCliente',id: idClient})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.clientes.splice(keyClient,1);
							this.toast.openToast("Se ha eliminado el cliente correctamente",null,5,null);
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

  	removeUser(idClient){
		var conf = confirm("Desea eliminar al usuario?");
		if (conf == true) {
	  		this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'removeAdminUsuario',id: idClient})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.toast.openToast("Se ha eliminado el cliente correctamente",null,5,()=>{
								window.location.reload();
							});
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

}
