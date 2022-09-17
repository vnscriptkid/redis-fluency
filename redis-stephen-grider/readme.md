## use cases
- caching
    - ssr: generated html of a static page `pagecache:singup`

## notes
- serialize, deserialize
    - values in redis are stored as strings
    - use cases: number, datetime...
- pipeline: execute multiple commands at a time
    - node-redis: Promise.all
- set use cases:
    - enforce uniqueness
    - rel btw resources: user#1:likes { item#1, item#2 }
    - common things: user#1 and user#2 both like => intersect
    - list of things not in order 

## set ops
- `sadd usernames:unique thanh`
- `smembers usernames:unique`

## sortedset ops
- `zadd usernames 123 thanh` -> usernames { value: 'thanh', score: 123 }
- `zscore usernames thanh` -> 123
- `zincrby items:views 1 itemxyz`
- `zrange items:endingAt 123456789 +inf byscore LIMIT 0 10`

## hash ops
- `hincrby item1 price 2` -> increment price of item1 by 2
- `hgetall users#f9ec65`