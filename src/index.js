import React from 'react';
import ReactDOM from 'react-dom';
import * as firebase from 'firebase'

import App from './App';

import 'bulma/css/bulma.css';
import '../src/fill-screen.css';

// Make sure you swap this out with your Firebase app's config
const config = {
    apiKey: "AIzaSyDPeFKVUPg4NfKw7R54l9IAHTnPcc92e2s",
    authDomain: "todolist-bb9ef.firebaseapp.com",
    databaseURL: "https://todolist-bb9ef.firebaseio.com",
    storageBucket: "todolist-bb9ef.appspot.com",
    messagingSenderId: "1016021649594"
};

firebase.initializeApp(config);

ReactDOM.render(
    <App />,
    document.getElementById('root')
);