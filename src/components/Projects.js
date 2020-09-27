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
import CardDeck from 'react-bootstrap/CardDeck';
import CardColumns from 'react-bootstrap/CardColumns';

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
      </div>
    );
  }
}

class CardDeckTest extends React.Component {
  
  render() {
    return(
      <Container>
        <Row className='justify-content-center'> 
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src='holder.js/100px180' />
              <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up the bulk of
                  the card's content.
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav justify variant='pills' className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='#link1'>Website</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href='#link2'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src='holder.js/100px180' />
              <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>
                  Some quick example text to build on the card title and make up the bulk of
                  the card's content.
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='#link2'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>
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
          </CardDeck>
        </Row>
      </Container> 
    );
  }
}

class PyProjects extends React.Component {
  render() {
    return(
      <Container>
        <Row className='justify-content-center'> 
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src='holder.js/100px180' />
              <Card.Body>
                <Card.Title as='h4'> Linear Regression Model </Card.Title>
                <Card.Text>
                  My implementation of a linear regression model, 
                  which currently uses a static learning rate and epoch.
                  Written in Jupyter using numpy, pandas, matplotlib, 
                  and sklearn datasets.
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='#link2'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>            
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src='holder.js/100px180' />
              <Card.Body>
                <Card.Title as='h4'> Ecommerce Analysis </Card.Title>
                <Card.Text>
                  An analysis of customer-base data, using numpy, 
                  pandas, matplotlib, and seaborn. I also used the
                  linear regression model from scikit-learn to 
                  gauge and compare the success from developing
                  two different platforms. 
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='#link2'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>
          </CardDeck>
        </Row>
      </Container>
    );
  }
}

export default Projects;
