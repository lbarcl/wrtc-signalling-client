var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Pusher from "pusher-js";
import { EventEmitter } from "./eventemitter";
class Signal extends EventEmitter {
    constructor() {
        super();
        this.channel = null;
        this.signallingServer = "https://webrtc-signal.proxifi.ga";
        this.roomId = null;
        this.pusher = new Pusher("0992570237d9aef38843", {
            cluster: "eu",
            forceTLS: true
        });
        this.pusher.connect();
        this.socketId = this.pusher.connection.socket_id;
    }
    createRoom() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this.signallingServer}/rooms/create`, { method: "POST" });
            const id = yield response.text();
            this.subscribeToChannel(id);
            return id;
        });
    }
    sendOffer(offer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.roomId) {
                yield fetch(`${this.signallingServer}/rooms/${this.roomId}/offer`, { method: "POST", body: offer });
                const response = yield fetch(`${this.signallingServer}/rooms/${this.roomId}/answer`);
                return response.text();
            }
            else {
                throw new Error("No room id available");
            }
        });
    }
    getOffer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.roomId) {
                this.subscribeToChannel(id);
                const response = yield fetch(`${this.signallingServer}/rooms/${id}/offer`);
                return response.text();
            }
            else {
                throw new Error("No room id available");
            }
        });
    }
    sendAnswer(answer) {
        if (this.roomId) {
            fetch(`${this.signallingServer}/rooms/${this.roomId}/answer`, { method: "POST", body: answer });
        }
        else {
            throw new Error("No room id available");
        }
    }
    sendIce(ice) {
        return __awaiter(this, void 0, void 0, function* () {
            const send = () => __awaiter(this, void 0, void 0, function* () {
                if (!this.socketId) {
                    this.socketId = this.pusher.connection.socket_id;
                    setTimeout(send, 500);
                }
                else {
                    yield fetch(`${this.signallingServer}/rooms/${this.roomId}/ice?socketID=${this.socketId}`, { method: "POST", body: ice });
                }
            });
            if (this.roomId) {
                yield send();
            }
            else {
                throw new Error("No room id available");
            }
        });
    }
    closeRoom() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.roomId && this.channel) {
                yield fetch(`${this.signallingServer}/rooms/${this.roomId}`, { method: "DELETE" });
                this.channel.unsubscribe();
                this.channel = null;
            }
            else {
                throw new Error("No channel or room id available");
            }
        });
    }
    subscribeToChannel(id) {
        this.roomId = id;
        this.channel = this.pusher.subscribe(`cache-${id}`);
        this.socketId = this.pusher.connection.socket_id;
        this.channel.bind("ice", (ice) => {
            this.emit("ice", ice);
        });
    }
}
export default Signal;
