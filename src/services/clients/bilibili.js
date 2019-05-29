import { EventEmitter } from 'events';
import axios from 'axios';
const { DanmuProvider, DanmuAutoParseStream } = require('danmulive');

export default class Bilibili extends EventEmitter {
    constructor(url) {
        super();
        this.url = url;
    }

    async init() {
        this.roomId = await Bilibili.getRoomId(this.url);
        this.danmuParser = new DanmuAutoParseStream();
        this.danmuProvider = new DanmuProvider(this.roomId, this.danmuParser);
    }

    async connect() {
        this.danmuProvider.connect();
        this.danmuParser.on("data", data => {
            if (data.type == "danmu") {
                if (data.value.cmd.startsWith("DANMU_MSG")) {
                    let userId = data.value.info[2][1];
                    let message = data.value.info[1];
                    this.emit('comment', {
                        message,
                        userId
                    });
                }
            }
        });
    }

    disconnect() {
        this.danmuProvider.disconnect();
    }

    static async getRoomId(url) {
        const roomId = new URL(url).pathname.slice(1);
        if (roomId.length < 4) {
            // 短号
            const roomInfo = (await axios.get(`https://api.live.bilibili.com/room/v1/Room/get_info?id=${roomId}`)).data;
            return roomInfo.data.room_id;
        }
        return parseInt(roomId);
    }
}