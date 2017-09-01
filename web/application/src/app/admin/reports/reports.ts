import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';



@Component({
  templateUrl: './reports.html',
  // styleUrls: ['./reports.css'],
  providers: [RequestService]
})

export class AdminReports {
	encuestas:any = [];
	constructor(private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
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
