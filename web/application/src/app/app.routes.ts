// ====== ./app/app.routes.ts ======

// Imports
// Deprecated import
// import { provideRouter, RouterConfig } from '@angular/router';
import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// App
import { Login } from './login/login';
import { Form } from './form/form';


// Admin
import { AdminComponent } from './admin/admin.component';
import { AdminLogin } from './admin/login/login';
import { AdminEncuestas } from './admin/encuestas/encuestas';


// Route Configuration
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'form', component: Form },
  { path: '', redirectTo: 'login', pathMatch: 'full'},


  { path: 'admin', component: AdminComponent, 
  	children: [
  		{path: 'login', component: AdminLogin},
  		{path: 'encuestas', component: AdminEncuestas},

  	]
  }
];

// Deprecated provide
// export const APP_ROUTER_PROVIDERS = [
//   provideRouter(routes)
// ];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);