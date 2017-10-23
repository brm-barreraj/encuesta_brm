import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';



@Component({
  templateUrl: './user-client.html',
  // styleUrls: ['./reports.css'],
  providers: [RequestService]
})

export class AdminUserClient {
	clientes:any = [];
	constructor(private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
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

	goToClient(idClient){
		this.router.navigate(['admin/client', {i: idClient}]);
	}

	goToUserClient(idUser){
		this.router.navigate(['admin/user-client', { i: idUser}]);
	}

	goToReports(){
		
	}

}
