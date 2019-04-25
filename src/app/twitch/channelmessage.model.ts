export class ChannelMessage {
    public channel: string;
    public messages: Message[];
    public front: boolean;

    constructor (_channel: string) {
        this.channel = _channel;
        this.messages = [];
        this.front = false;
    }
}

export class Message {
    public user: string;
    public message: string;
    public isNotice: boolean;
    public color: string;

    constructor (_user: string, _message: string, _isNotice?: boolean, _color?: string) {
        this.user = _user;
        this.message = _message;
        this.isNotice = _isNotice || false;
        this.color = _color || '#ffffff';
    }
}
