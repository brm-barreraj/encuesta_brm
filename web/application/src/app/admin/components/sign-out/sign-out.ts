import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginAdminService } from '../../login/login.service';

@Component({
  selector: 'sign-out',
  templateUrl: './sign-out.html',
})
export class SignOutComponent {
  constructor(private serviceLoginAdmin: LoginAdminService,
    private router: Router){}
  signOut(){
    this.serviceLoginAdmin.deleteSession();
    this.router.navigate(['admin/login']);
  }
}