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
      optionsVisible: false,
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
        _.forEach(newData2, (item, index) => {
          if (index === 0) {
            newData2[index].check = true;
          } else {
            newData2[index].check = false;
          }
        });
        AccumulationStore.setBoardList(newData2);
        this.getColumnData(res[0].boardId, true);
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
      window.console.log(res2);
      const data2 = res2.columnsData.columns;
      _.forEach(data2, (item, index) => {
        data2[index].check = true;
      });
      AccumulationStore.setColumnData(data2);
      if (type) {
        this.getData();
      }
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
      window.console.log(res);
      AccumulationStore.setAccumulationData(res);
      this.getOption();
    }).catch((error) => {
      window.console.log(error);
    });
  }
  getOption() {
    // 维度
    const legendData = AccumulationStore.getAccumulationData.columnDTOList;
    // series数据
    const legendSeries = [];
    // x轴
    const newxAxis = [];
    const data = AccumulationStore.getAccumulationData;
    _.forEach(data.columnChangeDTOList, (item) => {
      if (newxAxis.indexOf(item.date.split(' ')[0]) === -1) {
        newxAxis.push(item.date.split(' ')[0]);
      }
    });
    _.forEach(legendData, (item, index) => {
      legendSeries.push({
        name: item.name,
        type: 'line',
        stack: '总量',
        areaStyle: { normal: {} },
        data: [],
      });
      _.forEach(newxAxis, (item2, index2) => {
        let num = 0;
        _.forEach(data.columnChangeDTOList, (item3) => {
          if (String(item3.columnTo) === String(item.columnId)) {
            if (item3.date.split(' ')[0] === item2) {
              num += 1;
            }
          }
        });
        legendSeries[index].data.push(num);
      });
    });
    window.console.log('维度----------------------');
    window.console.log(legendData);
    window.console.log('x轴-----------------------');
    window.console.log(newxAxis);
    window.console.log('series数据-------------------');
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
          data: legendData,
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
            boundaryGap: false,
            data: newxAxis,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: legendSeries,
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
  }
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
      </Menu>
    );
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
        <Content
          title="迭代冲刺“xxxx”的累积流量图"
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
                height: '400px',
              }}
              notMerge
              lazyUpdate
            />
          </div>
        </Content>
      </Page>
    );
  }
}

export default Form.create()(AccumulationHome);

