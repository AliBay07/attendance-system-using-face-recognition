import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ProSidebarProvider } from 'react-pro-sidebar';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
ReactDOM.render(
  <React.StrictMode>
    <ProSidebarProvider>
    <App />
    </ProSidebarProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
