# Redis in action

## Part 1
- redis vs memcached
    - redis: map string-(string,hash,list,set,sortedset)
    - memcached: simple, string-to-string
- scaling capabilities:
    - master-slave: scale reads, failover (write to master, read from slaves)
    - client-sharding: scale writes
- storage patterns:
    - sql db as primary (source of trurth), redis as secondary
    - redis as primary