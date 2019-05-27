import { EventEmitter } from 'events';
import YouTube from './clients/youtube';
class CommentListener extends EventEmitter {
    constructor({
        url,
        apiKey
    }) {
        super();
        this.url = url;
        this.apiKey = apiKey;
    }

    async init() {
        if (this.url.includes('youtu.be') || this.url.includes('youtube.com')) {
            this.client = new YouTube(this.url, this.apiKey);
            await this.client.init();
        }
    }

    connect() {
        this.client.on('comment', (comment) => {
            this.emit('comment', comment);
        });
        this.client.on('error', (e) => {
            this.emit('error', e);
        });
        this.client.connect();
    }

    disconnect() {
        this.client.disconnect();
    }
}

export default CommentListener;