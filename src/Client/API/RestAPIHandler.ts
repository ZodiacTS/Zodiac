/* eslint-disable @typescript-eslint/no-explicit-any */
import { EvolveClient, IAPIParams, CONSTANTS } from "../../mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";

export class RestAPIHandler {
	private _ratelimited = 0;
	private _lastFetchReturnHeader!: Headers;
	constructor(public client: EvolveClient) {}
  
	public async fetch(options: IAPIParams): Promise<any> {
		try {
			if (options.method !== "POST") {
				if(this._lastFetchReturnHeader) {
					const remaining = this._lastFetchReturnHeader.get("X-RateLimit-Remaining");
					const resetAfter = this._lastFetchReturnHeader.get("X-RateLimit-Reset");
					if(Number(remaining) == 0) {
						await sleep(Number(resetAfter));
						return this.fetch(options);
					}
				}
			  
				const fetched = await fetch(`${CONSTANTS.Api}/${options.endpoint}`, {
					method: options.method,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bot ${this.client.token}`,
					},
				});
  
				if (fetched.status === 429) {
					const json = await fetched.json();
					this.client.logger.warn(
						`Rate Limited. Reason: ${json.body}, Global: ${json.global}\n Don't Worry, your request will be retried after ${json.retry_after}`
					);
					this._ratelimited += 1;
					if (this._ratelimited === 50) {
						this.client.sharder.shutdown();
					}
					sleep(json.retry_after).then(() => {
						return this.fetch(options);
					});
				}
				
				this._lastFetchReturnHeader =  fetched.headers;
  
				return fetched.json();
			} else {
				if(this._lastFetchReturnHeader) {
					const remaining = this._lastFetchReturnHeader.get("X-RateLimit-Remaining");
					const resetAfter = this._lastFetchReturnHeader.get("X-RateLimit-Reset");
					if(Number(remaining) == 0) {
						await sleep(Number(resetAfter));
						return this.fetch(options);
					}
				}
  
				let body;
				if (options.postType == "Message") {
					body = JSON.stringify(options.message);
				} else if (options.postType == "Channel") {
					body = JSON.stringify(options.channel);
				}
  
				if (!body)
					throw this.client.logger.error("No Post Type Given in POST fetching");
  
				const fetched = await fetch(`${CONSTANTS.Api}/${options.endpoint}`, {
					method: options.method,
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bot ${this.client.token}`,
					},
					body: body,
				});
  
				if (fetched.status === 429) {
					const json = await fetched.json();
					this.client.logger.warn(
						`Rate Limited. Reason: ${json.body}, Global: ${json.global}\n Don't Worry, your request will be retried after ${json.retry_after}`
					);
					this._ratelimited += 1;
					if (this._ratelimited === 50) {
						this.client.sharder.shutdown();
					}
					sleep(json.retry_after).then(() => {
						return this.fetch(options);
					});
				}
				
				this._lastFetchReturnHeader = fetched.headers;
  
				return fetched.json();
			}
		} catch (e) {
			throw this.client.logger.error(e);
		}
	}
  }