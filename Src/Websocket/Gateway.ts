import { EvolveSocket } from './Websocket';
import { OPCODE } from '../Constants/OpCodes';
import { Payload } from '../Interfaces/Interfaces';
import { Heartbeat, Identify } from '../Constants/Payloads';


export function Gateway(data: any, ws: EvolveSocket) {
	try {
		let payload: Payload = JSON.parse(data);
		const { op, t, d } = payload;
		if (!d) return;

		if (op === OPCODE.Hello) {
			// Command: Heartbeat
			setInterval(() => {
				if (ws.seq) Heartbeat.d = ws.seq;
				ws.send(JSON.stringify(Heartbeat));
			}, d.heartbeat_interval);

			// Command: Identify
			Identify.d.token = ws.client.token 
			Identify.d.intents = ws.intents
			Identify.d.shards = ws.shardArray
			ws.send(JSON.stringify(Identify));
		}
		else if (op === OPCODE.Reconnect) {
			//console.log(payload);
		}
		else if (op === OPCODE.Invalid) {
			//console.log(payload);
		}
		else if (t) {
			try {
					const { default: handler } = require(`../Events/${t}`);
					console.log(t)
					new handler(ws.client, payload);
			} catch (e) {
				throw Error(e);
			}
		}
	} catch (e) {
		throw Error(e);
	}
}
