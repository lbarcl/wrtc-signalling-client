import { EventEmitter } from "./eventemitter";
declare class Signal extends EventEmitter {
    private pusher;
    private channel;
    private readonly signallingServer;
    private socketId;
    roomId: string | null;
    constructor();
    createRoom(): Promise<string>;
    sendOffer(offer: string): Promise<string>;
    getOffer(id: string): Promise<string>;
    sendAnswer(answer: string): void;
    sendIce(ice: string): Promise<void>;
    closeRoom(): Promise<void>;
    private subscribeToChannel;
}
export default Signal;
