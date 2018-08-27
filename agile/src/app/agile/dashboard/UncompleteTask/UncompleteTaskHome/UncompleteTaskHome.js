import React, { Component } from 'react';
import './UncompleteTaskHome.scss';
import Progress from '../../../components/Progress';

class UncompleteTaskHome extends Component {
  render() {
    const totalCount = 172;
    const completeCount = 88;
    return (
      <div className="c7n-unCompleteTaskHome">
        <Progress
          percent={completeCount / totalCount * 100}
          title={completeCount}
        />
      </div>
    );
  }
}
export default UncompleteTaskHome;
