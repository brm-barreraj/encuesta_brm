import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';
import { AlertToastComponent } from '../components/alert-toast/alert-toast';

@Component({
  templateUrl: './reports-period.html',
  // styleUrls: ['./reports.css'],
  providers: [RequestService, LoginAdminService]
})

export class AdminReportsPeriod {
	encuestas:any = [];
	categorias:any = [];

	@ViewChild(AlertToastComponent) toast:AlertToastComponent;
	
	constructor(private serviceLoginAdmin: LoginAdminService,
		private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
		if (!this.serviceLoginAdmin.validateSession()) {
			this.router.navigate(['admin']);
		}else{
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getEncuestas'})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.encuestas = result.data;
							this.categorias = this.encuestas[1].categorias;
							console.log(this.categorias);
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

	clickMarca(){
		console.log('aca llevaría al detalle de la marca')
	}

}
