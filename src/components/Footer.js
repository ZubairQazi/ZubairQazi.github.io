import React from 'react';
import {BrowserRouter as Router/*, Route, Link*/} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class Footer extends React.Component {

  render() {
    return(
      <Router>
        <footer className='mt-5'>
          <Container fluid={true}>
            <Row className='border-top justify-content-between p-3'>
              <Col className='p-0 d-flex justify-content-beginning' md={3} sm={12}>
                Zubair Qazi
              </Col>
              <Col className='p-0 d-flex justify-content-end' md={4} sm={12}>
                This site was created by Zubair Qazi.
              </Col>
            </Row>
          </Container>
        </footer>
      </Router>
    );
  }
}

export default Footer;
