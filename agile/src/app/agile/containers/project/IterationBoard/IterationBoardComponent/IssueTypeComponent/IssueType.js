import React, { Component } from 'react';
import { stores } from 'choerodon-front-boot';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import { Icon } from 'choerodon-ui';

import './IssueType.scss';
// import { AppState } = stores;

class IssueType extends Component {
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
        // right: '4%',
        // bottom: '3%',
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
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight',
            },
          },
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
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight',
            },
          },
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
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight',
            },
          },
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

  render() {
    return (
      <div className="c7n-IssueType">
        <div className="c7n-IssueType-nav">
          <span>迭代问题类型分布</span>
          <Icon type="arrow_forward" />
        </div>
        <div className="c7n-IssueType-chart">
          <ReactEcharts
            // style={{ height: 200 }}
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
