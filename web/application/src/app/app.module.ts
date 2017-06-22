import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

//General
import { RequestService } from './app.request';


// App
import { AppComponent } from './app.component';
import { Login }      from './login/login';
import { Form }      from './form/form';

// App services
import { LoginService }      from './login/login.service';


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
  providers: [RequestService, LoginService],
  bootstrap: [AppComponent]
})
export class AppModule { }
