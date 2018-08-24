import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';
import {
  Dropdown, Icon, Menu, Spin,
} from 'choerodon-ui';
import {
  DashBoardNavBar, DashBoardToolBar, stores, axios,
} from 'choerodon-front-boot';
import TypeTag from '../../components/TypeTag';
import PriorityTag from '../../components/PriorityTag';
import StatusTag from '../../components/StatusTag';
import './index.scss';

const { AppState } = stores;

class BurnDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sprint: {},
      unit: 'remainingEstimatedTime',
      loading: true,
    };
  }

  componentDidMount() {
    this.loadSprints();
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
      },
      legend: {
        top: '0',
        right: '40',
        data: [{
          name: '期望值',
          icon: 'line',
        }, {
          name: '剩余值',
          icon: 'line',
        }],
      },
      grid: {
        y2: 30,
        top: '40',
        left: '20',
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
          interval: 0,
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
          margin: 18,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
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
            color: 'rgba(0, 0, 0, 0.65)',
          },
          lineStyle: {
            type: 'dotted',
            color: 'rgba(0, 0, 0, 0.65)',
          },
        },
        {
          symbol: 'none',
          name: '剩余值',
          type: 'line',
          itemStyle: {
            color: '#ff5555',
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

  loadSprints() {
    const projectId = AppState.currentMenuType.id;
    axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint/names`, ['started', 'closed'])
      .then((res) => {
        if (res && res.length) {
          this.setState({ sprint: res[0] });
          this.loadChartData(res[0].sprintId);
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
        const xData = this.getBetweenDateStr(dataMinDate, maxDate);
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
    const { sprint: { sprintId } } = this.state;
    this.setState({ unit: key });
    this.loadChartData(sprintId, key);
  }

  render() {
    const { loading } = this.state;
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
        <DashBoardToolBar>
          <Dropdown overlay={menu} trigger={['click']}>
            <div className="ant-dropdown-link c7n-agile-dashboard-burndown-select">
              {'单位选择'}
              <Icon type="arrow_drop_down" />
            </div>
          </Dropdown>
        </DashBoardToolBar>
        {
          loading ? (
            <div className="loading-wrap">
              <Spin />
            </div>
          ) : (
            <ReactEcharts
              style={{
                height: 200,
              }}
              option={this.getOption()}
            />
          )
        }
        <DashBoardNavBar>
          <a
            role="none"
            onClick={() => {
              history.push(`/agile/backlog?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
              return false;
            }}
          >
            {'转至报告'}
          </a>
        </DashBoardNavBar>
      </div>

    );
  }
}

export default withRouter(BurnDown);
