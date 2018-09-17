import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { Spin } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';
import pic from './no_issue.png';
import './VersionProgress.scss';

const { AppState } = stores;
class VersionProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      versionProgressInfo: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  getOption() {
    const option = {
      grid: {
        left: 0,
        right: 0,
        bottom: 30,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        // axisPointer : {            // 坐标轴指示器，坐标轴触发有效
        //     type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        // }
      },
      legend: {
        // top: ,
        // right: 30,
        data: ['待处理', '处理中', '已完成'],
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 48,
        icon: 'rect',
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
          axisLabel: {
            fontSize: 12,
            color: 'rgba(0,0,0,0.65)',
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
          data: [320, 332, 301, 334, 390, 330, 320],
          itemStyle: {
            color: '#FFB100',
          },
          barCategoryGap: '30px',
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

  loadData = () => {
    const projectId = AppState.currentMenuType.id;
    this.setState({
      loading: true,
    });
    axios.get(`/agile/v1/projects/${projectId}/`)
      .then((res) => {
        if (!res.length) {
          this.setState({
            loading: false,
          });
        }
        this.setState({
          loading: false,
          versionProgressInfo: res,
        });
      });
  }

  renderContent() {
    const { loading, versionProgressInfo } = this.state;
    if (loading) {
      return (
        <div className="c7n-versionProgress-loading">
          <Spin />
        </div>
      );
    }
    if (!versionProgressInfo || !versionProgressInfo.length) {
      return (
        <div className="c7n-versionProgress-EmptyBlock">
          <EmptyBlockDashboard
            pic={pic}
            des="当前版本下没有问题"
          />
        </div>
      );
    }
    return (
      <div className="c7n-versionProgress-chart">
        <ReactEcharts 
          style={{ height: 304 }}
          option={this.getOption()}
        />
      </div>
    );
  }
  

  render() {
    return (
      <div className="c7n-reportBoard-versionProgress">
        <div className="c7n-versionProgress-content">
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default VersionProgress;
