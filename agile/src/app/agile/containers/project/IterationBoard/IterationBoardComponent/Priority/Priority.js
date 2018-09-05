import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { Spin } from 'choerodon-ui';
import PriorityTag from '../../../../../components/PriorityTag';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';
import pic from '../EmptyPics/no_sprint.svg';
import pic2 from '../EmptyPics/no_version.svg';
import './Priority.scss';

const { AppState } = stores;
const PRIORITY_MAP = {
  medium: {
    color: '#3575df',
    bgColor: 'rgba(77, 144, 254, 0.2)',
    name: '中',
  },
  high: {
    color: '#f44336',
    bgColor: 'rgba(244, 67, 54, 0.2)',
    name: '高',
  },
  low: {
    color: 'rgba(0, 0, 0, 0.36)',
    bgColor: 'rgba(0, 0, 0, 0.08)',
    name: '低',
  },
  default: {
    color: 'transparent',
    bgColor: 'transparent',
    name: '',
  },
};

class Priority extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sprintId: undefined,
      loading: true,
      priorityInfo: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { sprintId } = this.props;
    if (nextProps.sprintId !== sprintId) {
      const newSprintId = nextProps.sprintId;
      this.setState({
        sprintId: newSprintId,
      });
      this.loadPriorityInfo(newSprintId);
    }
  }

  loadPriorityInfo(sprintId) {
    if (!sprintId) {
      this.setState({
        loading: false,
        priorityInfo: {},
      });
    } else {
      this.setState({ loading: true });
      const projectId = AppState.currentMenuType.id;
      axios.get(`/agile/v1/projects/${projectId}/iterative_worktable/priority?sprintId=${sprintId}`)
        .then((res) => {
          const priorityInfo = this.transformPriority(res);
          this.setState({
            priorityInfo,
            loading: false,
          });
        });
    }
  }

  transformPriority(priorityArr) {
    const result = {};
    priorityArr.forEach((v, i) => {
      result[v.priorityCode] = v;
    });
    return result;
  }

  renderContent() {
    const { loading, priorityInfo, sprintId } = this.state;
    if (loading) {
      return (
        <div className="loading-wrap">
          <Spin />
        </div>
      );
    }
    if (!sprintId) {
      return (
        <div className="loading-wrap">
          <EmptyBlockDashboard
            pic={pic}
            des="当前项目下无活跃或结束冲刺"
          />
        </div>
      );
    }
    if (
      !priorityInfo.high.totalNum
      && !priorityInfo.medium.totalNum
      && !priorityInfo.low.totalNum
    ) {
      return (
        <div className="loading-wrap">
          <EmptyBlockDashboard
            pic={pic2}
            des="当前冲刺下无问题"
          />
        </div>
      );
    }
    return (
      <div className="lists">
        <h3 className="title">已完成/总计数</h3>
        {
          ['high', 'medium', 'low'].map(priority => this.renderList(priority))
        }
      </div>
    );
  }

  renderList(priority) {
    const { priorityInfo } = this.state;
    return (
      <div className="list" key={priority}>
        <div className="tip">
          {`${priorityInfo[priority].completedNum}/${priorityInfo[priority].totalNum}`}
        </div>
        <div className="body">
          <div>
            <PriorityTag
              priority={priority}
            />
          </div>
          <div className="progress">
            <div
              className="progress-bg"
              style={{ background: PRIORITY_MAP[priority].bgColor }}
            />
            <div
              className="progress-inner"
              style={{
                background: PRIORITY_MAP[priority].color,
                width: `${priorityInfo[priority].completedNum / priorityInfo[priority].totalNum * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="c7n-agile-sprintDashboard-priority">
        {this.renderContent()}
      </div>
    );
  }
}

export default Priority;
