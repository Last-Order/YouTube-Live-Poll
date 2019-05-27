import axios from 'axios';
import utils from '../../utils/common';
import { EventEmitter } from 'events';
export default class YouTube extends EventEmitter {
    constructor(url, apiKey) {
        super();
        this.url = url;
        this.apiKey = apiKey;
    }
    async init() {
        this.status = "idle";
        this.videoId = await YouTube.getVideoId(this.url);
        this.chatId = await YouTube.getChatId(this.videoId, this.apiKey);
    }
    async connect() {
        this.status = "polling";
        this.startedAt = new Date();
        // eslint-disable-next-line
        while (true) {
            if (this.status === "idle") {
                // exit when stop
                break;
            }
            try {
                const messages = await YouTube.getChatMessages(
                    this.chatId,
                    this.apiKey,
                    this.nextPageToken
                );
                this.nextPageToken = messages.nextPageToken;
                for (const item of messages.items) {
                    // empty message
                    if (!item.snippet.displayMessage) {
                        continue;
                    }
                    // send before start
                    if (
                        new Date(item.snippet.publishedAt).valueOf() <
                        this.startedAt.valueOf()
                    ) {
                        continue;
                    }
                    const userChannelId = item.authorDetails.channelId;
                    this.emit('comment', {
                        message: item.snippet.displayMessage,
                        userId: userChannelId
                    });
                }
                // cooldown
                await utils.sleep(messages.pollingIntervalMillis);
            } catch (e) {
                this.emit('error', e);
                await utils.sleep(3000);
            }
        }
    }
    async disconnect() {
        this.status = 'idle';
    }
    static async getVideoId(url) {
        let videoId;
        if (url.includes('youtu.be/')) {
            videoId = url.match(/\/(.+)/)[1];
        } else if (url.includes('channel')) {
            // get later
        } else if (url.includes('user')) {
            // get later
        } else {
            return new URLSearchParams(new URL(url).search).get('v');
        }
        const page = await axios.get(url);
        if (url.endsWith('/live')) {
            videoId = page.data.match(/{\\"videoId\\":\\"(.+?)\\"/)[1];
        } else {
            throw new Error('Not Supported');
        }
        return videoId;
    }
    static async getChatId(videoId, apiKey) {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`;
        const result = (await axios.get(url)).data;
        return result.items[0].liveStreamingDetails.activeLiveChatId;
    }
    static async getChatMessages(chatId, apiKey, pageToken) {
        let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet,authorDetails&liveChatId=${chatId}&key=${apiKey}`;
        if (pageToken) {
            url += `&pageToken=${pageToken}`;
        }
        const result = (await axios.get(url)).data;
        return result;
    }
}