import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import { stores, axios } from 'choerodon-front-boot';
import { Spin } from 'choerodon-ui';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';
import pic from './no_issue.png';
import './IterationType.scss';

const { AppState } = stores;
class IterationType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      iterationTypeInfo: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  getOption() {
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      // legend: {
      //   data: ['待处理', '处理中', '已完成'],
      //   itemWidth: 14,
      //   itemHeight: 14,
      //   itemGap: 48,
      //   icon: 'rect',
      // },
      grid: {
        left: '0%',
        top: '26px',
        right: '28%',
        bottom: 30,
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: ['故事', '故障', '任务', '子任务'],
          axisLine: {
            show: false,
                
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            fontSize: 12,
            color: 'rgba(0,0,0,0.65)',
          },
        },
      ],
      yAxis: [
        {
          name: '问题计数',
          nameTextStyle: {
            fontSize: 12,
            color: 'rgba(0,0,0,0.64)',  
          },
          type: 'value',
          axisLine: {
            show: false,
                
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            fontSize: 12,
            color: 'rgba(0,0,0,0.65)',
          },
        },
      ],
      series: [
        {
          name: '待处理',
          type: 'bar',
          stack: '广告',
          data: [120, 132, 101, 134],
          barCategoryGap: '28px',
          itemStyle: {
            color: '#FFB100',
          },
        },
        {
          name: '处理中',
          type: 'bar',
          stack: '广告',
          data: [220, 182, 191, 234],
          itemStyle: {
            color: '#45A3FC',
          },
        },
        {
          name: '已完成',
          type: 'bar',
          stack: '广告',
          data: [150, 232, 201, 154],
          itemStyle: {
            color: ' #00BFA5',
          },
        },
      ],
    };


    return option;
  }

  loadData = () => {
    const projectId = AppState.currentMenuType.id;
    this.setState({
      loading: true,
    });
    axios.get(`/agile/v1/projects/${projectId}/iterative_worktable/issue_type?sprintId=781`)
      .then((res) => {
        if (res && res.length) {
          this.setState({
            loading: false,
            iterationTypeInfo: res,
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      });
  }

  renderContent() {
    const { loading, iterationTypeInfo } = this.state;
    if (loading) {
      return (
        <div className="c7n-IterationType-loading">
          <Spin />
        </div>
      );
    }
    if (!iterationTypeInfo || !iterationTypeInfo.length) {
      this.setState({
        loading: false,
      });
      return (
        <div className="c7n-IterationType-emptyBlock">
          <EmptyBlockDashboard
            pic={pic}
            des="当前迭代下没有问题"
          />
        </div>
      );
    }
    return (
      <div className="c7n-iterationType-chart">
        <ReactEcharts 
          style={{ height: 226 }}
          option={this.getOption()}
        />
        <ul className="c7n-iterationType-chart-legend">
          <li>
            <div />
            {'待处理'}
          </li>
          <li>
            <div />
            {'处理中'}
          </li>
          <li>
            <div />
            {'已完成'}
          </li>
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div className="c7n-reportBoard-IterationType">
        <div className="c7n-IterationType-content">
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default IterationType;
