## use cases
- caching
    - ssr: generated html of a static page `pagecache:singup`

## notes
- serialize, deserialize
    - values in redis are stored as strings
    - use cases: number, datetime...
- pipeline: execute multiple commands at a time
    - node-redis: Promise.all