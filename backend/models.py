import json
import uuid
from redis import Redis

from . import settings


DB_KEY_NAME = "covid19-stats"


def connect():
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


# dataset - generator
def update(dataset):

    redis = connect()

    for x in range(1000):
        key = f'-{DB_KEY_NAME}:{uuid.uuid4()}:importing'

        if not redis.exists(key):
            break
    else:
        raise IOError("Redis is full?")

    try:
        for country, data in dataset:
            redis.hmset(key, {country.encode(): _encode_record(data).encode()})

        with redis.pipeline() as pipe:
            pipe.delete(DB_KEY_NAME)
            pipe.rename(key, DB_KEY_NAME)
            pipe.execute()

    except Exception as ex:
        redis.delete(key)
        raise


def get_countries_names():
    redis = connect()
    return [i.decode() for i in redis.hkeys(DB_KEY_NAME)]


def get_countries_data(countries):
    redis = connect()
    return {country: data and _decode_record(data) for country, data in zip(countries, redis.hmget(DB_KEY_NAME, countries))}
