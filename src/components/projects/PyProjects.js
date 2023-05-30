import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Nav from 'react-bootstrap/Nav';

import linreg from '../../images/linreg.png';
import py from '../../images/python.png';
import melanoma from '../../images/melanoma.png';
import ship_ui from '../../images/container-ship.png';
import mlp from '../../images/multilayer-perceptron.png';

class PyProjects extends React.Component {

  render() {
    return(
      <Container>
         <Row className='justify-content-center py-5'> 
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={melanoma} className='mt-4' />
              <Card.Body>
                <Card.Title as='h4'> Melanoma Detection </Card.Title>
                <Card.Text>
                  A pipeline which takes a high-resolution image of possible Melanoma, 
                  uses an Autoencoder to reduce the dimensionality of the image and 
                  learn featureful embeddings, and then classify the image using a CNN model.
                  Both models were implemented using PyTorch, and the architecture and 
                  hyper-parameters were optimized via bayesian optimization. 
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav justify variant='' className='justify-content-center'>
                <Nav.Item>
                    <Nav.Link href='https://drive.google.com/file/d/1IgMcZOY1Lr65W3b26DyVcsuOsCn38c1G/view?usp=sharing'>Report</Nav.Link>
                  </Nav.Item>
                  <div className="vertical-line"></div> 
                  <Nav.Item>
                    <Nav.Link href='https://drive.google.com/drive/folders/1EOuRP9SsxuNOwn-1CBFdoKqwcN8zvOwO?usp=sharing'>Code</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>            
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={ship_ui} className='mt-4' />
              <Card.Body>
                <Card.Title as='h4'> Container Ship Service  </Card.Title>
                <Card.Text>
                A Flask-based web application that helps shipyard crane operators to optimize 
                the unloading and loading paths of container ships. Using the A* algorithm, 
                it determines the most efficient container movements while factoring in weight 
                distribution, ship balance, and other spatial constraints . The application also provides 
                a visual interface, specifically a colored grid representing the ship's current state after each step,
                to easily understand each step of container movement.
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://github.com/ZubairQazi/Container-Ship-Service'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={py} className='mt-4' />
              <Card.Body>
                <Card.Title as='h4'> Angelica Puzzle Solver </Card.Title>
                <Card.Text>
                The Angelica Puzzle Solver is a project that tackles the challenge of solving the Angelica puzzle, 
                a variant of the well-known Eight Puzzle. Using the A* search algorithm, the solver 
                efficiently explores possible moves and finds the optimal next step. It incorporates intelligent 
                heuristics to guide the search, improving the efficiency of finding the best moves. 
                Additionally, the project employs hashing techniques for optimization to avoid repeating states.
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav justify variant='' className='justify-content-center'>
                <Nav.Item>
                    <Nav.Link href='https://docs.google.com/document/d/17az7A33tP26ASCCR-HlNooJjJ-O5fgz9AlG_t3roVDM/edit?usp=share_link'>Report</Nav.Link>
                  </Nav.Item>
                  <div className="vertical-line"></div> 
                  <Nav.Item>
                    <Nav.Link href='https://github.com/ZubairQazi/AngelicaPuzzle'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>
          </CardDeck>
        </Row>
        <Row className='justify-content-center py-5'> 
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={mlp} className='mt-4 ml-1 mr-1'/>
              <Card.Body>
                <Card.Title as='h4'>Scratch Neural Network</Card.Title>
                <Card.Text>
                  My from-scratch implementation of a simple linear classifier and a neural network classifier for the MNIST
                  dataset. The neural network classifier was tested with both logistic loss, quadratic loss, varying hidden layers,
                  and then compared to the linear classifier. The models were implemented using Numpy. I implemented this twice, 
                  once in undergrad and once in grad. As such, I will link two separate colabs. 
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav justify variant='' className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://colab.research.google.com/drive/1eZxd0FJPNwd3XWsZRJbfraWPWL7yKOhc'>Code</Nav.Link>
                  </Nav.Item>
                  <div className="vertical-line"></div> 
                  <Nav.Item>
                    <Nav.Link href='https://colab.research.google.com/drive/1eGhISrI2lXLY3Je6JgyMWzCI9e4B-zVt?usp=sharing'>Code</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={py} className='mt-4' />
              <Card.Body>
                <Card.Title as='h4'> Feature Selection </Card.Title>
                <Card.Text>
                The Feature Selection Tool is a versatile project designed to help optimize feature selection for machine learning
                models. It supports any dataset in CSV format with numerical data, making it suitable for a wide range of applications. 
                By utilizing forward search and backward search algorithms, the tool identifies the most relevant features that significantly 
                impact model accuracy. It employs a K-Nearest Neighbors (KNN) model with cross-validation to evaluate the performance of each 
                feature set. The project also utilizes Matplotlib to create comprehensive visualizations of each featureset, enabling users to make 
                informed decisions about the best feature combination for their models.
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Nav className='justify-content-center'>
                  <Nav.Item>
                    <Nav.Link href='https://github.com/ZubairQazi/FeatureSelection-'>GitHub</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Footer>
            </Card>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={linreg} className='mt-4' />
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
          </CardDeck>
        </Row>
        <Row className='justify-content-center py-5'> 
          <CardDeck>
            <Card style={{ width: '20rem' }}>
              <Card.Img variant='top' src={py} className='mt-4' />
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
              <Card.Img variant='top' src={py} className='mt-4' />
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
