import csv
import redis

r = redis.Redis(password='YOUR_PASSWORD', host='YOUR_ENDPOINT_HOST', port=YOUR_ENDPOINT_PORT)


with open("OnlineRetail.csv", encoding='utf-8-sig') as csvf:
	csvReader = csv.DictReader(csvf)

	for row in csvReader:
		r.xadd("orders", row)
