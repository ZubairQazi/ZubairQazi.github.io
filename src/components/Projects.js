import React from 'react';

import Typist from 'react-typist';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab';

class Projects extends React.Component {

  render() {

    return (
      <div>
        <Jumbotron className='bg-transparent jumbotron-fluid p-0'>
          <Container fluid={true}>
            <Row className='justify-content-center py-5'>
              <Col md={10} sm={12}>
                <h1 className='display-3 font-weight-bolder'>
                  <Typist cursor={{ hideWhenDone: true }}>
                    <span> My Projects! </span>
                  </Typist>
                </h1>
              </Col>
            </Row>
          </Container>
        </Jumbotron>
        <Container fluid={true}>
          <Row className='justify-content-center py-5'>
          <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
            <Tab eventKey="home" title="Home">
              </Tab>
            <Tab eventKey="profile" title="Profile">
            </Tab>
            <Tab eventKey="contact" title="Contact" disabled>
            </Tab>
          </Tabs>
          </Row>
        </Container>
        <Container>
          <Row className='justify-content-center'> 
            <Col>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant="top" src="holder.js/100px180" />
              <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up the bulk of
                  the card's content.
                </Card.Text>
              </Card.Body>
              </Card>
            </Col>
            <Col>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant="top" src="holder.js/100px180" />
              <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up the bulk of
                  the card's content.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant="top" src="holder.js/100px180" />
              <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up the bulk of
                  the card's content.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      </div>
    );
  }
}

export default Projects;
