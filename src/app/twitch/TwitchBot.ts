import * as tmi from 'tmi.js';
import { EventEmitter, Injectable } from '@angular/core';
import { TwitchConfigService } from '../services/twitchconfig.service';
import { ChannelMessage } from './channelmessage.model';

@Injectable({
    providedIn: 'root'
})
export class TwitchBot {
    public connectedChannels = [];
    public messaged = new EventEmitter<string[]>();
    private client: tmi.client;
    private channel = '#e018s';

    constructor(private twitchConfig: TwitchConfigService) { }

    connect() {
        const opts = {
            identity: {
                username: this.twitchConfig.getConfigValue('username'),
                password: this.twitchConfig.getConfigValue('password'),
            },
            channels: [
                'e018s',
            ]
        };
        this.client = new tmi.client(opts);
        this.client.connect();
        this.connectedChannels = this.client.channels;

        this.client.on('message', (target, context, msg, self) => {
            this.handleMsg(target, context, msg, self);
        });

        this.client.on('connected', (addr, port) => {
            console.log(`Conneceted to ${addr} on ${port}`);
            this.connectedChannels = this.client.channels;
        });
    }

    handleMsg(target, context, msg: string, self) {
        this.messaged.emit([target, context['display-name'], msg]);
        if (!self) {
            this.playNotifcationSound();
            // let spongebobMessage = '';
            // for (let i = 0; i < msg.length; i++) {
            //     const random = Math.random() >= 0.5;
            //     if (random) {
            //         spongebobMessage += msg.charAt(i).toUpperCase();
            //     } else {
            //         spongebobMessage += msg.charAt(i).toLowerCase();
            //     }
            // }
            // this.client.say(target, spongebobMessage);
        }
    }

    playNotifcationSound() {
        const audio = new Audio();
        audio.src = 'assets/audio/notification.wav';
        audio.load();
        audio.play();
    }

    sayMessage(message) {
        if (this.client) {
            this.client.say(this.channel, message);
        }
    }

    joinChannel(channel: string) {
        if (this.client) {
            this.channel = `#${channel}`;
            this.client.channels.push(this.channel);
            this.client.connect();
        }
    }
}
