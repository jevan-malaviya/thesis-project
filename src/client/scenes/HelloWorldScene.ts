import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js';

export default class HelloWorldScene extends Phaser.Scene {
	private client!: Colyseus.Client;
	constructor() {
		super('hello-world');
	}

	init() {
		this.client = new Colyseus.Client('ws://localhost:2567');
	}

	preload() {

	}

	async create() {
			const room = await this.client.joinOrCreate('my_room');

			console.log(room.sessionId);

			room.onMessage('keydown', (message) => {
				console.log(message);
			})

			this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
				room.send('keydown', event.key)
			});
		}


}

