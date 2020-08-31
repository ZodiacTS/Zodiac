/* eslint-disable no-mixed-spaces-and-tabs */
import RestAPIHandler from "./RestAPIHandler";
import { EvolveClient, CHANNELTYPES } from "../..";
import { Guild } from "../../Structures/Guild/Guild";
import CategoryChannel from "../../Structures/Channel/CategoryChannel";
import DMChannel from "../../Structures/Channel/DMChannel";
import GroupChannel from "../../Structures/Channel/GroupChannel";
import NewsChannel from "../../Structures/Channel/NewsChannel";
import StoreChannel from "../../Structures/Channel/StoreChannel";
import TextChannel from "../../Structures/Channel/TextChannel";
import VoiceChannel from "../../Structures/Channel/VoiceChannel";
import { User } from "../../Structures/User/User";
import { GuildMember } from "../../Structures/Guild/GuildMember";
import { Message } from "../../Structures/Message/Message";
import Channel from "../../Structures/Channel/Channel";
import { MessageEmbed } from "../../Utils/Embed/MessageEmbed";

const Channels = [TextChannel, DMChannel, VoiceChannel, GroupChannel, CategoryChannel, NewsChannel, StoreChannel];

/**
 * API CLASS
 *
 * @param {client} - Your EvolveClient
 */
export default class API {
    public client: EvolveClient;

    constructor(client: EvolveClient) {
    	this.client = client;
    }


    public async getGuild(guildID: string): Promise<Guild> {
    	return new Guild(await RestAPIHandler(this.client, {
    		endpoint: `guilds/${ guildID }`,
    		method: "GET"
    	}), this.client);
    }

    public async getGuildChannels(guildID: string): Promise<Channel[]> {
    	const channel = await RestAPIHandler(this.client, {
    		endpoint: `guilds/${ guildID }/channels`,
    		method: "GET"
    	});
    	const channelArray = [];

    	for (let i = 0; i < channel.length; i++) {
    		const c = channel[i];
    		channelArray.push(new Channels[c.type](c, this.client));
    	}

    	return channelArray;
    }

    public async getAuditLogs(guildID: string): Promise<void> {
    	return await RestAPIHandler(this.client, {
    		endpoint: `/guilds/${ guildID }/audit-logs`,
    		method: "POST"
    	}); 
    }

    public async getUser(userID: string): Promise<User> {
    	return new User(await RestAPIHandler(this.client, {
    		endpoint: `users/${ userID }`,
    		method: "GET"
    	}));
    }

    public async getGuildMembers(guildID: string): Promise<GuildMember[]> {
    	const memberArray = new Array<GuildMember>();
    	const member = await RestAPIHandler(this.client, {
    		endpoint: `guilds/${ guildID }/members`,
    		method: "GET"
    	});

    	for (const m of member) {
    		memberArray.push(m);
    	}

    	return memberArray;
    }

    public async sendMessage(content: string | MessageEmbed, channelID: string): Promise<Message> {
    	return new Message(await RestAPIHandler(this.client, {
    		endpoint: `channels/${ channelID }/messages`,
    		method: "POST",
    		content: content
    	}), this.client);
    }

    public async deleteMessage(messageID: string, channelID: string, time: number): Promise<NodeJS.Timeout> {
    	return setTimeout(async () => {
    		return await RestAPIHandler(this.client, {
    			endpoint: `/channels/${ channelID }/messages/${ messageID }`,
    			method: "DELETE"
    		});
    	}, time);
    }

    public async banAdd(guildID: string, userID: string): Promise<void> {
    	return await RestAPIHandler(this.client, {
    		endpoint: `guilds/${ guildID }/bans/${ userID }`,
    		method: "PUT"
    	});
    }

    public async banRemove(userID: string, guildID: string): Promise<void> {
    	return await RestAPIHandler(this.client, {
    		endpoint: `guilds/${ guildID }/bans/${ userID }`,
    		method: "DELETE"
    	});
    }

    public async getChannel(channelID: string): Promise<Channel> {
    	const c = await RestAPIHandler(this.client, {
    		endpoint: `/channels/${ channelID }`,
    		method: "GET"
    	});

    	if (c.type === CHANNELTYPES.Category) {
    		return (new CategoryChannel(c, this.client));
    	} else if (c.type === CHANNELTYPES.Direct) {
    		return (new DMChannel(c, this.client));
    	} else if (c.type === CHANNELTYPES.Group) {
    		return (new GroupChannel(c, this.client));
    	} else if (c.type === CHANNELTYPES.News) {
    		return (new NewsChannel(c, this.client));
    	} else if (c.type === CHANNELTYPES.Store) {
    		return (new StoreChannel(c, this.client));
    	} else if (c.type === CHANNELTYPES.Text) {
    		return (new TextChannel(c, this.client));
    	} else if (c.type === CHANNELTYPES.Voice) {
    		return (new VoiceChannel(c, this.client));
    	}
    	return c;
    }
}