import React from 'react';

import Typist from 'react-typist';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';

import PyProjects from './projects/PyProjects';
import AndroidProjects from './projects/AndroidProjects';

class Projects extends React.Component {

  render() {

    return (
      <div>
        <Jumbotron className='bg-transparent p-5'>
          <Container>
            <Row className='justify-content-center'>
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
          <Row className='justify-content-center'>
            <Col sm={6}>
            <Nav justify variant='tabs' className='justify-content-center'> 
                <Nav.Item>
                  <Nav.Link eventKey='first'>Python</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='second'>Android</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='third' disabled>Javascript</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='fourth'disabled >C++</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
          <Row className='justify-content-center py-5 '>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey='first'>
                  <PyProjects/>
                </Tab.Pane>
                <Tab.Pane eventKey='second'>
                  <AndroidProjects/>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container> 
      </div>
    );
  }
}

export default Projects;
