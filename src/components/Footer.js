import React from 'react';
import {BrowserRouter as Router/*, Route, Link*/} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

import pfp from '../images/pfp.jpg';
import gh from '../images/github.png';
import li from '../images/linkedin.png';

class Footer extends React.Component {

  render() {
    return(
      <Router>
        <footer className='mt-5'>
          <Container fluid={true}>
            <Row className='border-top p-3'>
              <Col className='justify-content-center' md={12}>
                <a href='https://github.com/ZubairQazi' target='_blank' rel="noopener noreferrer"> <Image className='px-2' src={gh} rounded /> </a>
                <a href='https://www.linkedin.com/in/zubair-qazi' target='_blank' rel="noopener noreferrer"> <Image className='px-2' src={li} rounded /> </a>
              </Col>
            </Row>
          </Container>
        </footer>
      </Router>
    );
  }
}

export default Footer;
