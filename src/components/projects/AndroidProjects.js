import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Nav from 'react-bootstrap/Nav';

import android from '../../images/android.png';
import dealectable from '../../images/dealectable.png';
import urdude from '../../images/urdude.png';

class AndroidProjects extends React.Component {

  render() {
    return(
      <Container>
        <Row className='justify-content-center'> 
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={dealectable} />
              <Card.Body>
                <Card.Title as='h4'> Dealectable </Card.Title>
                <Card.Text>
                  The application uses images of different restaurant menus 
                  and uses Computer Vision in Python in order to convert that 
                  information into a data file that can be readable by programs. 
                  The data is then exported to a Firebase Database to be 
                  stored and accessed remotely. That subsequently is accessed by 
                  Android Studio to allow a java-based Android application to access that information.
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                 <Nav justify variant='' className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://devpost.com/software/dealectable'>Website</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href='https://github.com/DanialBeg/Dealectable'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>  
              </Card.Footer>
            </Card>            
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={android} />
              <Card.Body>
                <Card.Title as='h4'> Company Reviews  </Card.Title>
                <Card.Text>
                  Android application built in Kotlin, designed to take JSON 
                  input and parse the data into an application for reviewing 
                  companies. The app uses Okhttp to retrieve the JSON, GSON to 
                  parse the data into custom model objects, and Picasso to retrieve
                  the company logo from the url in the data. See README for details.
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://github.com/ZubairQazi/CompanyReviews'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={android} />
              <Card.Body>
                <Card.Title as='h4'> Coffee Tracker </Card.Title>
                <Card.Text>
                  Android application, written in Kotlin, designed to track coffee 
                  usage and give weekly reports of productivity based on user-input.
                  Utilizes Firebase for data storage and user authentication. Currently
                  a work in progress.
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
        <Row className='justify-content-center py-5'>
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={urdude} />
              <Card.Body>
                <Card.Title as='h4'> Urdude </Card.Title>
                <Card.Text>
                  Android application written in Java, designed to teach the Urdu
                  language to children. The app is available on the Play Store. This
                  was my first every android application!
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav justify variant='' className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://play.google.com/store/apps/details?id=com.urdu.benbair.urdude'>Play Store</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href='https://github.com/ZubairQazi/Urdude'>GitHub</Nav.Link>
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

export default AndroidProjects;
