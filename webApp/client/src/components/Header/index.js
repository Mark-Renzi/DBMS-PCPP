import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';

import './style.css';

class Header extends Component {
  render() {
    return (
    <header>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">PCComponentes</Link>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/leaderboard">Leaderboard</NavLink>
            </ul>
          </div>
        </div>
      </nav>
    </header>
    )
  }
}

export default Header;