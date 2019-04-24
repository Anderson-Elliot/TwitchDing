import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { MatCardModule } from '@angular/material';
import { AngularDraggableModule } from 'angular2-draggable';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home.component';
import { AboutComponent } from './components/about.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TwitchConfigService } from './services/twitchconfig.service';
import { TwitchBot } from './twitch/TwitchBot';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularDraggableModule,
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
    TwitchBot
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
