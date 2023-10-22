import React, { Component } from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home';


import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>

        <main className="">
          <div className="container">
            <Routes>
              <Route exact path="/" element={<Home/>} />
            </Routes>
          </div>
        </main>

      </BrowserRouter>
    )
  }
}

export default App;