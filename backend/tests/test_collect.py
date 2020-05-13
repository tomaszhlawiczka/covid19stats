import pytest
import mock
from pathlib import Path
from httplib2 import Response

from .. import collector


def test_parser():

    with open(Path(__file__).parent / "COVID-19_Worldometer.html", "r") as input_data:
        assert len(list(collector.parse(input_data.read()))) == 214


def test_parser_no_table():

    with pytest.raises(ValueError):
        list(collector.parse('<html></html>'))


def test_parser_too_many_tables():

    with pytest.raises(ValueError):
        list(collector.parse('<html><body><table id="table#main_table_countries_today"></table><table id="table#main_table_countries_today"></table></body></html>'))


def test_parse_number():

    assert collector.parse_number(None) is None
    assert collector.parse_number('N/A') is None
    assert collector.parse_number("+8") == 8.0
    assert collector.parse_number("1,385,850") == 1385850.0
    assert collector.parse_number("1,385") == 1385.0
    assert collector.parse_number("1") == 1.0
    assert collector.parse_number("0") == 0.0

    with pytest.raises(ValueError):
        assert collector.parse_number("invalid") is None


def test_download_http200():

    with mock.patch('httplib2.Http.request', return_value=(Response({'status': 200, "content-type": "text/html; charset=UTF-8"}), "<html>response</html>")):
        print(collector.download('<URL>'))
        assert collector.download('<URL>') == "<html>response</html>"


def test_download_http500():

    with pytest.raises(IOError):
        with mock.patch('httplib2.Http.request', return_value=(Response({'status': 500, "content-type": "text/html; charset=UTF-8"}), "error")):
            assert collector.download('<URL>') == "response"


def test_download_http200_invalid_content_type():

    with pytest.raises(IOError):
        with mock.patch('httplib2.Http.request', return_value=(Response({'status': 200, "content-type": "application/json"}), "error")):
            assert collector.download('<URL>') == "response"
