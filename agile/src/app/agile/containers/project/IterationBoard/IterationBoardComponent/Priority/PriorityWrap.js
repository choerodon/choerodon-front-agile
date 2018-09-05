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
    const { sprintId } = this.props;

    return (
      <Card
        title={'优先级分布'}
      >
        <Prio
          sprintId={sprintId}
        />
      </Card>
    );
  }
}
export default Priority;
