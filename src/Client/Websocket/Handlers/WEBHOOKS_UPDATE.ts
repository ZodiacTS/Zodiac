import { EvolveClient, EVENTS, Payload } from "../../..";
import { Webhook } from "../../../Structures/Guild/Webhook";

export default class {
  constructor(client: EvolveClient, payload: Payload, shard: number) {
    client.emit(EVENTS.WEBHOOKS_UPDATE, new Webhook(payload.d, client), shard);
  }
}
