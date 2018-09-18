import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { Spin } from 'choerodon-ui';
import PriorityTag from '../../../../../components/PriorityTag';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';
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
      loading: true,
      priorityInfo: {},
    };
  }

  componentDidMount() {
    this.loadPriorityInfo();
  }

  loadPriorityInfo() {
    this.setState({ loading: true });
    const projectId = AppState.currentMenuType.id;
    axios.get(`agile/v1/projects/${projectId}/reports/issue_priority_distribution_chart`)
      .then((res) => {
        const priorityInfo = this.transformPriority(res);
        this.setState({
          priorityInfo,
          loading: false,
        });
      });
  }

  transformPriority(priorityArr) {
    const result = {};
    priorityArr.forEach((v) => {
      result[v.priorityCode] = v;
    });
    ['low', 'medium', 'high'].forEach((priorityCode) => {
      if (!result[priorityCode]) {
        result[priorityCode] = {
          priorityCode,
          name: PRIORITY_MAP[priorityCode].name,
          totalCount: 0,
          doneCount: 0,
        };
      }
    });
    return result;
  }

  renderContent() {
    const { loading, priorityInfo } = this.state;
    if (loading) {
      return (
        <div className="loading-wrap">
          <Spin />
        </div>
      );
    }
    if (
      !priorityInfo.high.totalCount
      && !priorityInfo.medium.totalCount
      && !priorityInfo.low.totalCount
    ) {
      return (
        <div className="loading-wrap">
          <EmptyBlockDashboard
            pic={pic2}
            des="当前项目下无问题"
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
          {`${priorityInfo[priority].doneCount}/${priorityInfo[priority].totalCount}`}
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
                width: `${priorityInfo[priority].doneCount / priorityInfo[priority].totalCount * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="c7n-agile-reportBoard-priority">
        {this.renderContent()}
      </div>
    );
  }
}

export default Priority;
