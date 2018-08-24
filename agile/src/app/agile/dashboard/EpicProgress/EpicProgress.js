import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import { withRouter } from 'react-router-dom';
import { Spin } from 'choerodon-ui';
import { DashBoardNavBar, stores, axios } from 'choerodon-front-boot';
import TypeTag from '../../components/TypeTag';
import PriorityTag from '../../components/PriorityTag';
import StatusTag from '../../components/StatusTag';
import './index.scss';

const { AppState } = stores;

class EpicProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.loadEpics();
  }

  getOption() {
    const { data } = this.state;
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        padding: [0, 40, 0, 30],
        itemWidth: 14,
        itemGap: 20,
        textStyle: {
          width: 100,
        },
        formatter(name) {
          return name.slice(0, 5);
        },
        data: [
          ...[
            data[0] ? data[0].summary : undefined,
            data[3] ? data[3].summary : undefined,
          ],
          '',
          ...[
            data[1] ? data[1].summary : undefined,
            data[4] ? data[4].summary : undefined,
          ],
          '',
          ...[
            data[2] ? data[2].summary : undefined,
            data[5] ? data[5].summary : undefined,
          ],
        ],
      },
      grid: {
        y2: 30,
        top: '100',
        left: '30',
        right: '40',
        containLabel: true,
      },
      calculable: true,
      xAxis: {
        type: 'category',
        boundaryGap: true,
        nameGap: -10,
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
          margin: 13,
          rotate: 40,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 9,
            fontStyle: 'normal',
          },
          formatter(value, index) {
            if (value.length > 5) {
              return `${value.slice(0, 5)}...`;
            } else {
              return value;
            }
          },
        },
        splitLine: {
          show: false,
          onGap: false,
          interval: 0,
          lineStyle: {
            color: ['#eee'],
            width: 1,
            type: 'solid',
          },
        },
        data: data.map(v => v.summary),
      },
      yAxis: {
        type: 'value',
        nameTextStyle: {
          color: '#000',
        },
        axisTick: { show: false },
        axisLine: {
          show: false,
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
          formatter(value, index) {
            return `${value}%`;
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
      series: data.map((v, i) => ({
        name: v.summary,
        type: 'bar',
        barWidth: 24,
        barGap: '-100%',
        itemStyle: {
          normal: {
            barBorderRadius: 2,
            color(params) {
              const colorList = [
                '#ffb100', '#303f9f', '#ff7043',
                '#f44336', '#f953ba', '#00bfa5',
              ];
              return colorList[i];
            },
          },
        },
        data: data.map((x, y) => (y === i ? x.progress : 0)),
      })),
    };
  }

  loadEpics() {
    const projectId = AppState.currentMenuType.id;
    axios.get(`/agile/v1/projects/${projectId}/issues/epics`)
      .then((res) => {
        this.handleEpics(res.slice(0, 6));
      });
  }

  handleEpics(epics) {
    const epicsProgress = epics.map(epic => ({
      issueId: epic.issueId,
      summary: epic.epicName,
      progress: this.calcProgress(epic.doneIssueCount, epic.issueCount),
    }));
    this.setState({
      data: epicsProgress,
      loading: false,
    });
  }

  calcProgress(doneCount, count) {
    if (!count) return 0;
    return ((doneCount / count).toFixed(2) * 100).toFixed(0);
  }

  render() {
    const { loading } = this.state;
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    return (
      <div className="c7n-agile-dashboard-epicProgress">
        {
          loading ? (
            <div className="loading-wrap">
              <Spin />
            </div>
          ) : (
            <ReactEcharts className="c7n-chart" option={this.getOption()} />
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
            {'转至待办事项'}
          </a>
        </DashBoardNavBar>
      </div>
    );
  }
}

export default withRouter(EpicProgress);
