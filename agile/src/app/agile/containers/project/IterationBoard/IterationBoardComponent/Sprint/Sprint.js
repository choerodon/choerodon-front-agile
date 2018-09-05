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
      loading: true,
      sprintId: undefined,
      sprintInfo: {},
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sprintId !== this.props.sprintId) {
      const sprintId = nextProps.sprintId;
      this.setState({
        sprintId,
      });
      this.loadSprintInfo(sprintId);
    }
  }

  loadSprintInfo(sprintId) {
    if (!sprintId) {
      this.setState({
        loading: false,
        sprintInfo: {},
      });
    } else {
      this.setState({ loading: true });
      const projectId = AppState.currentMenuType.id;
      axios.get(`/agile/v1/projects/${projectId}/iterative_worktable/sprint?sprintId=${sprintId}`)
        .then((res) => {
          this.setState({
            sprintInfo: res,
            loading: false,
          });
        });
    }
  }

  renderUserHead() {
    const { sprintInfo: { assigneeIssueDTOList } } = this.state;
    return (
      <div className="users">
        {
          assigneeIssueDTOList && assigneeIssueDTOList.map(user => (
            <UserHead
              user={{
                id: user.assigneeId,
                loginName: '',
                realName:  user.assigneeName,
                avatar: user.imageUrl,
              }}
              hiddenText
            />
          ))
        }
      </div>
    );
  }

  render() {
    const { completeInfo, loading, sprintInfo } = this.state;
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
              <div className="count">{sprintInfo.issueCount || '0'}个问题可见</div>
              <div className="goal text-overflow-hidden">冲刺目标：{sprintInfo.sprintGoal || ''}</div>
              <div className="time">{sprintInfo.startDate} ~ {sprintInfo.endDate}</div>
           </div>
         )
       }
      </div>
    );
  }
}
export default Sprint;