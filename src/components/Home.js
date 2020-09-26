import React from 'react';
import Typist from 'react-typist';

class Home extends React.Component {

  render() {
    return (
      <h1>
        <Typist>
          <span> I'm Zubair! </span>
          <Typist.Backspace count={12} delay={1000} />
          <span> Check out my projects! </span>
        </Typist>

      </h1>
    );
  }
}

export default Home;
