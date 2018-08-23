import React, { Component } from 'react';
import { Progress } from 'choerodon-ui';
import './UncompleteTaskHome.scss';

class UncompleteTaskHome extends Component {
  render() {
    const totalCount = 172;
    const completeCount = 43;
    return (
      <div className="c7n-unCompleteTaskHome">
        <Progress 
          type="circle" 
          percent={completeCount / totalCount * 100} 
          format={complete => (
            <span className="c7n-unCompleteTaskHome-inner">
              <span className="c7n-unCompleteTaskHome-innerNum">{Math.round(totalCount * complete / 100)}</span>
              <span className="c7n-unCompleteTaskHome-innerUnit">个</span>
            </span>
          )}
        />
      </div>
    );
  }
}
export default UncompleteTaskHome;
