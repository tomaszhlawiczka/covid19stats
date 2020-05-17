import json
import uuid
from redis import Redis

from . import settings


DB_KEY_NAME = "covid19-stats"


def connect():
    # It would be nice to use here redis.ConnectionPool
    return Redis(**settings.REDIS_DB)


def _encode_record(record):
    return json.dumps(
        (
            int(record['total_cases'] or 0),
            int(record['total_deaths'] or 0),
            int(record['total_recovered'] or 0),
            int(record['total_tests'] or 0),
            int(record['active_cases'] or 0)
        )
    )


def _decode_record(record):
    total_cases, total_deaths, total_recovered, total_tests, active_cases = json.loads(record)
    return {
        'total_cases': total_cases,
        'total_deaths': total_deaths,
        'total_recovered': total_recovered,
        'total_tests': total_tests,
        'active_cases': active_cases
    }


# dataset - generator of data: tuples of (country_name, values)
def update(dataset):

    redis = connect()

    # Downloaded data is stored to tmp key, then only in case of success, it is renamed to proper name, sth like trx commit.
    for x in range(1000):

        # The tmp key is random, to allow multiple downloads at the same time.
        key = f'-{DB_KEY_NAME}:{uuid.uuid4()}:importing'

        if not redis.exists(key):
            break
    else:
        # Of course, it should never happen
        raise IOError("Redis is full?")

    try:
        # Downloading and stroing in separated small calls to Redis.
        for country, data in dataset:
            redis.hmset(key, {country.encode(): _encode_record(data).encode()})

        # Commit it one call (atomic) to Redis
        with redis.pipeline() as pipe:
            pipe.delete(DB_KEY_NAME)
            pipe.rename(key, DB_KEY_NAME)
            pipe.execute()

    except Exception as ex:
        # In case of any problems, cleanup Redis.
        # An error might be caused while reading data from internet.
        redis.delete(key)
        raise


# Returns a list of all stored countries.
def get_countries_names():
    redis = connect()
    return [i.decode() for i in redis.hkeys(DB_KEY_NAME)]


# Returns stats for given countries.
# countries - list of strings (countries names)
def get_countries_data(countries):
    redis = connect()
    return {country: data and _decode_record(data) for country, data in zip(countries, redis.hmget(DB_KEY_NAME, countries))}
