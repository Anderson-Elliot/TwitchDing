import { Component, OnInit, OnDestroy } from '@angular/core';
import { TwitchBot } from '../twitch/TwitchBot';
import { FormBuilder } from '@angular/forms';
import * as rx from 'rxjs';
import { ChannelMessage } from '../twitch/channelmessage.model';
import { Message } from '../twitch/channelmessage.model';
import { ToastrService } from 'ngx-toastr';
import { CONNECTIONSTATE } from '../helpers/connection-state';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../app.component.sass', '../resizable.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    messagedSubscription: rx.Subscription;
    joinedSubscription: rx.Subscription;
    errorSubscription: rx.Subscription;

    constructor(
        private fb: FormBuilder,
        private bot: TwitchBot,
        private toastr: ToastrService) {
        this.bot.channelForm = fb.group({
            name: ''
        });
    }

    ngOnInit() {
        if (!this.bot.connected) {
            this.bot.connect();
        }
        this.messagedSubscription = this.bot.messaged.subscribe(this.handleMessage);
        this.joinedSubscription = this.bot.channelJoined.subscribe(this.handleJoined);
        this.errorSubscription = this.bot.error.subscribe(this.handleError);
    }

    ngOnDestroy() {
        this.messagedSubscription.unsubscribe();
        this.joinedSubscription.unsubscribe();
        this.errorSubscription.unsubscribe();
    }

    joinChannel() {
        const channel = this.bot.channelForm.value['name'];
        if (channel && !this.channelAlreadyJoined(channel)) {
            this.bot.joinChannel(channel);
        }

        this.bot.channelForm.controls['name'].setValue('');
    }

    handleJoined = (channel: string) => {
        const messageForm = this.fb.group({
            channel: channel,
            message: ''
        });
        this.bot.messageForms[channel] = messageForm;

        // new up the chat message object
        if (!this.bot.chats.some(cm => cm.channel === channel)) {
            const channelMessage = new ChannelMessage(channel);
            this.bot.chats.push(channelMessage);
        }
    }

    channelAlreadyJoined(channel: string) {
        const joined = this.bot.connectedChannels.includes(channel);
        if (joined) {
            this.toastr.warning('Channel is already joined');
        }

        return joined;
    }

    leaveChannel(channel: string) {
        this.bot.leaveChannel(channel);
    }

    handleMessage = (event: any[]) => {
        const target = event[0].substr(1, event[0].length - 1);
        const message = event[1];

        if (!this.bot.chats.some(cm => cm.channel === target)) {
            const channelMessage = new ChannelMessage(target);
            channelMessage.messages.push(message);
            this.bot.chats.push(channelMessage);
        } else {
            const channelMessage = this.bot.chats.find(cm => cm.channel === target);
            channelMessage.messages.push(message);

            if (channelMessage.messages.length > 50) {
                channelMessage.messages = channelMessage.messages.slice(10, channelMessage.messages.length);
            }
        }

        this.scrollToBottom(target);
    }

    scrollToBottom(channel: string) {
        const element = $(`#${channel}`);
        if (element) {
            const isScrolledBottom = element.scrollTop() + element.outerHeight() > element.prop('scrollHeight');
            if (isScrolledBottom) {
                element.animate({ scrollTop: element.prop('scrollHeight')}, 1000);
            }
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

    handleError = (error: string) => {
        this.toastr.error(error);
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

    get connectionState() {
        return CONNECTIONSTATE;
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

    sendWindowsToBack() {
        this.bot.chats.forEach(chat => chat.front = false);
    }

    sendToFront(chat: ChannelMessage) {
        this.sendWindowsToBack();
        chat.front = true;
    }
}
