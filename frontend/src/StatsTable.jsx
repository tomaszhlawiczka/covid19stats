import React from 'react';
import PropTypes from "prop-types";
import {Alert, Badge, Button, Card, CardBody, CardTitle, CardText, Container, Spinner, ListGroup, ListGroupItem} from 'reactstrap';


class StatsTable extends React.Component {

    state = {
        loading: true,
        error: null,
        countries: [],
        countries_sorted: [],
        countries_stats: {}
    }

    updating = false;
    timer = null;

    async componentDidMount() {
        await this.downloadCountries();
    }

    onRetry = async ev => {
        ev.stopPropagation();

        await this.downloadCountries();
    }

    async fetchCountriesList(...args) {
        return await fetch(...args);
    }

    async fetchCountriesStats(...args) {
        return await fetch(...args);
    }

    async downloadCountries() {

        const response = await this.fetchCountriesList("/api");
        if (response.status !== 200) {
            this.setState({
                loading: false,
                stats: {},
                error: response.statusText,
                countries: [],
                countries_sorted: []
            });
            return;
        }

        const { countries } = await response.json();

        const countries_sorted = countries.sort((a, b) => a.localeCompare(b));

        this.setState({
            loading: false,
            stats: {},
            error: null,
            countries,
            countries_sorted
        });

        this.updateChain(countries);

        if (this.props.refresh)
            this.timer = setInterval(this.periodicUpdate, this.props.refresh);
    }

    async componentWillUnmount() {
        clearInterval(this.timer);
    }

    periodicUpdate = async () => {
        if (this.updating)
            return;

        if (this.state.countries)
            await this.updateChain(this.state.countries);
    }

    async updateChain(countries_list, offset=0, limit=20) {

        // Prevent to updating twice (or more at the same time)
        if (this.offset === 0)
            this.updating = true;

        // Download small subsets of countries, instead of one big package
        const to_download = countries_list.slice(offset, offset + limit);

        if (to_download.length)
            await this.fetchRange(to_download);

        if (countries_list.length > offset + limit) {
            // setTimeout is redundand here, but it looks more async ;)
            setTimeout(() => this.updateChain(countries_list, offset + limit, limit), 200);
        }
        else
            this.updating = false;
    }

    async fetchRange(countries_list) {

        const response = await this.fetchCountriesStats("/api/countries?names=" + countries_list.map(encodeURIComponent).join(","));

        if (response.status !== 200) {
            // Downloading data for countries failed, so they will be marked as in "loading" state.
            const countries = {};
            for (let i of countries_list)
                countries[i] = null;
            this.setState(state => ({
                countries_stats: { ...state.countries_stats, ...countries },
            }));
            return;
        }

        const {stats:countries} = await response.json();

        // In case when server doesn't have requested country (one or more) it is marked as in "loading" state.
        for (let i of countries_list)
            if (!(i in countries))
                countries[i] = null;

        this.setState(state => ({
            countries_stats: { ...state.countries_stats, ...countries },
        }));
    }

    onRefreshCountry = async (ev, country) => {
        ev.stopPropagation();

        this.setState(state => ({
            countries_stats: { ...state.countries_stats, [country]: null },
        }));

        await this.fetchRange([country]);
    }

    render() {

        const { loading, error, countries_sorted, countries_stats } = this.state;

        if (loading)
            return <Container><Alert className="mt-3" color="primary"><Spinner size="sm" color="primary" /> Loading data, please wait..</Alert></Container>;

        if (error)
            return <Container><Alert className="mt-3" color="danger">Cannot connect to server: {error} <Button className="float-right" size="sm" onClick={this.onRetry}>Retry now!</Button></Alert></Container>;

        return (
            <div className="App">
                <ListGroup className="countries">
                    {countries_sorted.map(country => <Country key={country} name={country} stats={countries_stats[country]} onRefresh={this.onRefreshCountry} />)}
                </ListGroup>
            </div>
        );
    }
}

StatsTable.propTypes = {
    refresh: PropTypes.number
};


export function Country({name, stats, onRefresh}) {

    if (!stats)
        return <ListGroupItem>
            <Card>
                <CardBody>
                    <CardTitle><b>{name}</b></CardTitle>
                    <Spinner type="grow" color="warning" />
                </CardBody>
            </Card>
        </ListGroupItem>;

    let color = "";
    if (stats.active_cases === 0)
        color = "success";
    else if (stats.active_cases < 1000)
        color = "warning";
    else if (stats.active_cases >= 186615)
        color = "danger";


    return <ListGroupItem>
        <Card color={color}>
            <CardBody>
                <CardTitle><b>{name}</b></CardTitle>
                <CardText>
                    <Badge size="sm" color="secondary">{stats.updated}</Badge>
                    <small>
                        <code>total: <b>{stats.total_cases}</b></code><br />
                        <code>deaths: <b>{stats.total_deaths}</b></code><br />
                        <code>recovered: <b>{stats.total_recovered}</b></code><br />
                        <code>tests: <b>{stats.total_tests}</b></code><br />
                        <code>active_cases: <b>{stats.active_cases}</b></code><br />
                    </small>
                </CardText>
                <Button className="pull-right" size="sm" onClick={ev => onRefresh(ev, name)}>Refresh</Button>
            </CardBody>
        </Card>
    </ListGroupItem>;
}

Country.propTypes = {
    name: PropTypes.string.isRequired,
    stats: PropTypes.object,
    onRefresh: PropTypes.func
};

export default StatsTable;
