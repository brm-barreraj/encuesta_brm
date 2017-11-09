import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocationStrategy, HashLocationStrategy, PathLocationStrategy } from '@angular/common';
//General
import { RequestService } from './app.request';


//Components
import { SignOutComponent }      from './admin/components/sign-out/sign-out';
import { FormClientComponent }      from './admin/components/form-client/form-client';
import { FormUserClientComponent }      from './admin/components/form-user-client/form-user-client';
import { AlertToastComponent }      from './admin/components/alert-toast/alert-toast';



// App
import { AppComponent } from './app.component';
import { Login }      from './public/login/login';
import { Form }      from './public/form/form';

// App services
import { LoginService }      from './public/login/login.service';


//Admin
import { AdminComponent }      from './admin/admin.component';
import { AdminLogin }      from './admin/login/login';
import { AdminReports }      from './admin/reports/reports';
import { AdminReportsPeriod }      from './admin/reports-period/reports-period';
import { AdminDashboard }      from './admin/dashboard/dashboard';
import { AdminClients }      from './admin/clients/clients';
import { AdminClient }      from './admin/client/client';
import { AdminUserClient }      from './admin/user-client/user-client';


// Admin services
import { LoginAdminService }      from './admin/login/login.service';


import { routing } from './app.routes';


@NgModule({
  declarations: [
    AppComponent,

    SignOutComponent,
    FormClientComponent,
    FormUserClientComponent,
    AlertToastComponent,

    Login,
    Form,


    AdminComponent,
    AdminLogin,
    AdminReports,
    AdminReportsPeriod,
    AdminDashboard,
    AdminClients,
    AdminClient,
    AdminUserClient,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [{provide: LocationStrategy, useClass: PathLocationStrategy}, RequestService, LoginService],
  bootstrap: [AppComponent]
})
export class AppModule { }
