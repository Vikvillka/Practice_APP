import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import { setupStore } from './store/reduxStore';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import Store from './store/store';
const reduxStore = setupStore();

const store = new Store();

export const Context = createContext({
   store,
})


const root = ReactDOM.createRoot(document.getElementById('root'));

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID ;

root.render(
  <Context.Provider value={{ store }}>
     <GoogleOAuthProvider clientId={googleClientId}>
    <Provider store={reduxStore}>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </Provider>
    </GoogleOAuthProvider>
  </Context.Provider>
);


