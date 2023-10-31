import React, { Component } from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './components/Home';
import Header from './components/Header';
import Lists from './components/Lists';
import PricePerformanceLeaderboard from './components/PricePerformanceLeaderboard';
import Configurator from './components/Configurator';
import Browse from './components/Browse';


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
								<Route exact path="/" element={<HomePage />} />
								<Route path="/leaderboard" element={<PricePerformanceLeaderboard />} />
								{/* <Route path="/lists" element={<Lists />} /> */}
								<Route path="/build" element={<Configurator />} />
								<Route path="/browse/:id?" element={<Browse />} />						</Routes>
						</div>
					</div>
				</main>

			</BrowserRouter>
		)
	}
}

export default App;