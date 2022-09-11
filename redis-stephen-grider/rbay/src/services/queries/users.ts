import { usernamesKey, usernamesUniqueKey, usersKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';

export const getUserByUsername = async (username: string) => {
    const userIdBase10 = await client.zScore(usernamesKey(), username);

    if (!userIdBase10) {
        throw new Error(`username #${username} not found`);
    }

    const userIdBase16 = userIdBase10.toString(16);

    const user = await client.hGetAll(usersKey(userIdBase16))

    if (!user) {
        throw new Error(`user's hash not found`);
    }

    return deserialize(userIdBase16, user);
};

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id));

    const exists = Object.keys(user).length > 0;

    if (!exists) return null;

    return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
    const userId = genId();

    if (await client.sIsMember(usernamesUniqueKey(), attrs.username)) {
        console.log(`username ${attrs.username} already exists`)
        throw new Error('username is taken');
    }

    await client.hSet(usersKey(userId), serialize(attrs));

    await client.sAdd(usernamesUniqueKey(), attrs.username);

    await client.zAdd(usernamesKey(), {
        value: attrs.username,
        score: parseInt(userId, 16)
    })

    return userId;
};

export const serialize = (attrs: CreateUserAttrs) => {
    return {
        username: attrs.username,
        password: attrs.password
    }
}

export const deserialize = (id: string, user: { [key: string]: string }) => {
    return {
        username: user.username,
        password: user.password,
        id
    }
}