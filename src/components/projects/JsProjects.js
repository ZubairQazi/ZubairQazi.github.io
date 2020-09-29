import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Nav from 'react-bootstrap/Nav';

import portfolio from '../../images/portfolio.png';

class JsProjects extends React.Component {
  
  render() {
    return(
      <Container>
        <Row className='justify-content-center py-5'> 
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={portfolio} />
              <Card.Body>
                <Card.Title as='h4'> Portfolio </Card.Title>
                <Card.Text>
                  This website is my first Javascript project! I built it
                  using the React Javascript framework, and am hosting it on
                  GitHub pages. For this project I am using React-Bootstrap in
                  order to optimize the experience on all devices. I am also
                  using TravisCI to automate deployment. Check out the repo
                  and email me with feedback!
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                 <Nav justify variant='' className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://zubairqazi.com'>Website</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href='https://github.com/ZubairQazi/ZubairQazi.github.io'>GitHub</Nav.Link>
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

export default JsProjects; 
