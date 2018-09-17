import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import { Icon, Spin } from 'choerodon-ui';
import pic from './no_issue.png';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';
import './IssueType.scss';

const { AppState } = stores;

class IssueType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      sprintId: undefined,
      issueTypeInfo: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sprintId !== this.state.sprintId) {
      this.setState({
        sprintId: nextProps.sprintId,
      });
    }
    if (nextProps.sprintId != undefined) {
      this.loadIssueTypeData(nextProps.sprintId); 
    }
  }

  getCategoryCount(code) {
    const { issueTypeInfo } = this.state;
    const datas = [];
    const typeCodes = ['story', 'bug', 'task', 'sub_task'];
    for (let i = 0; i < typeCodes.length; i++) {
      const typeIndex = issueTypeInfo.findIndex(item => item.typeCode === typeCodes[i]);
      if (typeIndex === -1) {
        datas[i] = 0;
      } else {
        const statusIndex = issueTypeInfo[typeIndex].issueStatus.findIndex(status => status.categoryCode === code);
        if (statusIndex === -1) {
          datas[i] = 0;
        } else {
          datas[i] = issueTypeInfo[typeIndex].issueStatus[statusIndex].issueNum;
        }
      }
    }
    return datas;
  }
  

  getOption() {
    const { issueTypeInfo } = this.state;
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
        backgroundColor: '#fff',
        textStyle: {
          color: 'rgba(0,0,0,0.64)',
        },
      },
      legend: {
        orient: 'vertical',
        data: ['待处理', '处理中', '已完成'],
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 48,
        icon: 'rect',
        right: 0,
        top: 35,
      },
      grid: {
        left: '0%',
        top: '28px',
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
        splitLine: {
          // show: true, 
          //  改变轴线颜色
          lineStyle: {
            // 使用深浅的间隔色
            color: 'rgba(0,0,0,0.12)',
          },                            
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
          barCategoryGap: '28px',
          data: this.getCategoryCount('doing'),
          itemStyle: {
            color: '#45A3FC',
          }, 
        },
        {
          name: '待处理',
          type: 'bar',
          stack: '计数',
          data: this.getCategoryCount('todo'),
          itemStyle: {
            color: ' #FFB100',
          },
        },
        {
          name: '已完成',
          type: 'bar',
          stack: '计数',
          data: this.getCategoryCount('done'),
          itemStyle: {
            color: '#00BFA5',
          },
        },
      ],
    };
    return option;
  }

  loadIssueTypeData(sprintId) {
    const projectId = AppState.currentMenuType.id;
    this.setState({
      loading: true,
    });
    axios.get(`/agile/v1/projects/${projectId}/iterative_worktable/issue_type?sprintId=${sprintId}`)
      .then((res) => {
        if (res && res.length) {
          this.setState({
            loading: false,
            issueTypeInfo: res,
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      });
  }

  
  renderContent() {
    const { loading, sprintId } = this.state;
    if (loading) {
      return (
        <div className="c7n-IssueType-loading">
          <Spin />
        </div>
      );
    }
    if (!sprintId) {
      this.setState({
        loading: false,    
      });
      return (
        <div className="c7n-IssueType-empty">
          <EmptyBlockDashboard
            pic={pic}
            des="当前冲刺下没有问题"
          />
        </div>
      );
    }
    return (
      <div className="c7n-IssueType-chart">
        <ReactEcharts
          style={{ height: 230 }}
          option={this.getOption()}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="c7n-IssueType">
        {this.renderContent()}
      </div>
    );
  }
}

export default IssueType;
