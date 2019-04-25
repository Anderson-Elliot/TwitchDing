import * as tmi from 'tmi.js';
import { EventEmitter, Injectable } from '@angular/core';
import { TwitchConfigService } from '../services/twitchconfig.service';
import { ChannelMessage, Message } from './channelmessage.model';
import { FormGroup } from '@angular/forms';
import { CONNECTIONSTATE } from '../helpers/connection-state';
import { interval } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TwitchBot {
    // UI Helpers * this should maybe be split out into a service.
    messageForms: any = {};
    channelForm: FormGroup;
    chats: ChannelMessage[] = [];
    timer = interval(10000);
    canPlaySound = true;

    public connectedChannels = [];

    // Events
    public messaged = new EventEmitter<any[]>();
    public channelJoined = new EventEmitter<string[]>();
    public error = new EventEmitter<string[]>();

    private client: tmi.client;
    private username: string;

    constructor(private twitchConfig: TwitchConfigService) {
        this.timer.subscribe(value => {
            this.canPlaySound = true;
        });
    }

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

        this.client.on('notice', (channel, msgid, message) => {
            const msg = new Message('ADMIN', message, true, null);
            this.messaged.emit([channel, msg]);
        });

        this.client.on('join', this.onJoin);

        console.log(Object.getOwnPropertyNames(this.client.__proto__));
    }

    disconnect() {
        this.client.disconnect();
    }

    get connected() {
        if (this.client) {
          return this.client.readyState() === 'OPEN';
        }
        return false;
    }

    get readyState(): CONNECTIONSTATE {
        if (this.client) {
            switch (this.client.readyState()) {
                case 'CONNECTING':
                    return CONNECTIONSTATE.CONNETING;
                case 'OPEN':
                    return CONNECTIONSTATE.OPEN;
                case 'CLOSING':
                    return CONNECTIONSTATE.CLOSING;
                case 'CLOSED':
                    return CONNECTIONSTATE.CLOSED;
            }
        }

        return CONNECTIONSTATE.CLOSED;
    }

    handleMsg(target, context, msg: string, self) {
        const message = new Message(context['display-name'], msg, false, context['color']);
        this.messaged.emit([target, message]);

        if (!self && this.canPlaySound) {
          this.playNotifcationSound();
        }
    }

    playNotifcationSound() {
        const audio = new Audio();
        audio.src = 'assets/audio/notification.wav';
        audio.load();
        audio.play();
        this.canPlaySound = false;
    }

    sayMessage(channel, message) {
        if (this.client) {
            this.client.say(channel, message);
        }
    }

    joinChannel(channel: string) {
        if (this.client) {
            this.client.join(`#${channel}`).catch(err => this.error.emit(err));
        }
    }

    onJoin = (channel, username, self) => {
        const channelNoHash = channel.substr(1, channel.length);

        if (!this.connectedChannels.includes(channelNoHash)) {
            this.connectedChannels.push(channelNoHash);
            this.channelJoined.emit(channelNoHash);
        }
    }

    leaveChannel(channel: string) {
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
        const index = this.chats.findIndex(c => c.channel === channel);
        this.chats.splice(index, 1);
    }
}
