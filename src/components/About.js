import React from 'react';

import Typist from 'react-typist';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class About extends React.Component {

  render() {

    return (
      <div>
        <Jumbotron className='bg-transparent jumbotron-fluid p-0'>
          <Container fluid={true}>
            <Row className='justify-content-center py-5'>
              <Col md={8} sm={12}>
                <h1 className='display-3 font-weight-bolder'>
                  <Typist cursor={{ hideWhenDone: true }}>
                    <span> About Me </span>
                  </Typist>
                </h1>
              </Col>
            </Row>
            <Row className='justify-content-center'> 
              <Col md={6} sm={8}> 
               <p> 
                  I'm Zubair (pronounced Zoo-bear). I am currently a junior at 
                  University of California, Riverside studying Computer Science. 
                  I tend to focus on mobile application development and data science/analytics, 
                  however I also enjoy dabbling in other concentrations that
                  my friends and professors are willing to teach me about! A perfect 
                  example is this website, which was built with some help from my friends,
                  YouTube, and documentation!
                </p>
              </Col> 
            </Row>
            <Row className='justify-content-center'> 
              <Col md={6} sm={8}>
                <p>
                  I also love Star Wars and LEGO. I have a collection of Star Wars 
                  figures that I have on display at home. I also have a LEGO collection 
                  of assorted sets, mostly ranging from Star Wars to Creator sets.
                  Other than that, in my free time I like to read, play video games with 
                  friends, or work on fun projects! I would like to be able to travel 
                  around the world, but I'll need a job for that first.
                  <span role="img" aria-label="Wink">😉</span>
                </p>
              </Col> 
            </Row>
          </Container>
        </Jumbotron>
      </div>
    );
  }
}

export default About;
