# covid19stats

## Features
 - Reading countries stats (numbers) from https://www.worldometers.info/coronavirus/
 - Collecting data in the local Redis server (see `backend/settings.py` for configuration)
 - Lockingless approach while updating (stats are available for reading all the time)
 - Simple Flask server to publishing stats (REST, JSON format)
 - Simple ReactJS page for prezentation: updating stats with batches

## Installation

```
git clone https://github.com/tomaszhlawiczka/covid19stats
cd covid19stats

virtualenv -p python3.8 backend/venv
./backend/venv/bin/pip install -r backend/requirements.txt

```
![](images/Screenshot_20200513_144908.jpeg)

## Configuration
See: `backend/settings.py` to setup connection to `Redis` database.
![](images/Screenshot_20200513_145746.jpeg)


## Tests - backend
```
./backend/venv/bin/pytest backend/tests
```
![](images/Screenshot_20200513_145930.jpeg)

## Update stats
```
./backend/venv/bin/python -m backend.collector
```
![](images/Screenshot_20200513_150156.jpeg)

## Running dev backend server
```
FLASK_ENV=development FLASK_APP=backend/server.py ./backend/venv/bin/flask run
```
![](images/Screenshot_20200513_150241.jpeg)


## Running dev frontend server
```
(cd frontend; yarn install; yarn start)
```
See: http://localhost:3000/
![](images/Screenshot_20200513_150034.jpeg)


## Tests - frontend
```
(cd frontend; yarn install; yarn test)
```
![](images/Screenshot_20200513_150655.jpeg)


## Final result
### Step 1 - loading countries list
![](images/Screenshot_20200513_150946.jpeg)

### Step 2 - loading countries stats with batches
![](images/Screenshot_20200513_152143.jpeg)

### Step 3 - data loaded, upading periodicly
![](images/Screenshot_20200513_152202.jpeg)

### Error case - no connection to server
![](images/Screenshot_20200513_150800.jpeg)

