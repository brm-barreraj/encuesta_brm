import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';


@Component({
  templateUrl: './categories.html',
  providers: [RequestService, LoginAdminService]
})

export class AdminCategories {
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


}
