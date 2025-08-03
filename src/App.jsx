import React from 'react';
import Login from './auth/login';
import './App.css';
import ListaClientes from './auth/ListaClientes';
import ListaProyectos from './auth/ListaProyectos';

function App() {
  return (
    <div className="App">
      <Login />
      <ListaClientes />
      <ListaProyectos />
    </div>
  );
}

export default App;