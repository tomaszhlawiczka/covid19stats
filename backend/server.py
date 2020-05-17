import datetime
from flask import Flask, request, abort

from . import models, settings


app = Flask(__name__)


# Returns a simple list of countries.
@app.route('/api', methods=['GET'])
def index():
    countries = models.get_countries_names()

    return {
        'countries': countries
    }


# Returns stats data for given countries in GET param "names".
# List of countries should be separated by commas (",").
# http://127.0.0.1:5000/api/countries?names=USA,Spain,Russia,UK

@app.route('/api/countries', methods=['GET'])
def countries():

    if "names" not in request.args:
        abort(400, 'Missing GET param names')

    names = request.args["names"].split(",")
    data = models.get_countries_data(names)

    updated = datetime.datetime.now()
    data = {k: {**v, 'updated': updated} for k, v in data.items()}

    return {
        'stats': data
    }
