import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'sign-out-app',
  templateUrl: './sign-out.html',
})
export class SignOutComponent {
  constructor(private serviceLogin: LoginService,
    private router: Router){}
  signOut(){
    this.serviceLogin.deleteSession();
    this.router.navigate(['login']);
  }
}