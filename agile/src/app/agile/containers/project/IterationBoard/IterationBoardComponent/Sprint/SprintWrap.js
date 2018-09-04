import React, { Component } from 'react';
import Card from '../Card';
import Sprint from './Sprint';

class SprintWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <Card
        title={'燃尽图冲刺1'}
      >
        <Sprint />
      </Card>
    );
  }
}
export default SprintWrap;
