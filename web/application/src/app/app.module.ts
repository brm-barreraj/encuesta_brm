import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
//General
import { RequestService } from './app.request';


// App
import { AppComponent } from './app.component';
import { Login }      from './public/login/login';
import { Form }      from './public/form/form';

// App services
import { LoginService }      from './public/login/login.service';


//admin
import { AdminComponent }      from './admin/admin.component';
import { AdminLogin }      from './admin/login/login';
import { AdminEncuestas }      from './admin/encuestas/encuestas';


import { routing } from './app.routes';


@NgModule({
  declarations: [
    AppComponent,

    Login,
    Form,


    AdminComponent,
    AdminLogin,
    AdminEncuestas
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}, RequestService, LoginService],
  bootstrap: [AppComponent]
})
export class AppModule { }
