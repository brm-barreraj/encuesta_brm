import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';
import { FormClientComponent } from '../components/form-client/form-client';


@Component({
  templateUrl: './client.html',
  // styleUrls: ['./reports.css'],
  providers: [RequestService, LoginAdminService,FormClientComponent]
})

export class AdminClient {
	client:any = [];
	idClient: any;
	constructor(private serviceLoginAdmin: LoginAdminService,
		private route: ActivatedRoute,
		private serviceRequest: RequestService,
		private router: Router) { }

	ngOnInit() {
		if (!this.serviceLoginAdmin.validateSession()) {
			this.router.navigate(['admin']);
		}else{

			this.idClient = this.route.snapshot.params['i'];
		}
	}
}
