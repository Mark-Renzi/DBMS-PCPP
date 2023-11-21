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
								<Nav.Link className="navlink-custom" href="/">Home</Nav.Link>
								<Nav.Link className="navlink-custom" href="/browse">Browse</Nav.Link>
								<Nav.Link className="navlink-custom" href="/leaderboard">Leaderboards</Nav.Link>
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