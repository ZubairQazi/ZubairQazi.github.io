import React from 'react';
import {HashRouter as Router, Route, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import Home from './Home';
import About from './About';
import Contact from './Contact';
import Projects from './Projects';

class Header extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      title: 'Zubair Qazi',
      headerLinks: [
        { title: 'Home', path: '/' },
        { title: 'About', path: '/about' },
        { title: 'Projects', path: '/projects' },
        { title: 'Contact', path: '/contact' } 
      ],
      home: {
        title: 'Hello There',
        subTitle: 'I\'m Zubair Qazi!',
        text: 'Check out my portfolio',
      },
      about: {
        title: 'About Me'
      },
      projects: {
        title: 'Projects'
      },
      contact: {
        title: 'Contact Me'
      }
    }
  }

  render() {
    return (
      <Router>
        <Container className='p-0' fluid={true}>
          <Navbar className='border-bottom' bg='transparent' expand='lg'>
            <Navbar.Brand>Zubair Qazi</Navbar.Brand>
            <Navbar.Toggle className='border-0' aria-controls="navbar-toggle"></Navbar.Toggle>
            <Navbar.Collapse id='navbar-toggle'>
              <Nav className='ml-auto'>
                <Link className='nav-link' to='/'>Home</Link>
                <Link className='nav-link' to='/about'>About</Link>
                <Link className='nav-link' to='/projects'>Projects</Link>
                <Link className='nav-link' to='/contact'>Contact</Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Route path='/' exact render={() => <Home title={this.state.home.title}/>} />
          <Route path='/about' render={() => <About title={this.state.about.title}/>} />
          <Route path='/projects' render={() => <Projects title={this.state.projects.title}/>} />
          <Route path='/contact' render={() => <Contact title={this.state.contact.title}/>} />
        </Container>
      </Router>
    );
  }
}

export default Header;
