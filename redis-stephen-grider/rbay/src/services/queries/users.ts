import { usersKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';

export const getUserByUsername = async (username: string) => {

};

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id));

    const exists = Object.keys(user).length > 0;

    if (!exists) return null;

    return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
    const userId = genId();

    await client.hSet(usersKey(userId), serialize(attrs));

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