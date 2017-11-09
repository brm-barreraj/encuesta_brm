import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';
import { DOCUMENT } from '@angular/platform-browser';


@Component({
  templateUrl: './dashboard.html',
  providers: [RequestService, LoginAdminService]
})

export class AdminDashboard {
	constructor(private serviceLoginAdmin: LoginAdminService,
		private serviceRequest: RequestService,
		@Inject(DOCUMENT) private document: any,
		private router: Router) { }

	ngOnInit() {
		if (!this.serviceLoginAdmin.validateSession()) {
			this.router.navigate(['admin']);
		}else{
			this.document.body.classList.remove('login');
		}
	}

	goToClients(){
		this.router.navigate(['admin/clients']);
	}
	goToCategories(){
		this.router.navigate(['admin/categories']);
	}
	goToReports(){
		this.router.navigate(['admin/reports']);
	}

}
