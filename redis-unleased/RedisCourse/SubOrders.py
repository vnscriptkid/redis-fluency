import redis
import datetime
import time

r = redis.Redis(password='YOUR_PASSWORD', host='YOUR_ENDPOINT_HOST', port=YOUR_ENDPOINT_PORT)

while True:
	received = r.xread({"orders": '$'}, None, 0)

	print(received)

	for result in received:
		data = result[1]
		for tuple in data:
			orderDict = tuple[1];
			print(orderDict)

#	time.sleep(1)

