export const sessionsKey = (sessionKey: string) => `sessions#${sessionKey}`;

export const itemsKey = (itemId: string) => `items#${itemId}`;

// hash `users#1` { username: coolkid, birthday: '21-09-1995', ... }
export const usersKey = (userId: string) => `users#${userId}`;
// set `users#1:likes` { item1, item2, item3 }
export const userLikesKey = (userId: string) => `users#${userId}:likes`;
// set `usernames:unique` { user1, user2, user3 }
export const usernamesUniqueKey = () => `usernames:unique`;
// sorted set `usernames` { value: 'userabc', score: 123 }
export const usernamesKey = () => `usernames`;