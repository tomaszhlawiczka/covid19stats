import pytest
import mock
import json

from pathlib import Path
from httplib2 import Response

from .. import server


@pytest.fixture
def client():
    server.app.config['TESTING'] = True

    with server.app.test_client() as client:
        yield client


def test_get_api(client):

    with mock.patch('redis.StrictRedis.hkeys') as mock_redis_hkeys:

        def hkeys(key):
            return [b"Poland"]

        mock_redis_hkeys.side_effect = hkeys

        rv = client.get('/api')

        assert rv.status_code == 200

        response = json.loads(rv.data)

        assert 'countries' in response
        assert 'Poland' in response['countries']


def test_get_api_countries_stats(client):

    with mock.patch('redis.StrictRedis.hmget') as mock_redis_hmget:

        def hmget(key, fields):
            assert fields == ["Poland", "Cameroon"]

            return list(map(json.dumps, [[123, 456, 789, 234, 567], [567, 123, 456, 789, 234]]))

        mock_redis_hmget.side_effect = hmget

        rv = client.get('/api/countries?names=Poland,Cameroon')

        assert rv.status_code == 200

        response = json.loads(rv.data)

        assert 'stats' in response
        assert 'Poland' in response['stats']
        assert 'Cameroon' in response['stats']


def test_get_api_countries_missing_params(client):

    rv = client.get('/api/countries')
    assert rv.status_code == 400


def test_get_api_countries_invalid_method(client):

    rv = client.post('/api/countries')
    assert rv.status_code == 405
