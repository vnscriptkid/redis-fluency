import Redis from "ioredis";

export class Queue {
    public timeout: number;

    constructor(
        public readonly redis: Redis,
        public readonly name: string
    ) {
        this.timeout = 0;
        this.process = this.process.bind(this);
    }

    async enqueue(payload: string) {
        // LPUSH  (1) -> [   2  3 ]
        //               [  (1)  2  3 ]

        console.info(`[Queue.enqueue] lpush start`)
        await this.redis.lpush(this.queueName, payload);
        console.info(`[Queue.enqueue] lpush end`)
    }

    async dequeue() {
        // numbers [  2  3 (1) ] -> BRPOP
        const result = await this.redis.brpop(this.queueName, this.timeout);
        // [numbers, 1]

        return result?.[1];
    }

    async process(callback: (payload: any) => void) {
        console.info(`[Queue.process] init`)
        while (true) {
            console.info(`[Queue.process] loop start`)
            const itemOut = await this.dequeue();
            console.info(`[Queue.process] dequeued`)

            if (itemOut) {
                callback(itemOut);
            }
            console.info(`[Queue.process] processed one`)

            await wait(0); // avoid blocking
            console.info(`[Queue.process] loop end`)
        }
    }

    get queueName(): string {
        return `queue:${this.name}`
    }
}

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}