import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Icon, DatePicker, Popover, Dropdown, Menu, Modal, Form, Select } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import AccumulationStore from '../../../../../stores/project/accumulation/AccumulationStore';
import AccumulationFilter from '../AccumulationComponent/AccumulationFilter';
import './AccumulationHome.scss';
import '../../BurndownChart/BurndownChartHome/BurndownChartHome.scss';
import '../../../../main.scss';

const { AppState } = stores;

@observer
class AccumulationHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeVisible: false,
      reportVisible: false,
      filterList: [],
      columnDatas: [],
      timeId: '',
      startDate: '',
      endDate: '',
      boardList: [],
      options: {},
      options2: {},
      optionsVisible: false,
      sprintData: {},
    };
  }
  componentWillMount() {
    AccumulationStore.axiosGetFilterList().then((data) => {
      const newData = _.clone(data);
      _.forEach(newData, (item, index) => {
        newData[index].check = false;
      });
      AccumulationStore.setFilterList(newData);
      ScrumBoardStore.axiosGetBoardList().then((res) => {
        const newData2 = _.clone(res);
        let newIndex;
        _.forEach(newData2, (item, index) => {
          if (item.userDefault) {
            newData2[index].check = true;
            newIndex = index;
          } else {
            newData2[index].check = false;
          }
        });
        AccumulationStore.setBoardList(newData2);
        this.getColumnData(res[newIndex].boardId, true);
      }).catch((error) => {
        window.console.log(error);
      });
      // this.getData();
    }).catch((error) => {
      window.console.log(error);
    });
  }
  getColumnData(id, type) {
    ScrumBoardStore.axiosGetBoardData(id, 0, false, []).then((res2) => {
      const data2 = res2.columnsData.columns;
      _.forEach(data2, (item, index) => {
        data2[index].check = true;
      });
      this.setState({
        sprintData: res2.currentSprint,
      });
      AccumulationStore.setColumnData(data2);
      AccumulationStore.axiosGetProjectInfo().then((res) => {
        AccumulationStore.setProjectInfo(res);
        AccumulationStore.setStartDate(moment(res.creationDate.split(' ')[0]));
        if (type) {
          this.getData();
        }
      }).catch((error) => {
        window.console.log(error);
      });
    }).catch((error) => {
      window.console.log(error);
    });
  }
  getData() {
    const columnData = AccumulationStore.getColumnData;
    const endDate = AccumulationStore.getEndDate.format('YYYY-MM-DD HH:mm:ss');
    const filterList = AccumulationStore.getFilterList;
    const startDate = AccumulationStore.getStartDate.format('YYYY-MM-DD HH:mm:ss');
    const columnIds = [];
    const quickFilterIds = [];
    _.forEach(columnData, (cd) => {
      if (cd.check) {
        columnIds.push(cd.columnId);
      }
    });
    _.forEach(filterList, (fl) => {
      if (fl.check) {
        quickFilterIds.push(fl.filterId);
      }
    });
    AccumulationStore.axiosGetAccumulationData({
      columnIds,
      endDate,
      quickFilterIds,
      startDate,
    }).then((res) => {
      AccumulationStore.setAccumulationData(res);
      this.getOption();
    }).catch((error) => {
      window.console.log(error);
    });
  }
  getOption() {
    const data = _.clone(AccumulationStore.getAccumulationData);
    const legendData = [];
    _.forEach(data, (item) => {
      legendData.push({
        icon: 'rect',
        name: item.name,
      });
    });
    const newxAxis = [];
    _.forEach(data[0].coordinateDTOList, (item) => {
      if (newxAxis.length === 0) {
        newxAxis.push(item.date.split(' ')[0]);
      } else if (newxAxis.indexOf(item.date.split(' ')[0]) === -1) {
        newxAxis.push(item.date.split(' ')[0]);
      }
    });
    window.console.log(legendData);
    window.console.log(newxAxis);
    const legendSeries = [];
    _.forEach(data, (item, index) => {
      legendSeries.push({
        name: item.name,
        type: 'line',
        // stack: '总量',
        areaStyle: { normal: {
          color: item.color,
        } },
        lineStyle: { normal: {
          color: item.color,
        } },
        itemStyle: {
          normal: { color: item.color },
        },
        data: [],
      });
      _.forEach(newxAxis, (item2) => {
        let date = '';
        let max = 0;
        _.forEach(item.coordinateDTOList, (item3) => {
          if (item3.date.split(' ')[0] === item2) {
            if (date === '') {
              date = item3.date;
              max = item3.issueCount;
            } else if (moment(item3.date).isAfter(date)) {
              date = item3.date;
              max = item3.issueCount;
            }
          }
        });
        legendSeries[index].data.push(max);
      });
    });
    window.console.log(legendSeries);
    this.setState({
      options: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {
          right: '0%',
          data: legendData,
        },
        grid: {
          left: '3%',
          right: '3%',
          containLabel: true,
        },
        toolbox: {
          left: 'center',
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
            },
          },
        },
        xAxis: [
          {
            name: '日期',
            type: 'category',
            boundaryGap: false,
            data: newxAxis,
          },
        ],
        yAxis: [
          {
            name: '问题数',
            type: 'value',
          },
        ],
        series: legendSeries,
        dataZoom: [{
          startValue: newxAxis[0],
          type: 'slider',
          // right: '50%',
          // left: '0%',
        }],
      },
      optionsVisible: false,
    });
  }
  getTimeType(data, type, array) {
    let result;
    if (array) {
      result = [];
    }
    _.forEach(data, (item) => {
      if (item.check) {
        if (array) {
          result.push(String(item[type]));
        } else {
          result = item[type];
        }
      }
    });
    return result;
  }
  handleClick(e) {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    if (e.key === '0') {
      history.push(`/agile/reporthost/burndownchart?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
    }
    if (e.key === '1') {
      history.push(`/agile/reporthost/sprintreport?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
    }
    if (e.key === '2') {
      history.push(`/agile/reporthost/versionReport?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
    }
  }
  // handleOnBrushSelected(params) {
  //   window.console.log(params);
  // }
  render() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    const menu = (
      <Menu onClick={this.handleClick.bind(this)}>
        <Menu.Item key="0">
        燃尽图
        </Menu.Item>
        <Menu.Item key="1">
        Sprint报告
        </Menu.Item>
        <Menu.Item key="2">
        版本报告
        </Menu.Item>
      </Menu>
    );
    // const onEvents = {
    //   brushSelected: this.handleOnBrushSelected.bind(this),
    // };
    return (
      <Page>
        <Header
          title="累积流量图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <Button funcTyp="flat" onClick={() => { this.getData(); }}>
            <Icon type="refresh" />刷新
          </Button>
          <Dropdown placement="bottomCenter" trigger={['click']} overlay={menu}>
            <Button icon="arrow_drop_down" funcTyp="flat">
              切换报表
            </Button>
          </Dropdown>
        </Header>
        {
          !_.isNull(this.state.sprintData) ? (
            <Content
              title={`迭代冲刺“${this.state.sprintData.sprintName ? this.state.sprintData.sprintName : ''}”的累积流量图`}
              description="显示状态的问题。这有助于您识别潜在的瓶颈, 需要对此进行调查。"
              link="#"
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div className="c7n-accumulation-filter">
                <Button>
                  {`${AccumulationStore.getStartDate.format('D/M/YYYY')}到${AccumulationStore.getEndDate.format('D/M/YYYY')}(${this.getTimeType(AccumulationStore.getTimeData, 'name')})`}
                </Button>
                <Button
                  style={{ color: '#3F51B5' }} 
                  icon="settings"
                  onClick={() => {
                    this.setState({
                      optionsVisible: true,
                    });
                  }}
                >修改报告</Button>
                {
                  this.state.optionsVisible ? (
                    <AccumulationFilter
                      visible={this.state.optionsVisible}
                      getTimeType={this.getTimeType.bind(this)}
                      getColumnData={this.getColumnData.bind(this)}
                      getData={this.getData.bind(this)}
                      onCancel={() => {
                        this.getColumnData(this.getTimeType(AccumulationStore.getBoardList, 'boardId'));
                        this.setState({
                          optionsVisible: false,
                        });
                      }}
                    />
                  ) : ''
                }
              </div>
              <div className="c7n-accumulation-report" style={{ flexGrow: 1, height: '100%' }}>
                <ReactEcharts
                  option={this.state.options}
                  style={{
                    height: '600px',
                  }}
                  notMerge
                  lazyUpdate
                />
              </div>
            </Content>
          ) : (
            <div 
              className="c7n-chart-noSprint c7n-accumulation-nosprint"
            >
              <div className="c7n-chart-icon">
                <Icon type="info_outline" />
              </div>
              <p style={{ marginLeft: 20 }}>该面板无可用冲刺</p>
            </div>
          )
        }
      </Page>
    );
  }
}

export default Form.create()(AccumulationHome);

