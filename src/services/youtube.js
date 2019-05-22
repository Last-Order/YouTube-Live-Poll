import axios from 'axios';
export default class YouTube {
    static async getVideoId(url) {
        let videoId;
        if (url.includes('youtu.be')) {
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