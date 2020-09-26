import React from 'react';
import Typist from 'react-typist';
import Jumbotron from 'react-bootstrap/Jumbotron'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class Home extends React.Component {

  render() {
    return (

      <Jumbotron className="bg-transparent jumbotron-fluid p-0">
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
    );
  }
}

export default Home;
