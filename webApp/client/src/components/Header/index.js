import React, { Component } from 'react';
import axios from 'axios';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

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
			<Navbar expand="lg" className="fixed-top navbar-color">
				<div className="container-fluid">
					<Navbar.Toggle aria-controls="basic-navbar-nav"/>
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto navbar-container">
							<div className="nav-container left-nav">
								<Nav.Link href="/">Home</Nav.Link>
								<Nav.Link href="/browse">Browse</Nav.Link>
								<Nav.Link href="/leaderboard">Leaderboards</Nav.Link>
							</div>
							<span className="page-title">
								Home
							</span>
							<div className="nav-container right-nav">
								{username ? (
									<div className="github">
										<a href="http://localhost:3001/logout" className="btn btn-danger" onClick={() => localStorage.removeItem('username')}>Log Out</a>
										<span>{username}</span>
									</div>
								) : (
									<a href="http://localhost:3001/auth/github" className="github github-signin">
										<FontAwesomeIcon icon={faGithub} className="fa-2xl"/>
										<span>Sign in with GitHub</span>
									</a>
								)}
							</div>
						</Nav>
					</Navbar.Collapse>
				</div>
			</Navbar>
		);
	}
}

export default Header;




























// return (
		// 	<header>
		// 		<nav className="navbar navbar-expand-md fixed-top navbar-container">
		// 			<div className="container-fluid">
		// 				{/* <Link className="navbar-brand" to="/">Części Komputerowe</Link> */}
		// 				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
		// 					<span className="navbar-toggler-icon"></span>
		// 				</button>
		// 				<div className="nav-container collapse navbar-collapse" id="navbarCollapse">
		// 					<NavLink to="/">Home</NavLink>
		// 					<NavLink to="/browse">Browse</NavLink>
		// 					<NavLink to="/leaderboard">Leaderboard</NavLink>
		// 				</div>
		// 				{/* <div className="collapse navbar-collapse" id="navbarCollapse">
		// 					<ul className="navbar-nav me-auto mb-2 mb-md-0">
		// 						<NavLink to="/">Home</NavLink>
		// 						<NavLink to="/browse">Browse</NavLink>
		// 						<NavLink to="/leaderboard">Leaderboard</NavLink>
		// 					</ul>
		// 					{username ? (
        //         				<a href="http://localhost:3001/logout" className="btn btn-danger" onClick={() => localStorage.removeItem('username')}>Log Out</a>
		// 					) : (
		// 						<a href="http://localhost:3001/auth/github" className="btn btn-primary">Log in with Github</a>
		// 					)}
		// 					{username && <span>Welcome, {username}!</span>}
		// 				</div> */}
		// 			</div>
		// 		</nav>
		// 	</header>
		// )