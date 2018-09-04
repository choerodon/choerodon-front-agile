import React, { Component } from 'react';
import Card from '../Card';
import Status from './Status';

class StatusWrap extends Component {
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
        title={'状态分布'}
      >
        <Status />
      </Card>
    );
  }
}
export default StatusWrap;
