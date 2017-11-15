import { Component, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../../app.request';
import { LoginAdminService } from '../../login/login.service';
import { AlertToastComponent } from '../../components/alert-toast/alert-toast';

@Component({
	selector: 'form-client',
	templateUrl: './form-client.html',
})
export class FormClientComponent {
	@Input() idClient;
	client:any = [];
	activeS:boolean = false;

	@ViewChild(AlertToastComponent) toast:AlertToastComponent;

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
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.client = result.data;
							break;
						case 2:
							this.toast.openToast("Cliente incorrecto",null,5,null);
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
						this.toast.openToast("Ocurrió un error",null,5,null);
						break;
					case 1:
						if (this.idClient != null) {
							this.toast.openToast("Actualizó correctamente al cliente",null,5,()=>{
								this.router.navigate(['admin/clients']);
							});
						}else{
							this.toast.openToast("Agregó correctamente al cliente",null,5,()=>{
								this.router.navigate(['admin/clients']);
							});
						}
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

	toggleClass(){
      this.activeS = !this.activeS;
  	}


}