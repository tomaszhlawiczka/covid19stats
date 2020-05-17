import React from 'react';
import Enzyme, { shallow } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import fetchMock from "jest-fetch-mock";

import StatsTable, {Country} from '../StatsTable';


Enzyme.configure({adapter: new Adapter()})


const api_response = {
    countries: ["Poland", "Bermuda", "Cameroon", "Caribbean Netherlands", "Costa Rica", "Luxembourg"]
};

const stats_response = {
    stats: {
        "Poland": {
            'total_cases': 123,
            'total_deaths': 123,
            'total_recovered': 123,
            'total_tests': 123,
            'active_cases': 123
        },
        "Bermuda": {
            'total_cases': 123,
            'total_deaths': 123,
            'total_recovered': 123,
            'total_tests': 123,
            'active_cases': 123
        },
        "Cameroon": {
            'total_cases': 123,
            'total_deaths': 123,
            'total_recovered': 123,
            'total_tests': 123,
            'active_cases': 123
        },
        "Caribbean Netherlands": {
            'total_cases': 123,
            'total_deaths': 123,
            'total_recovered': 123,
            'total_tests': 123,
            'active_cases': 123
        },
        "Costa Rica": {
            'total_cases': 123,
            'total_deaths': 123,
            'total_recovered': 123,
            'total_tests': 123,
            'active_cases': 123
        },
        "Luxembourg": {
            'total_cases': 123,
            'total_deaths': 123,
            'total_recovered': 123,
            'total_tests': 123,
            'active_cases': 123
        }
    }
};


describe('<StatsTable />', () => {

    afterEach(() => {
        jest.clearAllMocks()
    });

    it('renders StatsTable with mocked data', async () => {
        const fetchCountriesList = jest.spyOn(StatsTable.prototype, "fetchCountriesList").mockImplementation(() => Promise.resolve({status: 200, json: () => Promise.resolve(api_response)}));
        const fetchCountriesStats = jest.spyOn(StatsTable.prototype, "fetchCountriesStats").mockImplementation(() => Promise.resolve({status: 200, json: () => Promise.resolve(stats_response)}));

        let wrap = Enzyme.mount(<StatsTable />);

        await wrap.instance().componentDidMount();
        wrap.update();

        expect(fetchCountriesList).toBeCalledWith('/api');
        expect(fetchCountriesStats).toBeCalledWith('/api/countries?names=Bermuda,Cameroon,Caribbean%20Netherlands,Costa%20Rica,Luxembourg,Poland');

        expect(wrap.find('Country').length).toEqual(Object.keys(stats_response.stats).length);
        expect(wrap.find('Country').first().find(".card-title").text()).toEqual("Bermuda");
    });

    it('invalid response', async () => {
        const fetchCountriesList = jest.spyOn(StatsTable.prototype, "fetchCountriesList").mockImplementation(() => Promise.resolve({status: 500, statusText: 'Server error', json: () => Promise.resolve(null)}));
        const fetchCountriesStats = jest.spyOn(StatsTable.prototype, "fetchCountriesStats").mockImplementation(() => Promise.resolve({status: 500, statusText: 'Server error', json: () => Promise.resolve(null)}));

        let wrap = Enzyme.mount(<StatsTable />);

        await wrap.instance().componentDidMount();
        wrap.update();

        expect(fetchCountriesList).toBeCalledWith('/api');
        expect(fetchCountriesStats).not.toBeCalled();

        expect(wrap.find('Country').length).toEqual(0);
        expect(wrap.find('Alert').length).toEqual(1);
    });
});


describe('<Country />', () => {

    afterEach(() => {
        jest.clearAllMocks()
    });

    it('loading state', async () => {
        let wrap = Enzyme.mount(<Country name="Poland" stats={null} onRefresh={e => false}/>);
        expect(wrap.find('Card').first().find("Spinner").length).toEqual(1);
    });

    const stats = {
        total_cases: 123,
        total_deaths: 123,
        total_recovered: 123,
        total_tests: 123,
        active_cases: 123
    };

    it('no active cases', async () => {
        let wrap = Enzyme.mount(<Country name="Poland" stats={{...stats, active_cases: 0}} onRefresh={e => false}/>);
        expect(wrap.find('Card').first().props().color).toEqual("success");
    });

    it('low active cases', async () => {
        let wrap = Enzyme.mount(<Country name="Poland" stats={{...stats, active_cases: 999}} onRefresh={e => false}/>);
        expect(wrap.find('Card').first().props().color).toEqual("warning");
    });

    it('high active cases', async () => {
        let wrap = Enzyme.mount(<Country name="Poland" stats={{...stats, active_cases: 186618}} onRefresh={e => false}/>);
        expect(wrap.find('Card').first().props().color).toEqual("danger");
    });

    it('refresh', async () => {

        const cb = jest.fn();
        let wrap = Enzyme.mount(<Country name="Poland" stats={{...stats, active_cases: 186618}} onRefresh={cb}/>);

        wrap.find('Button').simulate('click');
        expect(cb.mock.calls.length).toEqual(1);
    });

});
