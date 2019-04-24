import { Component, OnInit, OnDestroy } from '@angular/core';
import { TwitchBot } from '../twitch/TwitchBot';
import { FormBuilder } from '@angular/forms';
import * as rx from 'rxjs';
import { ChannelMessage } from '../twitch/channelmessage.model';
import { Message } from '../twitch/channelmessage.model';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../app.component.sass']
})
export class HomeComponent implements OnInit, OnDestroy {
    messagedSubscription: rx.Subscription;

    constructor(private fb: FormBuilder, private bot: TwitchBot) {
        this.bot.channelForm = fb.group({
            name: ''
        });
    }

    ngOnInit() {
        if (!this.bot.connected) {
            this.bot.connect();
        }
        this.messagedSubscription = this.bot.messaged.subscribe(this.handleMessage);
    }

    ngOnDestroy() {
        this.messagedSubscription.unsubscribe();
    }

    joinChannel() {
        const channel = this.bot.channelForm.value['name'];
        if (channel) {
            this.bot.joinChannel(channel);
            const messageForm = this.fb.group({
                channel: channel,
                message: ''
            });
            this.bot.messageForms[channel] = messageForm;
            this.bot.channelForm.controls['name'].setValue('');

            // new up the chat message object
            if (!this.bot.chats.some(cm => cm.channel === channel)) {
                const channelMessage = new ChannelMessage(channel);
                this.bot.chats.push(channelMessage);
            }
        }
    }

    leaveChannel(channel: string) {
        this.bot.leaveChannel(channel);
    }

    handleMessage = (event: string[]) => {
        const target = event[0].substr(1, event[0].length - 1);
        const user = event[1];
        const message = event[2];

        if (!this.bot.chats.some(cm => cm.channel === target)) {
            const channelMessage = new ChannelMessage(target);
            channelMessage.messages.push(new Message(user, message));
            this.bot.chats.push(channelMessage);
        } else {
            const channelMessage = this.bot.chats.find(cm => cm.channel === target);
            channelMessage.messages.push(new Message(user, message));
        }
    }

    speakMessage(channel: string) {
        const messageForm = this.bot.messageForms[channel];
        if (messageForm) {
            const message = messageForm.value['message'];
            this.bot.sayMessage(channel, message);
            messageForm.controls['message'].setValue('');
        }
    }

    getDisplaynameColor(username: string) {
        if (username) {
           const color = this.intToRgb(this.hashCode(username));
           return `#${color}`;
        }

        return '';
    }

    get channelString() {
        return this.bot.connectedChannels.join(' and ');
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
