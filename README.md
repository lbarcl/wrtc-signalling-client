# wrtc-signalling-client

The `wrtc-signalling-client` module is a TypeScript library designed for browser-side JavaScript. It provides a signaling client for WebRTC (Web Real-Time Communication) applications. This client handles the exchange of signaling messages between peers to establish and manage WebRTC connections.

> Note: Just use this module with `npm` other package managers didn't work on me.
> Feel free to contribute. 

## Description

WebRTC enables real-time communication between browsers, allowing applications to establish peer-to-peer connections for audio, video, and data transfer. However, establishing these connections requires a signaling mechanism to exchange session control information between peers.

The `wrtc-signalling-client` module offers a convenient solution for handling the signaling aspect of WebRTC applications. It provides a high-level API for creating rooms, sending and receiving offers and answers, exchanging ICE candidates, and closing rooms. The module encapsulates the complexity of signaling and allows developers to focus on building their WebRTC applications.

With the `wrtc-signalling-client` module, you can easily integrate signaling functionality into your browser-based WebRTC applications. It abstracts the underlying signaling protocol, providing a clean and intuitive interface for signaling operations.

## Installation

You can install the `wrtc-signalling-client` module using npm:

```bash
npm install wrtc-signalling-client
```

## API

#### `Signal` Class

The `Signal` class represents a signaling client for WebRTC applications.

##### Constructor

```typescript
const signal = new Signal("<pusher key>", "<wrtc-signaling-server>", {"pusher": "options"});
```

Creates a new instance of the `Signal` class.

##### `createRoom(): Promise<string>`

Creates a new room and returns its ID as a promise.

- Returns:
  - `room ID`: The room ID of the new room.

##### `sendOffer(offer: string): Promise<string>`

Sends an offer to the signaling server and returns a promise with the answer from to other peer.
> `sendOffer()` will not resolve until the answer is sended.
> Its a loong polling function.

- Parameters:
  - `offer` (string): The offer data to send.

- Returns:
  - `SDP answer` (string): The answer sended by the other peer.

##### `getOffer(id: string): Promise<string>`

Retrieves an offer from the signaling server based on the specified room ID and returns it as a promise.
> Note that, `getOffer()` is loong polling function.

- Parameters:
  - `id` (string): The ID of the room that offer sended.

- Returns:
  - `SDP offer` (string): The offer sended by the peer that want the connection.

##### `sendAnswer(answer: string): void`

Sends an answer to the signaling server.

- Parameters:
  - `answer` (string): The answer data to send.

##### `sendIce(ice: string): Promise<void>`

Sends an ICE (Interactive Connectivity Establishment) candidate to the signaling server.

- Parameters:
  - `ice` (string): The ICE candidate data to send.

##### `closeRoom(): Promise<void>`

Closes the current room and leaves the Pusher channel.

##### `joinRoom(id: string): Promise<void>`

Joins the room with given room id and connects to pusher channel.
> You don't need to call `joinRoom()`. It automatically calls when `createRoom()` & `getOffer()` are called.

- Parameters:
  - `id` (string): The room Id to join.

##### Events

The `Signal` class emits the following event:

###### `ice`

Fired when a new ICE candidate is received.

- Parameters:
  - `ice` (string): The received ICE candidate.

##### Example Usage

```typescript
import Signal from 'wrtc-signalling-client';

const signal = new Signal();

signal.createRoom()
  .then((roomId) => {
    console.log('Created room with ID:', roomId);
  })
  .catch((error) => {
    console.error('Error creating room:', error);
  });

signal.sendOffer('offer data')
  .then((answer) => {
    console.log('Received SDP answer:', asnwer);
  })
  .catch((error) => {
    console.error('Error sending offer:', error);
  });

signal.getOffer('roomId')
  .then((offer) => {
    console.log('Retrieved offer:', offer);
  })
  .catch((error) => {
    console.error('Error getting offer:', error);
  });

signal.sendAnswer('answer data');

signal.sendIce('ice data')
  .then(() => {
    console.log('ICE candidate sent successfully');
  })
  .catch((error) => {
    console.error('Error sending ICE candidate:', error);
  });

signal.closeRoom()
  .then(() => {
    console.log('Room closed');
  })
  .catch((error) => {
    console.error('Error closing room:', error);
  });

signal.on('ice', (ice) => {
  console.log('Received ICE candidate:', ice);
});
```

Please note that the code examples above demonstrate the usage of the `Signal` class functions and event handling. You may need to handle promise rejections and errors appropriately in your application.

## Contributing

Contributions to the `wrtc-signalling-client` module are welcome. If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/lbarcl/wrtc-signalling-client).

Please make sure to follow the repository's guidelines for contributing.

## License

The `wrtc-signalling-client` module is licensed under the [MIT License](https://github.com/lbarcl/wrtc-signalling-client/blob/master/LICENSE).

## Contact

If you have any questions or need further assistance, you can reach out to the author of the `wrtc-signalling-client` module through their GitHub profile: [lbarcl](https://github.com/lbarcl).
