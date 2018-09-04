import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import EmptyBlockDashboard from '../../../../../../components/EmptyBlockDashboard';
import pic from './no_version.svg';
import './Status.scss';

const { AppState } = stores;

class Status extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
  }

  getOption() {
    const currentVersion = this.state.currentVersion;
    const option = {
      legend: {
        orient: 'vertical',
        x: '60%',
        y: 'center',
        data: [
          {
            name: '待处理',
            icon: 'circle',
          }, 
          {
            name: '处理中',
            icon: 'circle',
          }, 
          {
            name: '已完成',
            icon: 'circle',
          }
        ],
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 16,
        textStyle: {
          fontSize: '13',
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
        },
        formatter(params) {
          let res;
          res = `${params.name}：${params.value}<br/>占比： ${params.value}%`;
          return res;
        },
        extraCssText: 
          'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
      },
      series: [
        {
          // name: '访问来源',
          color: ['#FFB100', '#4D90FE', '#00BFA5'],
          type: 'pie',
          radius: '60px',
          avoidLabelOverlap: false,
          hoverAnimation: false,
          // legendHoverLink: false,
          center: ['35%', '50%'],
          label: {
            normal: {
              show: false,
              position: 'center',
              textStyle: {
                fontSize: '13',
              },
            },
            emphasis: {
              show: false,
              
            },
          },
          data: [
            { value: 10, name: '待处理' },
            { value: 20, name: '处理中' },
            { value: 30, name: '已完成' },
          ],
          itemStyle: { 
            normal: { 
              borderColor: '#FFFFFF', borderWidth: 1, 
            },
          },
        },
      ],
    };
    return option;
  }

  render() {
    const {
      versionList, currentVersion, currentVersionId, loading, 
    } = this.state;
    return (
      <div className="c7n-VersionProgress">
        <ReactEcharts
          option={this.getOption()}
          style={{ height: 144 }}
        />
      </div>
    );
  }
}
export default Status;
