import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';


@Component({
  templateUrl: './categories.html',
  providers: [RequestService, LoginAdminService]
})

export class AdminCategories {
	activeS:boolean = false;
	activeA:boolean = false;

	constructor(private serviceLoginAdmin: LoginAdminService,
		private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
		if (!this.serviceLoginAdmin.validateSession()) {
			this.router.navigate(['admin']);
		}else{
			// this.document.body.classList.remove('login');
		}
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
