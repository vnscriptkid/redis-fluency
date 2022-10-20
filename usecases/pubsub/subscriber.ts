import Redis from 'ioredis';
import os from 'os';


export type AppCommand = 'PING' | 'HOSTNAME' | 'DATE';

export class Subscriber {
    public processors: Map<AppCommand, () => void>

    constructor(private readonly redis: Redis) {
        this.processors = new Map([
            ['PING', this.pingProcessor.bind(this)],
            ['HOSTNAME', this.hostnameProcessor.bind(this)],
            ['DATE', this.dateProcessor.bind(this)],
        ])
    }

    pingProcessor() {
        console.log('PONG')
    }

    hostnameProcessor() {
        console.log(os.hostname())
    }

    dateProcessor() {
        console.log(new Date())
    }

    /**
     * Subscribe to multiple channels
     */
    async subscribe(...channels: string[]) {
        await this.redis.subscribe('global', ...channels)

        console.info(`[Subscriber.subscribe] ${channels}`)
    }

    listen() {
        console.info(`[Subscriber.listen] for events`)

        this.redis.on('message', (channel, command: AppCommand) => {
            if (this.processors.has(command)) {
                this.processors.get(command)!()
            } else {
                throw new Error('unknown command')
            }
        })
    }
}