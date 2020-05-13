import React from 'react';

import StatsTable from "./StatsTable";

import './App.css';

function App() {
  return <div>
    <h3 className="m-2">COVID-19 stats table:</h3>
    <StatsTable refresh={10000} />
  </div>;
}


export default App;
