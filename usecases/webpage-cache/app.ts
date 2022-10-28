import express from 'express';
import { cacheRequest } from './cache';

export function createApp(PORT = 3000) {
    const app = express();

    app.use(express.json())

    app.get('/hello', cacheRequest, (req, res) => {
        res.send({ hello: true })
    })

    app.get('/hello/:number', cacheRequest, (req, res) => {
        res.send({ hello: req.params.number })
    })

    app.post('/hi', (req, res) => {
        res.send({ hi: true })
    })

    return new Promise<void>(resolve => {
        app.listen(PORT, () => {
            console.log(`server is listening on port ${PORT}`)
            resolve()
        })
    })
}