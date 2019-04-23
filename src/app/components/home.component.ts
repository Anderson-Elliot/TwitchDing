import { Component, OnInit } from '@angular/core';
import { TwitchBot } from '../twitch/TwitchBot';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../app.component.sass']
})
export class HomeComponent implements OnInit {
    twitchForm: FormGroup;
    chats: string[][] = [];

    constructor(private fb: FormBuilder, private bot: TwitchBot) {
        this.twitchForm = fb.group({
            message: ''
        });
    }

    ngOnInit() {
        this.bot.connect();
        this.bot.messaged.subscribe(message => {
            this.chats.push(message);
        });
    }

    speakMessage() {
        const message = this.twitchForm.value['message'];
        this.bot.sayMessage(message);
        this.twitchForm.controls['message'].setValue('');
    }

    getDisplaynameColor(username: string) {
        const color = this.intToRgb(this.hashCode(username));
        console.log(color);
        return `#${color}`;
    }

    hashCode(str: string) {
        let hash: any = 0;
        for (let i = 0; i < str.length; i++) {
           // tslint:disable-next-line:no-bitwise
           hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    intToRgb(i: number) {
        // tslint:disable-next-line:no-bitwise
        const c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

        return '00000'.substring(0, 6 - c.length) + c;
    }
}
