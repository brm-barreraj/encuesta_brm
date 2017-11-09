// ====== ./app/app.routes.ts ======

// Imports
// Deprecated import
// import { provideRouter, RouterConfig } from '@angular/router';
import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// App
import { Login } from './public/login/login';
import { Form } from './public/form/form';


// Admin
import { AdminComponent } from './admin/admin.component';
import { AdminLogin } from './admin/login/login';
import { AdminReports } from './admin/reports/reports';
import { AdminReportsPeriod } from './admin/reports-period/reports-period';
import { AdminDashboard } from './admin/dashboard/dashboard';
import { AdminClients } from './admin/clients/clients';
import { AdminClient } from './admin/client/client';
import { AdminUserClient } from './admin/user-client/user-client';
import { AdminCategories } from './admin/categories/categories';



// Route Configuration
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'form', component: Form },
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'admin', redirectTo: 'admin/login', pathMatch: 'full'},


  { path: 'admin', component: AdminComponent, 
  	children: [
  		{path: 'login', component: AdminLogin},
      {path: 'reports', component: AdminReports},
  		{path: 'reports-period', component: AdminReportsPeriod},
  		{path: 'dashboard', component: AdminDashboard},
  		{path: 'clients', component: AdminClients},
  		{path: 'client', component: AdminClient},
      {path: 'user-client', component: AdminUserClient},
  		{path: 'categories', component: AdminCategories},


  	]
  }
];

// Deprecated provide
// export const APP_ROUTER_PROVIDERS = [
//   provideRouter(routes)
// ];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes,{ useHash: true });