import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'form-client',
	templateUrl: './form-client.html',
})
export class FormClientComponent {


	constructor(private router: Router){}
}