import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

import { unregister } from './registerServiceWorker';
import registerServiceWorker from './registerServiceWorker'; // only in production

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

unregister();
registerServiceWorker(); // only in production
