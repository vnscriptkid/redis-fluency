import Redis from 'ioredis';
import { AppCommand } from './subscriber';

export class Publisher {
    constructor(private readonly redis: Redis) { }

    async publish(channel: string, command: AppCommand) {
        const result = await this.redis.publish(channel, command)

        console.info(`[Publisher.publish] ${command} => ${channel}`)

        return result;
    }

    async quit() {
        await this.redis.quit();
    }
}