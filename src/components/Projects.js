import React from 'react';

import Typist from 'react-typist';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab';
import TabContainer from 'react-bootstrap/TabContainer';
import TabPane from 'react-bootstrap/TabPane';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';

import pfp from '../images/pfp.jpg';
import gh from '../images/github.png';
import li from '../images/linkedin.png';

class Projects extends React.Component {

  render() {

    return (
      <div>
        <Jumbotron className='bg-transparent p-0'>
          <Container>
            <Row className='justify-content-center py-5'>
              <Col md={10} sm={12}>
                <h1 className='display-3 font-weight-bolder'>
                  <Typist cursor={{ hideWhenDone: true }}>
                    <span> My Projects! </span>
                  </Typist>
                </h1>
                <h4 className='display-5 font-weight-light'>
                  See some of the projects that I've done! They're separated by language or 
                  platform to make it easier to look through. If you have questions or 
                  feedback, please contact me!
                </h4>
              </Col>
            </Row>
          </Container>
        </Jumbotron>
        <Tab.Container id='language-tabs' defaultActiveKey='first'>
          <Row className='justify-content-center py-5'>
            <Col sm={3}>
            <Nav variant='pills' className='justify-content-center'> 
                <Nav.Item>
                  <Nav.Link eventKey='first'>Python</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='second'>Android</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='third'>Javascript</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='fourth'>C++</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
          <Row className='justify-content-center py-5'>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey='first'>
                  <PyProjects/>
                </Tab.Pane>
                <Tab.Pane eventKey='second'>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container> 
        <Container fluid={true}>
          <Row className='justify-content-center'> 
            <Col xs={6} md={4}>
              <a href='https://github.com/ZubairQazi' target='_blank' rel="noopener noreferrer"> <Image src={gh} rounded /> </a>
              <a href='https://www.linkedin.com/in/zubair-qazi' target='_blank' rel="noopener noreferrer"> <Image src={li} rounded /> </a>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

class PyProjects extends React.Component {
  render() {
    return(
      <Container fluid={true}>
        <Row className='justify-content-center'> 
          <Col>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src='holder.js/100px180' />
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
              <Card.Img variant='top' src='holder.js/100px180' />
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
              <Card.Img variant='top' src='holder.js/100px180' />
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
    );
  }
}

export default Projects;
