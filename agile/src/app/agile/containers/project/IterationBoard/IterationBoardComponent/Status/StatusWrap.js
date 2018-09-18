import React, { Component } from 'react';
import Card from '../Card';
import Status from './Status';

class StatusWrap extends Component {
  render() {
    const { sprintId, link } = this.props;

    return (
      <Card
        title="状态分布"
        link={link}
      >
        <Status
          sprintId={sprintId}
        />
      </Card>
    );
  }
}

export default StatusWrap;
