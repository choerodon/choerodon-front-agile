import React, { Component } from 'react';
import { Spin } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import EmptyBlockDashboard from '../../../../../../components/EmptyBlockDashboard';
import pic2 from '../../EmptyPics/no_version.svg';
import './Assignee.scss';

const { AppState } = stores;

class VersionProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      assigneeInfo: [],
    };
  }

  componentDidMount() {
    this.loadAssignee();
  }

  getOption() {
    const { assigneeInfo } = this.state;
    const data = assigneeInfo.map(v => ({
      name: v.name || '未分配',
      value: v.value,
    }));
    const allCount = _.reduce(assigneeInfo, (sum, n) => sum + n.value, 0);
    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
        },
        formatter(params) {
          const res = `${params.name}：${params.value}<br/>占比：
            ${((params.value / allCount).toFixed(2) * 100).toFixed(0)}%`;
          return res;
        },
        extraCssText: 
          'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
      },
      series: [
        {
          color: ['#9665e2', '#f7667f', '#fad352', '#45a3fc', '#56ca77'],
          type: 'pie',
          radius: '95px',
          hoverAnimation: false,
          center: ['50%', '50%'],
          data,
          itemStyle: {
            normal: {
              borderWidth: 2,
              borderColor: '#fff',
            },
          },
        },
      ],
    };
    return option;
  }

  loadAssignee() {
    const projectId = AppState.currentMenuType.id;
    this.setState({ loading: true });
    axios.get(`agile/v1/projects/${projectId}/reports/pie_chart?fieldName=assignee`)
      .then((res) => {
        this.setState({
          loading: false,
          assigneeInfo: res,
        });
      });
  }

  renderContent() {
    const { loading, assigneeInfo } = this.state;
    if (loading) {
      return (
        <div className="c7n-loadWrap">
          <Spin />
        </div>
      );
    }
    if (assigneeInfo.every(v => v.issueNum === 0)) {
      return (
        <div className="c7n-loadWrap">
          <EmptyBlockDashboard
            pic={pic2}
            des="当前冲刺下无问题"
          />
        </div>
      );
    }
    return (
      <ReactEcharts
        option={this.getOption()}
        style={{ height: 303 }}
      />
    );
  }

  render() {
    return (
      <div className="c7n-reportBoard-assignee">
        {this.renderContent()}
      </div>
    );
  }
}

export default VersionProgress;
