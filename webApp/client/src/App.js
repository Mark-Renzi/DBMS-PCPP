import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/Home';
import Header from './components/Header';
import PricePerformanceLeaderboard from './components/PricePerformanceLeaderboard';
import Configurator from './components/Configurator';
import Browse from './components/Browse';
import ListViewer from './components/ListViewer';

import './App.css';
import Details from './components/Details';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
		  pageTitle: 'No Title',
		};
	}
	
	updatePageTitle = (newTitle) => {
		this.setState({ pageTitle: newTitle });
	};

	render() {
		const { pageTitle } = this.state;

		return (
			<BrowserRouter>
				<Header className="page-title" pageTitle={pageTitle}/>
				<main className="">
					<div className="container">
						<div className="page-container">
							<Routes>
								<Route exact path="/" element={<HomePage updatePageTitle={this.updatePageTitle} />}/>
								<Route path="/leaderboard" element={<PricePerformanceLeaderboard updatePageTitle={this.updatePageTitle} />} />
								<Route path="/build" element={<Configurator updatePageTitle={this.updatePageTitle} />} />
								<Route path="/browse/:id?" element={<Browse updatePageTitle={this.updatePageTitle} />} />
								<Route path="/build/:listid" element={<Configurator updatePageTitle={this.updatePageTitle} />} />
								<Route path="/part/:partid" element={<Details updatePageTitle={this.updatePageTitle} />} />
								<Route path="/lists/:listid" element={<ListViewer updatePageTitle={this.updatePageTitle} />} />
							</Routes>
						</div>
					</div>
				</main>

			</BrowserRouter>
		)
	}
}

export default App;