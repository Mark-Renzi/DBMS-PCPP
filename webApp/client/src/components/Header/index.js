import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';

import './style.css';

class Header extends Component {

	useEffect() {
		this.fetchUserData();	
	} [username];

	componentDidMount() {
		this.fetchUserData();
	}

	fetchUserData = async () => {
		try {
			const response = await axios.get('/api/user');
			if (response.data.username) {
				localStorage.setItem('username', response?.data?.username);
				this.setState({ username: response?.data?.username });
			} else [
				localStorage.removeItem('username')
			]
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			username: null,
		};
	}

	render() {
		const { username } = this.state;
		return (
			<header>
				<nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
					<div className="container-fluid">
						<Link className="navbar-brand" to="/">Części Komputerowe</Link>
						<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
							<span className="navbar-toggler-icon"></span>
						</button>
						<div className="collapse navbar-collapse" id="navbarCollapse">
							<ul className="navbar-nav me-auto mb-2 mb-md-0">
								<NavLink to="/">Home</NavLink>
								<NavLink to="/leaderboard">Leaderboard</NavLink>
								{/* {username && <NavLink to="/lists">Lists</NavLink>} */}
								<NavLink to="/browse">Browse</NavLink>
							</ul>
							{username ? (
                				<a href="http://localhost:3001/logout" className="btn btn-danger" onClick={() => localStorage.removeItem('username')}>Log Out</a>
							) : (
								<a href="http://localhost:3001/auth/github" className="btn btn-primary">Log in with Github</a>
							)}
							{username && <span>Welcome, {username}!</span>}
						</div>
					</div>
				</nav>
			</header>
		)
	}
}

export default Header;