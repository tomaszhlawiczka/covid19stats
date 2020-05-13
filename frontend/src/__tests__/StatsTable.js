import React from 'react';
import Enzyme, { shallow } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import { render } from '@testing-library/react';
import fetchMock from "jest-fetch-mock";

import StatsTable from '../StatsTable';


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

// hack to resolve immediately
function flushPromises() { 
    return new Promise(resolve => setImmediate(resolve));
}

describe('<StatsTable />', () => {
    it('renders StatsTable with mocked data', () => {
        const fetchCountriesList = jest.spyOn(StatsTable.prototype, "fetchCountriesList").mockImplementation(() => Promise.resolve({status: 200, json: () => Promise.resolve(api_response)}));
        const fetchCountriesStats = jest.spyOn(StatsTable.prototype, "fetchCountriesStats").mockImplementation(() => Promise.resolve({status: 200, json: () => Promise.resolve(stats_response)}));

        let wrap = shallow(<StatsTable />);

        // await wrap.instance().busy;
        wrap = wrap.update();

        // console.log(wrap.state());
        // console.log(wrap.debug());

        // expect(wrap.find('ul').children().length).toEqual(6);
        // expect(wrap.find('ul').find('li').first().find(".card-title").text()).toEqual("Cameroon");

        expect(fetchCountriesList).toBeCalledWith('/api');
    });
});