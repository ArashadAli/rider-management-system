import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { PageNotFoundComponent } from './not-found/not-found.component';
import { AuthInterceptor, CredentialsInterceptor } from './core/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LucideAngularModule, LayoutDashboard, ShoppingCartIcon, Truck, UserRoundCog, LogOut, CirclePlus, Trash2, CircleArrowRight, CircleArrowLeft, Package, Motorbike,
  RotateCw,
  PackageCheck,
  CircleX,
  EllipsisVertical,
  User,
  Phone,
  Save,
  Lock,
  Eye,
  EyeClosed,
  Bike,
  Scooter,
  Car,
  Van,
  Ban
} from 'lucide-angular';


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    PageNotFoundComponent
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    GlobalLoaderComponent,

    BrowserAnimationsModule,

    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
      preventDuplicates: true
    }),
    LucideAngularModule.pick({
      LayoutDashboard,
      ShoppingCartIcon,
      Truck,
      UserRoundCog,
      LogOut,
      CirclePlus,
      Trash2,
      CircleArrowLeft,
      CircleArrowRight,
      Package,
      Motorbike,
      RotateCw,
      PackageCheck,
      CircleX,
      EllipsisVertical,
      User,
      Phone,
      Save,
      Lock,
      Eye,
      EyeClosed,
      Bike,
      Scooter,
      Car,
      Van,
      Ban
    })
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true
    },
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }