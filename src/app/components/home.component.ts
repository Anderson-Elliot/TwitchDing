import { Component, OnInit } from '@angular/core';
import { TwitchBot } from '../twitch/TwitchBot';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as rx from 'rxjs';
import { ChannelMessage } from '../twitch/channelmessage.model';
import { Message } from '../twitch/channelmessage.model';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../app.component.sass']
})
export class HomeComponent implements OnInit {
    twitchForm: FormGroup;
    channelForm: FormGroup;
    chats: ChannelMessage[] = [];

    constructor(private fb: FormBuilder, private bot: TwitchBot) {
        this.twitchForm = fb.group({
            message: ''
        });
        this.channelForm = fb.group({
            name: ''
        });
    }

    ngOnInit() {
        this.bot.connect();
        this.bot.messaged.subscribe(event => {
            const target = event[0];
            const user = event[1];
            const message = event[2];

            if (!this.chats.some(cm => cm.channel === target)) {
                const channelMessage = new ChannelMessage(target);
                channelMessage.messages.push(new Message(user, message));
                this.chats.push(channelMessage);
            } else {
                const channelMessage = this.chats.find(cm => cm.channel === target);
                channelMessage.messages.push(new Message(user, message));
            }

            console.log(this.chats);
        });
    }

    joinChannel() {
        if (this.channelForm.value['name']) {
            this.chats = [];
            this.bot.joinChannel(this.channelForm.value['name']);
            this.channelForm.controls['name'].setValue('');
        }
    }

    speakMessage() {
        const message = this.twitchForm.value['message'];
        this.bot.sayMessage(message);
        this.twitchForm.controls['message'].setValue('');
    }

    getDisplaynameColor(username: string) {
        if (username) {
           const color = this.intToRgb(this.hashCode(username));
           return `#${color}`;
        }

        return '';
    }

    get channelString() {
        return this.bot.connectedChannels.map(value => value.substr(1, value.length - 1)).join(' and ');
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
