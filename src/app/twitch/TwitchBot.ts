import * as tmi from 'tmi.js';
import { EventEmitter, Injectable } from '@angular/core';
import { TwitchConfigService } from '../services/twitchconfig.service';
import { ChannelMessage } from './channelmessage.model';
import { FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class TwitchBot {
    // UI Helpers * this should maybe be split out into a service.
    messageForms: any = {};
    channelForm: FormGroup;
    chats: ChannelMessage[] = [];

    public connectedChannels = [];
    public messaged = new EventEmitter<string[]>();
    private client: tmi.client;
    private username: string;
    private channel = '';

    constructor(private twitchConfig: TwitchConfigService) { }

    connect() {
        this.username = this.twitchConfig.getConfigValue('username');
        const opts = {
            identity: {
                username: this.username,
                password: this.twitchConfig.getConfigValue('password'),
            },
            channels: []
        };
        this.client = new tmi.client(opts);
        this.client.connect();

        this.client.on('message', (target, context, msg, self) => {
            this.handleMsg(target, context, msg, self);
        });

        this.client.on('connected', (addr, port) => {
            console.log(`Conneceted to ${addr} on ${port}`);
        });

        console.log(Object.getOwnPropertyNames(this.client.__proto__));
    }

    get connected() {
        if (this.client) {
          return this.client.readyState() === 'OPEN';
        }
        return false;
    }

    handleMsg(target, context, msg: string, self) {
        this.messaged.emit([target, context['display-name'], msg]);
        this.playNotifcationSound();
    }

    playNotifcationSound() {
        const audio = new Audio();
        audio.src = 'assets/audio/notification.wav';
        audio.load();
        audio.play();
    }

    sayMessage(channel, message) {
        if (this.client) {
            this.client.say(channel, message);
        }
    }

    joinChannel(channel: string) {
        if (this.client) {
            this.connectedChannels.push(channel);
            this.channel = `#${channel}`;
            this.client.join(`#${channel}`);
        }
    }

    leaveChannel(channel: string) {
        console.log(`Leave channel ${channel}`);
        if (this.client) {
            const index = this.connectedChannels.indexOf(channel);
            if (index > -1) {
                this.connectedChannels.splice(index, 1);
                this.removeChat(channel);
                this.client.leave(`#${channel}`);
            }
        }
    }

    removeChat(channel: string) {
        console.log(this.chats);
        const index = this.chats.findIndex(c => c.channel === channel);
        this.chats.splice(index, 1);
    }
}
