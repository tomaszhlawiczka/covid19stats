import logging
import httplib2
from itertools import zip_longest

from bs4 import BeautifulSoup

from . import models, settings


log = logging.getLogger(__name__)

fields_list = "total_cases,new_cases,total_deaths,new_deaths,total_recovered,new_recovered,active_cases,serious,total_cases_1m_pop,deaths_1m_pop,total_tests,total_tests_1m_pop,population".split(",")
all_fields = ["index", "country"] + fields_list + ["continent"]
fields_list_len = len(fields_list)


class ParsingError(ValueError):
    pass


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
        raise ParsingError("Missing table tag")

    if len(tables) > 1:
        raise ParsingError("Too many tables")

    found = 0

    for tr in tables[0].find_all('tr'):
        cls = tr.get("class") or []
        if "total_row" in cls:
            continue

        tds = tr.find_all("td")
        if not tds:
            continue

        index, country, *numbers, continent, case_every_X_ppl, death_every_X_ppl, test_every_X_ppl = [i.string for i in tds]

        if country is None or country == "World":
            continue

        if len(numbers) != fields_list_len:
            tds_formated = "\n" + '\n'.join(f"{idx}. \"{field or '-'}\" - {td}" for idx, (td, field) in enumerate(zip_longest(tds, all_fields)))
            log.error(f"Invalid row for the country {country} (unexpected fields number {len(numbers)} != {fields_list_len}): {tds_formated}")
            raise ParsingError("Invalid row")

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
