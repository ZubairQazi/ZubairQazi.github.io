import React from 'react';

import Typist from 'react-typist';

import Jumbotron from 'react-bootstrap/Jumbotron'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

import pfp from '../images/pfp.jpg';

class Home extends React.Component {

  render() {
    return (

      <div>
        <Jumbotron className='bg-transparent jumbotron-fluid p-0'>
          <Container fluid={true}>
            <Row className='justify-content-center py-5'>
              <Col md={10} sm={12}>
                <h1 className='display-3 font-weight-bolder'>
                  <Typist cursor={{ hideWhenDone: true }}>
                    <span> I'm Zubair! </span>
                    <Typist.Backspace count={12} delay={1000} />
                    <span> Check out my Portfolio! </span>
                    <Typist.Backspace count={25} delay={1000} />
                    <span> Zubair Qazi </span>
                  </Typist>
                </h1>
                <h3 className='display-5 font-weight-light'> Student @ UCR, Mobile Dev. + Data Science </h3>
              </Col>
            </Row>
          </Container>
        </Jumbotron>
        <Container fluid={true}>
          <Row className='justify-content-center'>
            <Col md={10} sm={12}>
              <Image src={pfp} roundedCircle />
            </Col>
          </Row>
          <Row className='justify-content-center'>
            <h1 className='display-3 font-weight-bolder'> _________________ </h1>
          </Row>
        </Container>
        <Jumbotron className='bg-transparent jumbotron-fluid p-0'>
          <Container fluid={true}>
            <Row className='justify-content-center py-5'>
              <Col md={10} sm={12}>
                <h4 className='display-6 font-weight-light'> Python | Kotlin | Java | Swift | C++ | HTML/CSS | Javascript</h4>
              </Col>
            </Row>
          </Container>
        </Jumbotron>  
      </div>
    );
  }
}

export default Home;
