import React, { Component } from 'react';
import { axios, stores } from 'choerodon-front-boot';
import './Sprint.scss';
import { Spin } from 'choerodon-ui';
import UserHead from '../../../../../components/UserHead';

const { AppState } = stores;
class Sprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
  }

  renderUserHead() {
    return (
      <div className="users">
        {
          [1, 2, 3].map(user => (
            <UserHead
              user={{
                id:1,
                loginName: '1',
                realName:  '1',
                avatar: '',
              }}
              hiddenText
            />
          ))
        }
      </div>
    );
  }

  render() {
    const { completeInfo, loading } = this.state;
    return (
      <div className="c7n-sprintDashboard-sprint">
        {
         loading ? (
           <div className="c7n-loadWrap">
             <Spin />
           </div>
         ) : (
           <div>
              {this.renderUserHead()}
              <div className="count">25个问题可见</div>
              <div className="goal">冲刺目标：功能完善+修复缺陷</div>
              <div className="time">2018年6月23日 ~ 2018年10月30日</div>
           </div>
         )
       }
      </div>
    );
  }
}
export default Sprint;