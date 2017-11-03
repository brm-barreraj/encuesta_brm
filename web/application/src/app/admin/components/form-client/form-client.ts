import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LoginAdminService } from '../../login/login.service';

@Component({
	selector: 'form-client',
	templateUrl: './form-client.html',
})
export class FormClientComponent {
	@Input() typeForm: string; 


	constructor(private serviceLoginAdmin: LoginAdminService,
				private router: Router){}

	ngOnInit() {
		alert(this.typeForm);
	}

	signOut(){
		this.serviceLoginAdmin.deleteSession();
		this.router.navigate(['admin/login']);
	}
}