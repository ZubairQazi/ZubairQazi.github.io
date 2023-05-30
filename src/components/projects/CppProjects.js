import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Nav from 'react-bootstrap/Nav';

import c_logo from '../../images/c_logo.png';
import cpp_logo from '../../images/cpp_logo.png'

class CppProjects extends React.Component {
  
  render() {
    return(
      <Container>
        <Row className='justify-content-center py-5'> 
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={cpp_logo} />
              <Card.Body>
                <Card.Title as='h4'> R'Shell </Card.Title>
                <Card.Text>
                R'Shell is a C++ project that recreates the functionality of a bash terminal. It offers a command 
                shell capable of processing and executing multiple commands, separated by connectors like ||, &&, or ;. 
                The project implements a parser to interpret command formats and a testing suite for comprehensive 
                functionality testing. By manually implementing various commands and connectors, R'Shell enables users to 
                execute commands in a specified order. It employs the composite pattern to represent commands and utilizes 
                system calls such as fork, execvp, and waitpid for execution. Additionally, R'Shell handles error conditions 
                with appropriate error checking and incorporates a dedicated exit command while adhering to connector rules. 
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                 <Nav justify variant='' className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://github.com/ZubairQazi/Software-Construction/tree/master/assignment-legostarwarsguys'>GitHub</Nav.Link>
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

export default CppProjects; 
