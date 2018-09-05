import React, { Component } from 'react';
import SprintDetails from './SprintDetails';
import Card from '../Card';

class SprintDetailsWrap extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card
        title="冲刺详情"
      >
        <SprintDetails />
      </Card>
    );
  }
}
export default SprintDetailsWrap;
