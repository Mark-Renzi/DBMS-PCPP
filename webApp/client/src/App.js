import React, { Component } from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Header from './components/Header';
import Lists from './components/Lists';
import PricePerformanceLeaderboard from './components/PricePerformanceLeaderboard';
import Configurator from './components/Configurator';


import './App.css';

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<Header />
				<main className="">
					<div className="container">
						<div className="page-container">
							<Routes>
								<Route exact path="/" element={<Home />} />
								<Route path="/leaderboard" element={<PricePerformanceLeaderboard />} />
								<Route path="/lists" element={<Lists />} />
								<Route path="/build" element={<Configurator />} />
							</Routes>
						</div>
					</div>
				</main>

			</BrowserRouter>
		)
	}
}

export default App;