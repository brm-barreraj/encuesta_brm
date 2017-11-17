import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from '../../app.request';
import { LoginAdminService } from '../login/login.service';
import { AlertToastComponent } from '../components/alert-toast/alert-toast';

@Component({
  templateUrl: './categories.html',
  providers: [RequestService, LoginAdminService]
})

export class AdminCategories {
	activeS:boolean = false;
	activeA:boolean = false;
	categorias:Array<{id:String,nombre:String,descripcion:String,porcentaje:Number,activo:Boolean,activoColor:Boolean}> = [];
	categoria:any = {};
	preguntas:Array<{id:String,idCategoria:String,titulo:String,activo:Boolean}> = [];
	statusPreg:boolean = false;
	pregunta:any = {};
	tempKeyCategoriaActiva:any;

	@ViewChild(AlertToastComponent) toast:AlertToastComponent;

	constructor(private serviceLoginAdmin: LoginAdminService,
		private serviceRequest: RequestService,
		private router: Router) {

		router.events.subscribe((val) => {
			if (!this.serviceLoginAdmin.validateSession()) {
				this.router.navigate(['admin']);
			}else{
				this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getCategorias'})
					.subscribe(
					(result) => {
						switch (result.error) {
							case 0:
								this.toast.openToast("Ocurrió un error",null,5,null);
								break;
							case 1:
								this.categorias = result.data;
								break;
							case 2:
								this.toast.openToast("No hay categorías disponibles",null,5,null);
								break;
						}
					},
					(error) =>  {
						console.log(error);
						this.toast.openToast("Ocurrió un error de conexión",null,5,null);
					});
			}
		});
	}

	ngOnInit() {
		if (!this.serviceLoginAdmin.validateSession()) {
			this.router.navigate(['admin']);
		}else{
			// this.document.body.classList.remove('login');
		}
	}

