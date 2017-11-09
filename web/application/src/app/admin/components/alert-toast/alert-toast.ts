import { Component } from '@angular/core';
@Component({
	selector: 'alert-toast',
	templateUrl: './alert-toast.html',
})
export class AlertToastComponent {
	activeT:boolean = false;
	txt1:string;
	txt2:string;
	
	constructor(){
	}

	ngOnInit() {
		console.log('esto es un toast')
	}


	closeToast(){
      this.activeT = false;
  	}
	
	openToast(txt1:string="",txt2:string="Listo",time:number=0,callback:any=null){
		this.txt1 = txt1; 
		this.txt2 = txt2; 
		if (time > 0) {
			setTimeout(()=>{
				this.closeToast();
				if (callback != null) {
					callback();
				}
			},time*1000);
		}
		console.log(this.activeT,"activeT");
		this.activeT = true;
	}

}