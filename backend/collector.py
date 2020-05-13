import logging
import httplib2

from bs4 import BeautifulSoup

from . import models, settings


log = logging.getLogger(__name__)
fields_list = "total_cases,new_cases,total_deaths,new_deaths,total_recovered,active_cases,serious,critical,total_cases_1m_pop,deaths_1m_pop,total_tests".split(",")


def download(url):

    http = httplib2.Http()
    log.debug(f"Opening URL {url}")
    response, content = http.request(url)

    log.debug(f"Got response: status={response.status} content-type=\"{response['content-type']}\"")

    if response.status != 200:
        raise IOError("Cannot get data")

    if response['content-type'] != "text/html; charset=UTF-8":
        raise IOError("Ivalid content type")

    return content


def parse_number(num):
    if num is None:
        return None

    num = num.strip()
    if num in ('N/A', ''):
        return None

    return float(num.replace(',', '').replace('+', ''))


def parse(content):

    html = BeautifulSoup(content, features="html.parser")

    tables = html.select("table#main_table_countries_today")
    if not tables:
        raise ValueError("Missing table tag")

    if len(tables) > 1:
        raise ValueError("Too many tables")

    found = 0

    for tr in tables[0].find_all('tr'):
        cls = tr.get("class") or []
        if "total_row" in cls:
            continue

        tds = tr.find_all("td")
        if not tds or len(tds) != 13:
            continue

        country, *numbers, continent = [i.string for i in tds]

        if country is None or country == "World":
            continue

        try:
            yield country, dict(zip(fields_list, map(parse_number, numbers)))
            found += 1
        except ValueError as ex:
            log.error(f"Invalid number value for the country {country}: {tds}")

    log.debug(f"Parsing finished, found countries: {found}")


def main():

    content = download(settings.SRC_URL)
    models.update(parse(content))


if __name__ == "__main__":
    main()
