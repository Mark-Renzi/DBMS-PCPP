import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/Home';
import Header from './components/Header';
import PricePerformanceLeaderboard from './components/PricePerformanceLeaderboard';
import Configurator from './components/Configurator';
import Browse from './components/Browse';
import ListViewer from './components/ListViewer';
import PageTitleContext from './context/pageTitleContext';

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

		const contextValue = {
            pageTitle: pageTitle,
            updatePageTitle: this.updatePageTitle
        };

		return (
			<BrowserRouter>
				<PageTitleContext.Provider value={contextValue}>
					<Header className="page-title" pageTitle={pageTitle}/>
					<main className="">
						<div className="container">
							<div className="page-container">
								<Routes>
									<Route exact path="/" element={<HomePage/>}/>
									<Route path="/leaderboard" element={<PricePerformanceLeaderboard/>}/>
									<Route path="/build" element={<Configurator/>}/>
									<Route path="/browse/:id?" element={<Browse/>}/>
									<Route path="/build/:listid" element={<Configurator/>}/>
									<Route path="/part/:partid" element={<Details/>}/>
									<Route path="/lists/:listid" element={<ListViewer/>}/>
								</Routes>
							</div>
						</div>
					</main>
				</PageTitleContext.Provider>
			</BrowserRouter>
		)
	}
}

export default App;