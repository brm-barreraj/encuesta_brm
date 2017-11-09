import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';
import { DOCUMENT } from '@angular/platform-browser';


@Component({
  templateUrl: './dashboard.html',
  // styleUrls: ['./encuestas.css'],
  providers: [RequestService, LoginAdminService]
})

export class AdminDashboard {
	encuestas:any = [];
	constructor(private serviceLoginAdmin: LoginAdminService,
		private serviceRequest: RequestService,
		@Inject(DOCUMENT) private document: any,
		private router: Router) { }

	ngOnInit() {
		if (!this.serviceLoginAdmin.validateSession()) {
			this.router.navigate(['admin']);
		}else{
			this.document.body.classList.remove('login');
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getEncuestas'})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							alert("Ocurrió un error");
							break;
						case 1:
							this.encuestas = result.data;
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

	goToClients(){
		this.router.navigate(['admin/clients']);
	}
	goToCategories(){
		this.router.navigate(['admin/categories']);
	}
	goToReports(){
		this.router.navigate(['admin/reports']);
	}

}
