import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';
import { AlertToastComponent } from '../components/alert-toast/alert-toast';

@Component({
  templateUrl: './categories.html',
  providers: [RequestService, LoginAdminService]
})

export class AdminCategories {
	activeS:boolean = false;
	activeA:boolean = false;
	categorias:Array<{id:Number,nombre:String,porcentaje:Number,activo:Boolean}> = [];
	@ViewChild(AlertToastComponent) toast:AlertToastComponent;

	constructor(private serviceLoginAdmin: LoginAdminService,
		private serviceRequest: RequestService,
		private router: Router) {

		router.events.subscribe((val) => {
			if (!this.serviceLoginAdmin.validateSession()) {
				this.router.navigate(['admin']);
			}else{
				this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getCategorias'})
					.subscribe(
					(result) => {
						switch (result.error) {
							case 0:
								this.toast.openToast("Ocurrió un error",null,5,null);
								break;
							case 1:
								this.categorias = result.data;
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
		});

	}

	ngOnInit() {
		if (!this.serviceLoginAdmin.validateSession()) {
			this.router.navigate(['admin']);
		}else{
			// this.document.body.classList.remove('login');
		}
	}

	showEdit(i){
		this.categorias[i].activo=true;
	}

	toggleClass(ele){
	      // this.activeS = !this.activeS;

	      if(ele== 'activeS'){
		      this.activeS = !this.activeS;
	      }else  if(ele== 'activeA'){
		      this.activeA = !this.activeA;
	      }

	  	}

}
