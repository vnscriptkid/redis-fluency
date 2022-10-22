import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    // console.log(await redis.info('memory'));
    // console.log(await redis.info('cpu'));
    // console.log(await redis.info('cluster'));
    // console.log(await redis.info('replication'));
    // console.log(await redis.info('clients'));
    // console.log(await redis.info('server'));

    console.log('Num of keys: ', await redis.dbsize());

    // console.log('Monitor commands: ', await redis.monitor())

    console.log('Client list: ', await redis.client('LIST'))



}


main();