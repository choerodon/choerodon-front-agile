import React, { Component } from 'react';
import { stores } from 'choerodon-front-boot';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import { Icon, Spin } from 'choerodon-ui';
import pic from './no_issue.png';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';

import './IssueType.scss';
import Sprint from '../Sprint/Sprint';
// import { AppState } = stores;

class IssueType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      currentSprint: {},
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // if (this.nextProps.currentSprint.sprintId === this.props.currentSprint.sprintId) {
    //   return false;
    // }
    // this.state.currentSprint = this.nextProps.currentSprint;
    // return true;
  }

  getOption() {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      // legend: {
      //     data: ['待处理', '处理中','已完成']
      // },
      grid: {
        left: '0%',
        top: '26px',
        right: '28%',
        bottom: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ['故事', '故障', '任务', '子任务'],
      },
      yAxis: {
        name: '问题计数',
        nameTextStyle: {
          color: 'rgba(0,0,0,0.64)',
                
        },
        type: 'value',
        itemStyle: {
          color: 'rgba(0,0,0,0.64)',
        },
      },
      axisLine: {
        lineStyle: {
          opacity: 0,
        },
      },
      axisTick: {
        lineStyle: {
          color: 'transparent',
        },
      },
      axisLabel: {
        color: 'rgba(0,0,0,0.64)',
      },
      series: [
        {
          name: '处理中',
          type: 'bar',
          stack: '计数',
          //   barWidth: '24px',
          // barGap: 0,
          barCategoryGap: '28px',
          
          //   label: {
          //     normal: {
          //     //   show: true,
          //     //   position: 'insideRight',
          //     },
          //   },
          data: [
            {
              value: 50,
              itemStyle: {
                color: '#45A3FC',
              }, 
            },
            {
              value: 30,
              itemStyle: {
                color: '#45A3FC',
              }, 
            },
            {
              value: 50,
              itemStyle: {
                color: '#45A3FC',
              }, 
            },
            {
              value: 25,
              itemStyle: {
                color: '#45A3FC',
              }, 
            },
          ],
        },
        {
          name: '待处理',
          type: 'bar',
          stack: '计数',
          //   barWidth: '24px',
          //   barGap: '117%',
          //   barCategoryGap:'117%',
          //   label: {
          //     normal: {
          //       show: true,
          //       position: 'insideRight',
          //     },
          //   },
          data: [
            {
              value: 20,
              itemStyle: {
                color: ' #FFB100',
              }, 
            },
            {
              value: 30,
              itemStyle: {
                color: '#FFB100',
              }, 
            },
            {
              value: 10,
              itemStyle: {
                color: '#FFB100',
              }, 
            },
            {
              value: 25,
              itemStyle: {
                color: '#FFB100',
              }, 
            },
          ],
        },
        {
          name: '已完成',
          type: 'bar',
          stack: '计数',
          //   barWidth: '24px',
          //      barGap: '117%',
          //   barCategoryGap:'117%',
          //   label: {
          //     normal: {
          //       show: true,
          //       position: 'insideRight',
          //     },
          //   },
          data: [
            {
              value: 40,
              itemStyle: {
                color: '#00BFA5',
              }, 
            },
            {
              value: 30,
              itemStyle: {
                color: ' #00BFA5',
              }, 
            },
            {
              value: 20,
              itemStyle: {
                color: ' #00BFA5',
              }, 
            },
            {
              value: 25,
              itemStyle: {
                color: ' #00BFA5',
              }, 
            },
          ],
        },
      ],
    };
    return option;
  }

  renderContent() {
    const { loading } = this.state;
    if (loading) {
      return (
        <div className="c7n-IssueType-loading">
          <Spin />
        </div>
      );
    }
    if (!currentSprint || !currentSprint.sprintId) {
      this.setState({
        loading: false,
          
      });
    }
  }

  render() {
    return (
      <div className="c7n-IssueType">
        <div className="c7n-IssueType-chart">
          <ReactEcharts
            style={{ height: 230 }}
            option={this.getOption()}
          />
          <ul className="c7n-IssueType-chart-legend">
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
      </div>
    );
  }
}

export default IssueType;
