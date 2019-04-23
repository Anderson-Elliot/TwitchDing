export class ChannelMessage {
    public channel: string;
    public messages: Message[];

    constructor (_channel: string) {
        this.channel = _channel;
        this.messages = [];
    }
}

export class Message {
    public user: string;
    public message: string;

    constructor (_user: string, _message: string) {
        this.user = _user;
        this.message = _message;
    }
}
