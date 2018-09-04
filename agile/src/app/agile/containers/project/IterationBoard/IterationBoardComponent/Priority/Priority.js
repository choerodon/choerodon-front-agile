import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { Spin } from 'choerodon-ui';
import PriorityTag from '../../../../../components/PriorityTag';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';
import pic from './empty.png';
import './index.scss';

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

class MineUnDone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
  }

  renderContent() {
    const { loading, issues } = this.state;
    if (loading) {
      return (
        <div className="loading-wrap">
          <Spin />
        </div>
      );
    }
    if (issues && !issues.length) {
      return (
        <div className="loading-wrap">
          <EmptyBlockDashboard
            pic={pic}
            des="当前没有我的未完成的任务"
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
    return (
      <div className="list">
        <div className="tip">30/60</div>
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
                width: '50%',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="c7n-agile-dashboard-mineUndone">
        {this.renderContent()}
      </div>
    );
  }
}

export default MineUnDone;
