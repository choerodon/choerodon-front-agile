import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';
import {
  Dropdown, Icon, Menu, Spin,
} from 'choerodon-ui';
import {
  DashBoardNavBar, stores, axios,
} from 'choerodon-front-boot';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';
import pic from '../EmptyPics/no_sprint.svg';
import lineLegend from './Line.svg';
import './BurnDown.scss';

const { AppState } = stores;

class BurnDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sprintId: undefined,
      sprint: {},
      unit: 'remainingEstimatedTime',
      loading: true,
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sprintId !== this.props.sprintId) {
      const sprintId = nextProps.sprintId;
      this.setState({
        sprintId,
      });
      this.loadSprints(sprintId);
    }
  }

  getyAxisName(unit) {
    const UNIT_NAME = {
      remainingEstimatedTime: '剩余时间',
      storyPoints: '故事点',
      issueCount: '问题计数',
    };
    return UNIT_NAME[unit] || '';
  }

  getOption() {
    const {
      unit, xAxis, yAxis, expectCount, sprint: { startDate, endDate },
    } = this.state;
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
        },
        extraCssText: 
          'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
      },
      legend: {
        top: '0',
        right: '40',
        itemHeight: 2,
        data: [{
          name: '期望值',
          icon: `image://${lineLegend}`,
        }, {
          name: '剩余值',
          icon: 'line',
        }],
      },
      grid: {
        y2: 30,
        top: '40',
        left: 0,
        right: '40',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxis,
        axisTick: { show: false },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },
        axisLabel: {
          show: true,
          interval: parseInt(xAxis.length / 7) ? parseInt(xAxis.length / 7) - 1 : 0,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 9,
            fontStyle: 'normal',
          },
        },
        splitLine: {
          show: true,
          onGap: false,
          interval: 0,
          lineStyle: {
            color: ['#eee'],
            width: 1,
            type: 'solid',
          },
        },
      },
      yAxis: {
        name: this.getyAxisName(unit),
        nameTextStyle: {
          color: '#000',
        },
        nameGap: 22,
        type: 'value',
        axisTick: { show: false },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },
        axisLabel: {
          show: true,
          interval: 'auto',
          margin: 8,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
          },
          formatter(value, index) {
            if (unit === 'remainingEstimatedTime' && value) {
              return `${value}h`;
            } else {
              return value;
            }
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 1,
          },
        },
      },
      series: [
        {
          symbol: 'none',
          name: '期望值',
          type: 'line',
          data: [
            [startDate.split(' ')[0].slice(5).replace('-', '/'), expectCount],
            [endDate.split(' ')[0].slice(5).replace('-', '/'), 0],
          ],
          itemStyle: {
            color: 'rgba(0,0,0,0.65)',
          },
          lineStyle: {
            type: 'dotted',
            color: 'rgba(0,0,0,0.65)',
          },
        },
        {
          symbol: 'none',
          name: '剩余值',
          type: 'line',
          itemStyle: {
            color: '#4f9bff',
          },
          data: yAxis,
        },
      ],
    };
  }

  getBetweenDateStr(start, end) {
    const result = [];
    const beginDay = start.split('-');
    const endDay = end.split('-');
    const diffDay = new Date();
    const dateList = [];
    let i = 0;
    diffDay.setDate(beginDay[2]);
    diffDay.setMonth(beginDay[1] - 1);
    diffDay.setFullYear(beginDay[0]);
    result.push(start);
    while (i == 0) {
      const countDay = diffDay.getTime() + 24 * 60 * 60 * 1000;
      diffDay.setTime(countDay);
      dateList[2] = diffDay.getDate();
      dateList[1] = diffDay.getMonth() + 1;
      dateList[0] = diffDay.getFullYear();
      if (String(dateList[1]).length == 1) { dateList[1] = `0${dateList[1]}`; }
      if (String(dateList[2]).length == 1) { dateList[2] = `0${dateList[2]}`; }
      result.push(`${dateList[0]}-${dateList[1]}-${dateList[2]}`);
      if (dateList[0] == endDay[0] && dateList[1] == endDay[1] && dateList[2] == endDay[2]) {
        i = 1;
      }
    }
    return result;
  }

  loadSprints(sprintId) {
    const projectId = AppState.currentMenuType.id;
    this.setState({ loading: true });
    axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint/names`, ['started', 'closed'])
      .then((res) => {
        if (res && res.length) {
          const sprint = res.find(v => v.sprintId === sprintId);
          this.setState({ sprint });
          this.loadChartData(sprintId);
        } else {
          this.setState({ loading: false });
        }
      });
  }

  loadChartData(sprintId, unit = 'remainingEstimatedTime') {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/reports/${sprintId}/burn_down_report/coordinate?type=${unit}`)
      .then((res) => {
        const dataDates = Object.keys(res.coordinate);
        const [dataMinDate, dataMaxDate] = [dataDates[0], dataDates[dataDates.length - 1]];
        const { sprint: { endDate } } = this.state;
        const sprintMaxDate = endDate.split(' ')[0];
        const maxDate = moment(dataMaxDate).isBefore(moment(sprintMaxDate))
          ? sprintMaxDate : dataMaxDate;
        let allDate;
        if (moment(maxDate).isBefore(sprintMaxDate)) {
          allDate = this.getBetweenDateStr(dataMinDate, sprintMaxDate);
        } else if (moment(dataMinDate).isSame(maxDate)) {
          allDate = [dataMinDate];
        } else {
          allDate = this.getBetweenDateStr(dataMinDate, maxDate);
        }
        const xData = allDate;
        // const xData = this.getBetweenDateStr(dataMinDate, maxDate);
        const xDataFormat = _.map(xData, item => item.slice(5).replace('-', '/'));
        const yAxis = xData.map((data, index) => {
          if (dataDates.includes(data)) return res.coordinate[data];
          if (moment(data).isAfter(dataMaxDate)) return null;
          res.coordinate[data] = res.coordinate[xData[index - 1]];
          return res.coordinate[xData[index - 1]];
        });
        this.setState({
          expectCount: res.expectCount,
          xAxis: xDataFormat,
          yAxis,
          loading: false,
        });
      });
  }

  handleChangeUnit({ key }) {
    this.setState({ loading: true });
    const { sprintId } = this.state;
    this.setState({ unit: key });
    this.loadChartData(sprintId, key);
  }

  renderContent() {
    const { loading, sprint: { sprintId } } = this.state;
    if (loading) {
      return (
        <div className="loading-wrap">
          <Spin />
        </div>
      );
    }
    if (!sprintId) {
      return (
        <div className="loading-wrap">
          <EmptyBlockDashboard
            pic={pic}
            des="当前项目下无活跃或结束冲刺"
          />
        </div>
      );
    }
    return (
      <ReactEcharts
        style={{ height: 400 }}
        option={this.getOption()}
      />
    );
  }

  render() {
    const { loading, sprint: { sprintId } } = this.state;
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    const menu = (
      <Menu onClick={this.handleChangeUnit.bind(this)}>
        <Menu.Item key="remainingEstimatedTime">剩余时间</Menu.Item>
        <Menu.Item key="storyPoints">故事点</Menu.Item>
        <Menu.Item key="issueCount">问题计数</Menu.Item>
      </Menu>
    );
    return (
      <div className="c7n-agile-dashboard-burndown">
        <div className="switch" style={{ display: !loading && !sprintId ? 'none' : 'block' }}>
          <Dropdown overlay={menu} trigger={['click']} getPopupContainer={triggerNode => triggerNode.parentNode}>
            <div className="ant-dropdown-link c7n-agile-dashboard-burndown-select">
              {'单位选择'}
              <Icon type="arrow_drop_down" />
            </div>
          </Dropdown>
        </div>
        {this.renderContent()}
      </div>

    );
  }
}

export default withRouter(BurnDown);
