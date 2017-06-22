import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';



@Component({
  templateUrl: './encuestas.html',
  styleUrls: ['./encuestas.css'],
  providers: [RequestService]
})

export class AdminEncuestas {
	encuestas:any = [];
	constructor(private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
		this.serviceRequest.post('http://127.0.0.1/encuestas_brm/web/server/app.php', { accion: 'getEncuestas'})
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
