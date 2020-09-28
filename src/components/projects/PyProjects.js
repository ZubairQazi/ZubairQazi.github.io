import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Nav from 'react-bootstrap/Nav';

import linreg from '../../images/linreg.png';
import py from '../../images/python.png';

class PyProjects extends React.Component {

  render() {
    return(
      <Container>
        <Row className='justify-content-center py-5'> 
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={linreg} />
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
                    <Nav.Link href='https://github.com/ZubairQazi/LinearRegressionModel'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>            
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={py} />
              <Card.Body>
                <Card.Title as='h4'> Titanic Dataset Analysis  </Card.Title>
                <Card.Text>
                  My notes in which I analyzed the Kaggle Titanic
                  dataset, and used scikit-learns Logistic 
                  Regression model to predict the probability of survival,
                  and the gender of a passenger. I also extrapolated data
                  from some of the features columns, in order to create new
                  features and improve the model. See notebook for detailed
                  notes.
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://github.com/ZubairQazi/LogisticRegression_DataAnalysis'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={py} />
              <Card.Body>
                <Card.Title as='h4'> Ecommerce Analysis </Card.Title>
                <Card.Text>
                  An analysis of customer-based data, using numpy, 
                  pandas, matplotlib, and seaborn. I also used the
                  linear regression model from scikit-learn to 
                  gauge and compare the success from developing
                  two different platforms. 
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://github.com/ZubairQazi/EcommerceAnalysis'>GitHub</Nav.Link>
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

export default PyProjects;
