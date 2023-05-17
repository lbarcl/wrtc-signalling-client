import Pusher, { Channel } from "pusher-js";
import { EventEmitter } from "./eventemitter";

class Signal extends EventEmitter {
  private pusher: Pusher;
  private channel: Channel | null = null;
  private readonly signallingServer = "https://webrtc-signal.proxifi.ga";
  private socketId: string;
  roomId: string | null = null;
  
  constructor() {
    super();
    this.pusher = new Pusher("0992570237d9aef38843", {
      cluster: "eu",
      forceTLS: true
    });
    this.pusher.connect();
    this.socketId = this.pusher.connection.socket_id;
  }

  async createRoom(): Promise<string> {
    const response = await fetch(`${this.signallingServer}/rooms/create`, { method: "POST" });
    const id = await response.text();
    this.subscribeToChannel(id);
    return id;
  }

  async sendOffer(offer: string): Promise<string> {
    if (this.roomId) {
      await fetch(`${this.signallingServer}/rooms/${this.roomId}/offer`, { method: "POST", body: offer });
      const response = await fetch(`${this.signallingServer}/rooms/${this.roomId}/answer`);
      return response.text();
    } else {
      throw new Error("No room id available");
    }
  }

  async getOffer(id: string): Promise<string> {
    if (this.roomId) {
      this.subscribeToChannel(id);
      const response = await fetch(`${this.signallingServer}/rooms/${id}/offer`);
      return response.text();
    } else {
      throw new Error("No room id available");
    }
  }

  sendAnswer(answer: string) {
    if (this.roomId) {
      fetch(`${this.signallingServer}/rooms/${this.roomId}/answer`, { method: "POST", body: answer });
    } else {
      throw new Error("No room id available");
    }
  }

  async sendIce(ice: string) {
    const send = async () => {
      if (!this.socketId) {
        this.socketId = this.pusher.connection.socket_id;
        setTimeout(send, 500);
      } else {
        await fetch(`${this.signallingServer}/rooms/${this.roomId}/ice?socketID=${this.socketId}`, { method: "POST", body: ice });
      }
    };

    if (this.roomId) {
      await send();
    } else {
      throw new Error("No room id available");
    }
  }

  async closeRoom() {
    if (this.roomId && this.channel) {
      await fetch(`${this.signallingServer}/rooms/${this.roomId}`, { method: "DELETE" });
      this.channel.unsubscribe();
      this.channel = null;
    } else {
      throw new Error("No channel or room id available");
    }
  }

  private subscribeToChannel(id: string) {
    this.roomId = id;
    this.channel = this.pusher.subscribe(`cache-${id}`);
    this.socketId = this.pusher.connection.socket_id;
    this.channel.bind("ice", (ice: any) => {
      this.emit("ice", ice);
    });
  }
}

export default Signal;
