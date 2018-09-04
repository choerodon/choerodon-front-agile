import React, { Component } from 'react';
import Card from '../Card';
import Remain from './Remain';

class RemainWrap extends Component {
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
        title={'距离冲刺结束'}
      >
        <Remain />
      </Card>
    );
  }
}
export default RemainWrap;
