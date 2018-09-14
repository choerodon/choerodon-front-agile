import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import Card from '../Card';
import './VersionProgress.scss';

class VersionProgress extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  loadData() {

  }

  getOption() {
    const option = {
      tooltip: {
        trigger: 'axis',
        // axisPointer : {            // 坐标轴指示器，坐标轴触发有效
        //     type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        // }
      },
      legend: {
        orient: 'vertical',
        top: '30%',
        right: 30,
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
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
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
          name: '百分比',
          nameTextStyle: {
            fontSize: 12,
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
          data: [320, 332, 301, 334, 390, 330, 320],
          itemStyle: {
            color: '#FFB100',
          },
        },
        {
          name: '处理中',
          type: 'bar',
          data: [120, 132, 101, 134, 90, 230, 210],
          itemStyle: {
            color: '#45A3FC',
          },
        },
        {
          name: '已完成',
          type: 'bar',
          data: [862, 1018, 964, 1026, 1679, 1600, 1570],
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
      <div className="c7n-reportBoard-versionProgress">
        <div className="c7n-versionProgress-content">
          <ReactEcharts 
            style={{ height: 230 }}
            option={this.getOption()}
          />
        </div>
      </div>
    );
  }
}

export default VersionProgress;
