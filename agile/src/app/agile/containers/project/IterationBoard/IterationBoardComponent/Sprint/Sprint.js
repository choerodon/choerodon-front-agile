import React, { Component } from 'react';
import { axios, stores } from 'choerodon-front-boot';
import { Spin } from 'choerodon-ui';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';
import pic from '../EmptyPics/no_sprint.svg';
import UserHead from '../../../../../components/UserHead';
import './Sprint.scss';

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

  componentWillReceiveProps(nextProps) {
    const { sprintId } = this.props;
    if (nextProps.sprintId !== sprintId) {
      const newSprintId = nextProps.sprintId;
      this.setState({
        sprintId: newSprintId,
      });
      this.loadSprintInfo(newSprintId);
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

  renderContent() {
    const { loading, sprintInfo, sprintId } = this.state;
    if (loading) {
      return (
        <div className="c7n-loadWrap">
          <Spin />
        </div>
      );
    }
    if (!sprintId) {
      return (
        <div className="c7n-loadWrap">
          <EmptyBlockDashboard
            pic={pic}
            des="当前项目下无活跃或结束冲刺"
          />
        </div>
      );
    }
    return (
      <div>
        {this.renderUserHead()}
        <div className="count">
          {`${sprintInfo.issueCount || '0'}个问题可见`}
        </div>
        <div className="goal text-overflow-hidden">
          {`冲刺目标：${sprintInfo.sprintGoal || ''}`}
        </div>
        <div className="time">
          {`${sprintInfo.startDate} ~ ${sprintInfo.endDate}`}
        </div>
      </div>
    );
  }

  renderUserHead() {
    const { sprintInfo: { assigneeIssueDTOList } } = this.state;
    return (
      <div className="users">
        {
          assigneeIssueDTOList && assigneeIssueDTOList.map(user => (
            <div key={user.assigneeId}>
              <UserHead
                user={{
                  id: user.assigneeId,
                  loginName: '',
                  realName: user.assigneeName,
                  avatar: user.imageUrl,
                }}
                hiddenText
              />
            </div>
          ))
        }
      </div>
    );
  }

  render() {
    return (
      <div className="c7n-sprintDashboard-sprint">
        {this.renderContent()}
      </div>
    );
  }
}

export default Sprint;
