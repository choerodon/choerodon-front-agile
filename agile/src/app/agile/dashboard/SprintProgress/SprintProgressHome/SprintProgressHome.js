import React, { Component } from 'react';
import { Progress } from 'choerodon-ui';
import './SprintProgressHome.scss';

class SprintProgressHome extends Component {
  render() {
    const totalDay = 12;
    const pastDay = 8;
    return (
      <div className="c7n-SprintProgressHome">
        <p className="c7n-SprintStage">8/20-8/31 迭代冲刺</p>
        <p className="c7n-SprintPastDay">


剩余
          <span className="c7n-pastDay">{totalDay - pastDay}</span>


天
                </p>
        <div className="c7n-progress">
          <Progress percent={pastDay / totalDay * 100} showInfo={false} />
          <span className="c7n-sprintStart">8/20</span>
          <span className="c7n-sprintEnd">8/31</span>

        </div>
      </div>
    );
  }
}
export default SprintProgressHome;
