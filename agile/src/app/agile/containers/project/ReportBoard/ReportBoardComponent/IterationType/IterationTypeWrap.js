import React, { Component } from 'react';
import Card from '../Card';
import IterationType from './IterationType';

class IterationTypeWrap extends Component {
  render() {
    return (
      <Card 
        title="迭代问题类型分布"
        link="#"
      >
        <IterationType />
      </Card>
    );
  }
}

export default IterationTypeWrap;
