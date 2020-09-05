import { EvolveClient, EVENTS, Payload, MessageReaction } from "../../..";

export default class {
	constructor(client: EvolveClient, payload: Payload, shard: number) {
		client.emit(
			EVENTS.MESSAGE_REACTION_REMOVE,
			new MessageReaction(payload.d, client),
			shard
		);
	}
}
