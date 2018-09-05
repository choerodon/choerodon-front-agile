import React, { Component } from 'react';
import Card from '../Card';
import Sprint from './Sprint';

class SprintWrap extends Component {
  render() {
    const { sprintId, sprintName, link } = this.props;

    return (
      <Card
        title={sprintName}
        link={link}
      >
        <Sprint
          sprintId={sprintId}
        />
      </Card>
    );
  }
}

export default SprintWrap;
