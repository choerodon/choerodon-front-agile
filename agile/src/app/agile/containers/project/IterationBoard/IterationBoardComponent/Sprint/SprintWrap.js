import React, { Component } from 'react';
import Card from '../Card';
import Sprint from './Sprint';

class SprintWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sprintName: '',
    };
  }

  componentDidMount() {
  }

  render() {
    const { sprintId, sprintName } = this.props;

    return (
      <Card
        title={sprintName}
      >
        <Sprint
          sprintId={sprintId}
        />
      </Card>
    );
  }
}
export default SprintWrap;
