import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { MatCardModule } from '@angular/material';
import { AngularDraggableModule } from 'angular2-draggable';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home.component';
import { AboutComponent } from './components/about.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TwitchConfigService } from './services/twitchconfig.service';
import { TwitchBot } from './twitch/TwitchBot';
import { DisableControlDirective } from './helpers/disable-control';
import { LoginComponent } from './components/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    LoginComponent,
    DisableControlDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    HttpClientModule,
    AngularDraggableModule,
    ToastrModule.forRoot(),
  ],
  exports: [
    DisableControlDirective,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [TwitchConfigService],
      useFactory: (twitchConfigService: TwitchConfigService) => {
        return () => {
          // Make sure to return a promise!
          return twitchConfigService.loadTwitchConfig();
        };
      }
    },
    TwitchBot,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
