import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../../app.request';
import { LoginAdminService } from '../../login/login.service';

@Component({
	selector: 'alert-toast',
	templateUrl: './alert-toast.html',
})
export class AlertToastComponent {
	@Input() idClient;
	client:any = [];
	activeT:boolean = true;

	constructor(private serviceLoginAdmin: LoginAdminService,
		private route: ActivatedRoute,
		private serviceRequest: RequestService,
		private router: Router){
	}

	ngOnInit() {
		console.log('esto es un toast')
	}


	closeToast(){
      this.activeT = !this.activeT;
      console.log('cerrar')
  	}

}