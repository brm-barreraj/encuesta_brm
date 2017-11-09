import { Component, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../../app.request';
import { LoginAdminService } from '../../login/login.service';
import { AlertToastComponent } from '../../components/alert-toast/alert-toast';

@Component({
	selector: 'form-user-client',
	templateUrl: './form-user-client.html',
})
export class FormUserClientComponent {
	@Input() idUser;
	@Input() idClient;
	user:any = {id:'',contrasena:''};

	@ViewChild(AlertToastComponent) toast:AlertToastComponent;

	constructor(private serviceLoginAdmin: LoginAdminService,
		private route: ActivatedRoute,
		private serviceRequest: RequestService,
		private router: Router){
	}

	ngOnInit() {
		if (this.idUser != null) {
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getAdminUsuario', idUsuario: this.idUser})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.user = result.data;
							break;
						case 2:
							this.toast.openToast("Usuario incorrecto",null,5,null);
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

	setUser(){
		let dataAdmin = this.serviceLoginAdmin.getSession();
		this.user.idAdmin = dataAdmin.id;
		this.user.idCuenta = this.idClient;
		this.user.accion = 'setAdminUsuario';
		this.serviceRequest.post('https://enc.brm.co/app.php', this.user)
			.subscribe(
			(result) => {
				switch (result.error) {
					case 0:
						this.toast.openToast("Ocurrió un error",null,5,null);
						break;
					case 1:
						if (this.idUser != '') {
							this.toast.openToast("Actualizó correctamente al usuario",null,5,()=>{
								this.router.navigate(['admin/clients']);
							});
						}else{
							this.toast.openToast("Agregó correctamente al usuario",null,5,()=>{
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

}