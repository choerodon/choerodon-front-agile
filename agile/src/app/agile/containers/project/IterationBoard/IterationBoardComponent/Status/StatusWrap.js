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
    const { sprintId } = this.props;

    return (
      <Card
        title={'状态分布'}
      >
        <Status
          sprintId={sprintId}
        />
      </Card>
    );
  }
}
export default StatusWrap;
