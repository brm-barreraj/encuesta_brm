import { Component } from '@angular/core';

@Component({
	selector: 'alert-toast',
	templateUrl: './alert-toast.html',
})
export class AlertToastComponent {

	activeT:boolean = true;
	
	constructor(){
	}

	ngOnInit() {
		console.log('esto es un toast')
	}


	closeToast(){
      this.activeT = !this.activeT;
      console.log('cerrar')
  	}

}