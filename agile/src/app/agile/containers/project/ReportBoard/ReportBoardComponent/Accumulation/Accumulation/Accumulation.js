import React, { Component } from 'react';
import { Spin } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';
import EmptyBlockDashboard from '../../../../../../components/EmptyBlockDashboard';
// import pic2 from '../../EmptyPics/no_version.svg';
import pic2 from '../../../../../../assets/image/emptyChart.svg';
import './Accumulation.scss';

const { AppState } = stores;

class Accumulation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newxAxis: [],
      loading: true,
      chartData: [],
    };
  }

  componentDidMount() {
    this.loadAccumulation();
  }

  getOption() {
    const { chartData, newxAxis } = this.state;
    const sorceColors = [];
    const colors = ['#743BE7', '#F953BA', '#4090FE', '#d07da6', '#FFB100', '#00BFA5'];
    _.map(chartData, (item, index) => {
      if (sorceColors.includes(item.color)) {
        item.color = colors[index % 6];
      }
      sorceColors.push(item.color);
    });

    const legendData = chartData.map(v => ({
      icon: 'rect',
      name: v.name,
    }));

    const legendSeries = [];
    const reverseChartData = _.cloneDeep(_.reverse(chartData));

    _.forEach(reverseChartData, (v, index) => {
      let data = [];
      const dates = _.map(v.coordinateDTOList, 'date');
      data = newxAxis.map((time, i) => {
        if (dates.includes(time)) return v.coordinateDTOList.find(n => n.date === time).issueCount;
        const tar = v.coordinateDTOList.find(n => n.date === newxAxis[i - 1]);
        const temp = tar ? {
          date: time,
          issueCount: tar.issueCount,
        } : {
          date: time,
          issueCount: 0,
        };
        reverseChartData[index].coordinateDTOList.push(temp);
        return temp.issueCount;
      });
      legendSeries.push({
        name: reverseChartData[index].name,
        type: 'line',
        stack: true,
        areaStyle: {
          normal: {
            color: reverseChartData[index].color,
            opacity: 0.1,
          }, 
        },
        lineStyle: {
          normal: {
            color: reverseChartData[index].color,
          }, 
        },
        itemStyle: {
          normal: { color: reverseChartData[index].color },
        },
        data,
        symbol: 'circle',
      });
    });

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
        },
        extraCssText: 
          'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
        formatter(params) {
          let content = '';
          let paramsContent = params.map(item => {
            return (
              `<div style="font-size: 11px">
                <div style={display:inline-block; width: 10px; height: 10px; margin-right: 3px; border-radius: 50%; background:${item.color}}></div>
                ${item.seriesName}：${item.data} ${item.data ? ' 个' : ''}
              </div>`
            )
          });
          params.forEach((item, index, arr) => {
            content = `<div>
            <span>${params[0].axisValue}</span>
            <br />
           ${paramsContent.join('\n')}
          </div>`;
          });
          return content;
        },
      },
      legend: {
        top: '0',
        right: '40',
        data: legendData,
        itemGap: 30,
        itemWidth: 14,
        itemHeight: 14,
      },
      grid: {
        y2: 50,
        top: '40',
        left: '20',
        right: '40',
        containLabel: true,
      },
      xAxis: [
        {
          name: '日期',
          nameTextStyle: {
            color: '#000',
          },
          type: 'category',
          splitLine: {
            show: true,
            lineStyle: {
              // 使用深浅的间隔色
              color: 'rgba(116,59,231,0.10)',
              opacity: 0.9,
              // type: 'dashed',
            },
          },
          boundaryGap: false,
          data: _.map(newxAxis, v => v.split(' ')[0]),
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
            textStyle: {
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 10,
              fontStyle: 'normal',
            },
            formatter(value) {
              return value.slice(5, 10);
            },
          },
        },
      ],
      dataZoom: [{
        startValue: newxAxis[0],
        type: 'slider',
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        },
        // right: '50%',
        // left: '0%',
      }],
      yAxis: [
        {
          splitLine: {
            show: true,
            lineStyle: {
              // 使用深浅的间隔色
              color: 'rgba(116,59,231,0.10)',
              opacity: 0.9,
              // type: 'dashed',
            },
          },
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
            textStyle: {
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 12,
              fontStyle: 'normal',
            },
          },
          name: '问题数',
          nameGap: 22,
          nameTextStyle: {
            color: '#000',
          },
          type: 'value',
          minInterval: 1,
        },
      ],
      series: legendSeries,
    };
    return option;
  }

  loadAccumulation() {
    const projectId = AppState.currentMenuType.id;
    this.setState({ loading: true });
    axios.all([
      this.loadBoards(projectId),
      this.loadProjectInfo(projectId),
    ])
      .then(
        axios.spread((boards, projectInfo) => {
          const startDate = moment(projectInfo.creationDate.split(' ')[0]);
          const sd = startDate.format('YYYY-MM-DD HH:mm:ss');
          if (Object.prototype.toString.call(boards) === '[object Array]' && boards.length) {
            const targetBoard = boards.find(v => v.userDefault) || boards[0];
            this.loadBoardData(targetBoard.boardId, false, [])
              .then((boardData) => {
                const column = boardData && boardData.columnsData && boardData.columnsData.columns;
                const columnIds = _.map(column, 'columnId');
                this.loadChartData(targetBoard.boardId, sd, columnIds);
              });
          } else {
            window.console.warn('Can not get any board.');
          }   
        }),
      )
      .catch(() => {
        // this.setIsLoading(false);
        this.setState({
          loading: false,
        });      
      });
  }

  loadBoards(projectId = AppState.currentMenuType.id) {
    return axios.get(`/agile/v1/projects/${projectId}/board`);
  }

  loadBoardData(boardId, recent, filter, projectId = AppState.currentMenuType.id, assigneeFilterIds) {
    return axios.get(`/agile/v1/projects/${projectId}/board/${boardId}/all_data/${AppState.currentMenuType.organizationId}?onlyStory=${recent}&quickFilterIds=${filter}${assigneeFilterIds ? `&assigneeFilterIds=${assigneeFilterIds}` : ''}`);
  }

  loadProjectInfo(projectId = AppState.currentMenuType.id) {
    return axios.get(`/agile/v1/projects/${projectId}/project_info`);
  }

  loadChartData(boardId, startDate, columnIds, endDate = `${moment().format('YYYY-MM-DD')} 23:59:59`, quickFilterIds = [], assigneeFilterIds = []) {
    const obj = {
      columnIds,
      endDate,
      quickFilterIds,
      startDate,
      boardId,
      assigneeFilterIds,
    };
    this.setState({
      loading: true,
    });
    axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/reports/cumulative_flow_diagram`, obj)
      .then((res) => {
        let newxAxis = [];
        _.map(res, (item) => {
          if (item.coordinateDTOList && item.coordinateDTOList.length) {
            _.map(item.coordinateDTOList, (subItem) => {
              subItem.issueCount = subItem.issueCount < 0 ? 0 : subItem.issueCount;
            });
          }
        });
        res.forEach((v) => {
          const temp = newxAxis.concat(_.map(v.coordinateDTOList, 'date'));
          const uniq = [...new Set(temp)];
          newxAxis = uniq;
        });
        newxAxis = _.orderBy(newxAxis, item => new Date(item).getTime());
        this.setState({
          newxAxis,
          chartData: res,
          loading: false,
        });
      })
      .catch((e) => {
        this.setState({
          loading: false,
        });
      });
  }

  renderContent() {
    const { loading, newxAxis } = this.state;
    if (loading) {
      return (
        <div className="c7n-loadWrap">
          <Spin />
        </div>
      );
    }
    if (!newxAxis.length) {
      return (
        <div className="c7n-loadWrap">
          <EmptyBlockDashboard
            pic={pic2}
            des="未在当前看板上进行过活动"
          />
        </div>
      );
    }
    return (
      <ReactEcharts
        option={this.getOption()}
        style={{ height: 430 }}
      />
    );
  }

  render() {
    return (
      <div className="c7n-reportBoard-accumulation">
        {this.renderContent()}
      </div>
    );
  }
}

export default Accumulation;
