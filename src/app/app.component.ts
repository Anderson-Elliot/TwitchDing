import { Component } from '@angular/core';
import { TwitchBot } from './twitch/TwitchBot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  constructor(private bot: TwitchBot) {}
}
