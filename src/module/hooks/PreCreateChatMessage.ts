import Settings from "../Settings";
import SadnessChan from "../SadnessChan";
import NamelessChan from "../NamelessChan";
import Utils from "../Utils";

class PreCreateChatMessage {
    private static _instance: PreCreateChatMessage;
    private readonly _sadnessCommand: string = '!sadness';
    private readonly _namelessCommand: string = '!nameless';

    private constructor() {
    }

    public static getInstance(): PreCreateChatMessage {
        if (!PreCreateChatMessage._instance) PreCreateChatMessage._instance = new PreCreateChatMessage();
        return PreCreateChatMessage._instance;
    }

    public preCreateChatMessageHook(message: any, options: any): void {
        const content = message?.content;
        const user = message?.user;
        const counter = Settings.getCounter();
        if (!(user && content)) return

        if (content === this._sadnessCommand && counter && counter[user]) {
            this._sendStatsMessage(message, options, counter[user], user);
            Utils.debug('Sad stats displayed.');
        }

        if (content === this._namelessCommand) {
            this._sendNamesMessage(message, options, content, user);
            Utils.debug('Nameless chan gave you names.');
        }
    }

    private _sendStatsMessage(message: any, options: any, userData: any, userId: string): void {
        message.content = SadnessChan.getStatsMessage(userData);
        this._prepareMessage(message, options, userId);
    }

    private _sendNamesMessage(message: any, options: any, content: string, userId: string): void {
        message.content = NamelessChan.getNamesMessage(content);
        this._prepareMessage(message, options, userId);
    }

    private _prepareMessage(message: any, options: any, userId: string): void {
        message.whisper = [userId];
        message.speaker = {alias: `${Utils.moduleTitle}`};
        options.chatBubble = false;
    }
}

export default PreCreateChatMessage.getInstance();