import Redis from 'ioredis';

async function main() {
    const redis = new Redis();
    await redis.flushall();

    const result = await redis.pipeline()
        .set('name', 'thanh')
        .set('age', 27)
        .get('name')
        .get('age')
        .exec()

    if (result) {
        const [[, setNameResult], [, setAgeResult], [, getNameResult], [, getAgeResult]] = result;

        console.log(setNameResult, setAgeResult, getNameResult, getAgeResult);

    }
}


main();