	showQuestions(idCategoria,keyCategoria){
		if (idCategoria !="" && idCategoria != undefined) {
			if (this.tempKeyCategoriaActiva != undefined) {
				this.categorias[this.tempKeyCategoriaActiva].activoColor=false;
			}
			this.categorias[keyCategoria].activoColor=true;
			this.tempKeyCategoriaActiva = keyCategoria;
			this.statusPreg = true;
			this.pregunta = {idCategoria: idCategoria};
			this.preguntas = [];			
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'getAdminPreguntas', idCategoria: idCategoria})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.preguntas = result.data;
							break;
						case 2:
							this.toast.openToast("No hay preguntas para esta categoría",null,5,null);
							break;
					}
				},
				(error) =>  {
					console.log(error);
					this.toast.openToast("Ocurrió un error de conexión",null,5,null);
				});
		}else{
			this.toast.openToast("Debe seleccionar una categoría",null,5,null);
		}
	}

	showEditCategory(keyCategoria){
		this.categorias[keyCategoria].activo=true;
	}

	showEditQuestion(keyPregunta){
		this.preguntas[keyPregunta].activo=true;
	}

	saveCategory(category:any,keyCategoria:number=-1){
		if (category.nombre !="" && category.nombre != undefined && category.descripcion !="" && category.descripcion != undefined && category.porcentaje != undefined && category.porcentaje != undefined) {
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'setCategoria', id: category.id, nombre: category.nombre, descripcion: category.descripcion, porcentaje: category.porcentaje})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							if (category.id != "" && category.id != undefined) {
								this.categorias[keyCategoria].activo=false;
								this.toast.openToast("Ha editado correctamente la categoría",null,5,null);
							}else{
								category.id = result.data;
								this.categorias.push(category);
								console.log(this.categorias,"this.categorias");
								this.categoria = {};
								this.toggleClass('activeA');
								this.toast.openToast("Ha agregado correctamente la categoría",null,5,null);
							}
							break;
						case 2:
							this.toast.openToast("Los datos de la categoría son incorerectos",null,5,null);
							break;
						case 4:
							this.categorias[keyCategoria].activo=false;
							break;
						case 5:
							this.toast.openToast("Categoría ya existe",null,5,null);
							break;
					}
				},
				(error) =>  {
					console.log(error);
					this.toast.openToast("Ocurrió un error de conexión",null,5,null);
				});
		}else{
			this.toast.openToast("Datos incompletos",null,5,null);
		}
	}

	saveQuestion(question:any,keyPregunta:number=-1){
		if (question.titulo !="" && question.titulo != undefined) {
			let user = this.serviceLoginAdmin.getSession();
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'setAdminPregunta', id: question.id, titulo: question.titulo, idCategoria: question.idCategoria, idAdmin: user.id})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							if (question.id != "" && question.id != undefined) {
								this.preguntas[keyPregunta].activo=false;
								this.toast.openToast("Ha editado correctamente la pregunta",null,5,null);
							}else{
								question.id = result.data;
								this.preguntas.push(question);
								console.log(this.preguntas,"this.preguntas");
								console.log(this.pregunta,"this.pregunta");
								let idCategoria = this.pregunta.idCategoria;
								this.pregunta = {};
								this.pregunta.idCategoria = idCategoria;
								this.toggleClass('activeS');
								this.toast.openToast("Ha agregado correctamente la pregunta",null,5,null);
							}
							break;
						case 2:
							this.toast.openToast("Los datos de la pregunta son incorerectos",null,5,null);
							break;
						case 4:
							this.preguntas[keyPregunta].activo=false;
							break;
						case 5:
							this.toast.openToast("Pregunta ya existe",null,5,null);
							break;
					}
				},
				(error) =>  {
					console.log(error);
					this.toast.openToast("Ocurrió un error de conexión",null,5,null);
				});
		}else{
			this.toast.openToast("Datos incompletos",null,5,null);
		}
	}

	removeCategory(idCategory:string,keyCategoria:number){
		if (idCategory !="" && idCategory != undefined ) {
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'removeCategoria', id: idCategory})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.categorias.splice(keyCategoria,1);
							this.toast.openToast("Se eliminó correctamente la categoría",null,5,null);
							break;
						case 2:
							this.toast.openToast("Los datos de la categoría son incorerectos",null,5,null);
							break;
						case 3:
							this.toast.openToast("datos request incorrectos",null,5,null);
							break;
						case 4:
							this.toast.openToast("La categoría no se puede eliminar, se está utilizando actualmente",null,5,null);
							break;
					}
				},
				(error) =>  {
					console.log(error);
					this.toast.openToast("Ocurrió un error de conexión",null,5,null);
				});
		}else{
			this.toast.openToast("Datos incompletos",null,5,null);
		}
	}

	removeQuestion(idQuestion:string,keyQuestion:number){
		if (idQuestion !="" && idQuestion != undefined ) {
			this.serviceRequest.post('https://enc.brm.co/app.php', { accion: 'removePregunta', id: idQuestion})
				.subscribe(
				(result) => {
					switch (result.error) {
						case 0:
							this.toast.openToast("Ocurrió un error",null,5,null);
							break;
						case 1:
							this.preguntas.splice(keyQuestion,1);
							this.toast.openToast("Se eliminó correctamente la pregunta",null,5,null);
							break;
						case 2:
							this.toast.openToast("Los datos de la pregunta son incorerectos",null,5,null);
							break;
						case 3:
							this.toast.openToast("datos request incorrectos",null,5,null);
							break;
						case 4:
							this.toast.openToast("La pregunta no se puede eliminar, se está utilizando actualmente",null,5,null);
							break;
					}
				},
				(error) =>  {
					console.log(error);
					this.toast.openToast("Ocurrió un error de conexión",null,5,null);
				});
		}else{
			this.toast.openToast("Datos incompletos",null,5,null);
		}
	}
	
	toggleClass(ele){
		if(ele== 'activeS'){
			this.activeS = !this.activeS;
		}else  if(ele== 'activeA'){
			this.activeA = !this.activeA;
		}

	}

}
