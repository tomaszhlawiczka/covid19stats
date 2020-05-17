
import logging
import logging.config


SRC_URL = 'https://www.worldometers.info/coronavirus/'

REDIS_DB = {
    'host': 'localhost',
    'port': 6379,
    'db': 31,
    'password': None
}


logging.config.dictConfig({
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'console': {
            'formatter': 'standard',
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        }
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'DEBUG',
        }
    }
})


import httplib2  # noqa: E402
httplib2.CA_CERTS = '/etc/ssl/certs/ca-certificates.crt'
