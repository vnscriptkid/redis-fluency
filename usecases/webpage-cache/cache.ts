import { NextFunction, Response, Request } from 'express';
import Redis from 'ioredis';
import crypto from 'crypto';

export const redis = new Redis();

export async function cacheRequest(req: Request, res: Response, next: NextFunction) {
    const hashValue = hashRequest(req);

    const cachedValue = await redis.get(hashValue);

    if (cachedValue) {
        console.log(`[cacheRequest] cache HIT`)
        try {
            return res.send(JSON.parse(cachedValue))
        } catch (err) {
            return res.send(cachedValue)
        }
    }

    // monkey patch res object
    const oldSend = res.send.bind(res);

    (res as any).send = async function (returnValue: string | object) {
        await redis.set(hashValue, typeof returnValue === 'object' ? JSON.stringify(returnValue) : returnValue, 'EX', 10)
        return oldSend(returnValue);
    }

    console.log(`[cacheRequest] cache MISS`)
    next();
}

function hashRequest(req: Request) {
    const elements = {
        path: req.path,
        query: req.query,
        body: req.body
    }

    const signature = JSON.stringify(elements);

    return crypto.createHash('md5').update(signature).digest('hex')
}
