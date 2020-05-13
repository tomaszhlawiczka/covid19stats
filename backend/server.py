import datetime
from flask import Flask, request

from . import models, settings


app = Flask(__name__)


@app.route('/api', methods=['GET'])
def index():
    countries = models.get_countries_names()

    return {
        'countries': countries
    }


# http://127.0.0.1:5000/api/countries?names=USA,Spain,Russia,UK

@app.route('/api/countries', methods=['GET'])
def countries():

    names = request.args["names"].split(",")
    data = models.get_countries_data(names)

    updated = datetime.datetime.now()
    data = {k: {**v, 'updated': updated} for k, v in data.items()}

    return {
        'stats': data
    }
