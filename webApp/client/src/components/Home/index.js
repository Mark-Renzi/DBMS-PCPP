import React, { Component } from 'react';
import './style.css';
import { Link, NavLink } from 'react-router-dom';

class Home extends Component {
	render() {
		return (
			<>
				<h1>Home</h1>
				<p>Home</p>
				<Link to="/build">
					<button className="create-button">Create New List</button>
				</Link>
			</>
		)
	}
}

export default Home;