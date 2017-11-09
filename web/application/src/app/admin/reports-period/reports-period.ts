import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';


@Component({
  templateUrl: './reports-period.html',
  // styleUrls: ['./reports.css'],
  providers: [RequestService, LoginAdminService]
})

export class AdminReportsPeriod {
	encuestas:any = [];
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

}
