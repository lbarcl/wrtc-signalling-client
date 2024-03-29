import Pusher, { Channel, Options } from "pusher-js";

type Listener<T> = (data: T) => void;

interface Event<T> {
  name: string;
  data: T;
}

class EventEmitter {
  private listeners: { [eventName: string]: Listener<any>[] } = {};

  public on<T>(eventName: string, listener: Listener<T>): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  public off<T>(eventName: string, listener: Listener<T>): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (l) => l !== listener
      );
    }
  }

  public emit<T>(eventName: string, data: T): void {
    const event: Event<T> = {
      name: eventName,
      data: data,
    };
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) =>
        listener(event as any)
      );
    }
  }
}

class Signal extends EventEmitter {
  private pusher: Pusher;
  private channel: Channel | null = null;
  private signallingServer: string;
  private socketId: string;
  roomId: string | null = null;
  
  constructor(pusherKey: string, signallingServer: string, pusherOptions: Options) {
    super();
    this.signallingServer = signallingServer;
    this.pusher = new Pusher(pusherKey, pusherOptions);
    this.pusher.connect();
    this.pusher.bind("connected", () => {
      this.socketId = this.pusher.connection.socket_id;
    })
  }

  async createRoom(): Promise<string> {
    const response = await fetch(`${this.signallingServer}/rooms/create`, { method: "POST" });
    const id = await response.text();
    this.joinRoom(id);
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
    if (id) {
      this.joinRoom(id);
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

  private joinRoom(id: string) {
    this.roomId = id;
    this.channel = this.pusher.subscribe(`cache-${id}`);
    this.channel.bind("ice", (ice: any) => {
      this.emit("ice", ice);
    });
  }
}

export default Signal;
