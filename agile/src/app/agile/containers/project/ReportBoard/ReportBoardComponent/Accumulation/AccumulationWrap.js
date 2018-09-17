import React, { Component } from 'react';
import Card from '../Card';
import Accumulation from './Accumulation';

class AccumulationWrap extends Component {
  render() {
    const { link } = this.props;

    return (
      <Card
        title="累积流量图"
        link={link}
      >
        <Accumulation />
      </Card>
    );
  }
}

export default AccumulationWrap;
