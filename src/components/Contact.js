import React from 'react';

import Typist from 'react-typist';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class Contact extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      body: '',
      disabled: false,
      emailSent: null
    } 
  }
  
  handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.setState({
      disabled: true,
      emailSent:false
    });
  }

  render() {

    return (
      <div>
        <Jumbotron className='bg-transparent jumbotron-fluid p-0'>
          <Container fluid={true}>
            <Row className='justify-content-center py-5'>
              <Col md={10} sm={12}>
                <h1 className='display-3 font-weight-bolder'>
                  <Typist cursor={{ hideWhenDone: true }}>
                    <span> Contact Me </span>
                  </Typist>
                </h1>
              </Col>
            </Row>
          </Container>
        </Jumbotron>

        <Form onSubmit={this.handleSubmit}>
          <Form.Row className='justify-content-center'>
            <Form.Group as={Col} md={6}>
              <Form.Label htmlFor='full-name'>Full Name</Form.Label>
              <Form.Control id='full-name' name='name' type='text' value={this.state.name} onChange={this.handleChange}/>
            </Form.Group>
          </Form.Row>
          <Form.Row className='justify-content-center'>
            <Form.Group as={Col} md={6}>
              <Form.Label htmlFor='email'>Email Address</Form.Label>
              <Form.Control id='email' name='email' type='email' value={this.state.email} onChange={this.handleChange}/>
            </Form.Group>
          </Form.Row>
          <Form.Row className='justify-content-center'>
            <Form.Group as={Col} md={6}>
              <Form.Label htmlFor='body'>Message</Form.Label>
              <Form.Control id='body' name='body' as='textarea' row='8' value={this.state.body} onChange={this.handleChange}/>
            </Form.Group>
          </Form.Row>
          <Button className='d-inline-block' variant='primary' type='submit' disabled={this.state.disabled}>
            Send
          </Button>

          {this.state.emailSent == true && <p className='d-inline success-msg'>Email Sent!</p>}
          {this.state.emailSent == false && <p className='d-inline error-msg'>Email Failed to Send!</p>}
        </Form>
      </div>

    );
  }
}

export default Contact;
