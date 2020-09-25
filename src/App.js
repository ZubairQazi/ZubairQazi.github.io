import React from 'react';
import './App.css';

import HeaderNav from './components/HeaderNav';
import Footer from './components/Footer';

class App extends React.Component {

  render() {
    return (
      <div className='App'>
        <HeaderNav/>
        <Footer/>
      </div>
    );
  }
}

export default App;
