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
	categoriasCliente:any = [];
	fileImage: File;
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
							this.categoriasCliente = result.data.categorias;
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
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getCategorias'})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.categoriasCliente = result.data;
							break;
						case 2:
							this.toast.openToast("Cliente incorrecto",null,5,null);
							break;
					}
				},
				(error) =>  {
					console.log(error)
				});
			this.idClient = '';
		}
	}

	fileChange(event) {
		let fileList: FileList = event.target.files;
    	if(fileList.length > 0) {
			this.fileImage = fileList[0];
		}
		console.log(this.fileImage);
	}

	toogleCateogriaCliente(action,key){
		console.log(action);
		if (action=="a") {
			this.categoriasCliente[key].active = true;
		}else if(action=="i"){
			this.categoriasCliente[key].active = false;
		}else if(action=="inv"){
			this.activeS = false;
			console.log(this.categoriasCliente[key]);
			if (this.categoriasCliente[key].active == undefined) {
				this.categoriasCliente[key].active = true;
			}else{
				this.categoriasCliente[key].active = !this.categoriasCliente[key].active;
			}
			
		}
	}

	setClient(){
		if (this.client.nombre != undefined && this.client.nombre != '' && this.fileImage != undefined && this.client.color != undefined && this.client.color != '') {
			let user = this.serviceLoginAdmin.getSession();
			let formData:FormData = new FormData();
			formData.append('imagen', this.fileImage, this.fileImage.name);
			formData.append('idCuenta', this.idClient);
			formData.append('nombre', this.client.nombre);
			formData.append('color', this.client.color);
			formData.append('accion', 'setAdminCliente');
			formData.append('idAdmin', user.id);

			this.serviceRequest.post('https://enc.brm.co/app.php', formData, true)
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
		}else{
			this.toast.openToast("Datos incompletos",null,5,null);
		}
	}

	toggleClass(){
      this.activeS = !this.activeS;
  	}


}