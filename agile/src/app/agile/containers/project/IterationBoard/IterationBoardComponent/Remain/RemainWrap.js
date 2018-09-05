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
    const { sprintId, sprintName } = this.props;
    
    return (
      <Card
        title={'距离冲刺结束'}
      >
        <Remain
          sprintId={sprintId}
        />
      </Card>
    );
  }
}
export default RemainWrap;
