import React, { Component } from 'react';
import Card from '../Card';
import Prio from './Priority';

class Priority extends Component {
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
        title={'优先级分布'}
      >
        <Prio />
      </Card>
    );
  }
}
export default Priority;
