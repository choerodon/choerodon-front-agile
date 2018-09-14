import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import Card from '../Card';
import './IterationType.scss';

class IterationType extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  getOption() {
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['待处理', '处理中', '已完成'],
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 48,
        icon: 'rect',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
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
        },
      ],
      series: [
        {
          name: '待处理',
          type: 'bar',
          stack: '广告',
          data: [120, 132, 101, 134],
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

  render() {
    return (
      <div className="c7n-reportBoard-IterationType">
        <div className="c7n-IterationType-content">
          <ReactEcharts 
            style={{ height: 230 }}
            option={this.getOption()}
          />
        </div>
      </div>
    );
  }
}

export default IterationType;
