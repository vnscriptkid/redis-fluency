const Redis = require("ioredis");
const redis = new Redis();

const processMessage = (message: any) => {
    console.log("Id: %s. Data: %O", message[0], message[1]);
};

async function listenForMessage(lastId = "$") {
    console.log('START listenForMessage')
    // `results` is an array, each element of which corresponds to a key.
    // Because we only listen to one key (mystream) here, `results` only contains
    // a single element. See more: https://redis.io/commands/xread#return-value
    const results = await redis.xread("block", 0, "STREAMS", "orders", lastId);
    console.log('results: ', results);
    const [key, messages] = results[0]; // `key` equals to "mystream"

    messages.forEach(processMessage);

    // Pass the last id of the results to the next round.
    await listenForMessage(messages[messages.length - 1][0]);
}

listenForMessage();