import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Button, Icon, Select, Tabs, Table, Dropdown, Menu } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';
import VersionReportStore from '../../../../../stores/project/versionReport/VersionReport';
import './VersionReportHome.scss';
import '../../../../main.scss';

const { AppState } = stores;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

@observer
class VersionReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {},
      chosenVersion: '',
      datas: [{
        status: 'done',
        page: 0,
        size: 10,
      }, {
        status: 'unfinished',
        page: 0,
        size: 10,
      }, {
        status: 'unfinishedUnestimated',
        page: 0,
        size: 10,
      }],
    };
  }
  componentWillMount() {
    VersionReportStore.axiosGetVersionList().then((res) => {
      VersionReportStore.setVersionList(res);
      this.setState({
        chosenVersion: String(res[0].versionId),
      }, () => {
        this.updateIssues(this.state.datas);
        this.getReportData();
      });
    }).catch((error) => {
      window.console.log(error);
    });
  }
  getReportData() {
    VersionReportStore.axiosGetReportData(this.state.chosenVersion).then((res) => {
      VersionReportStore.setReportData(res);
      this.getOptions();
    }).catch((error) => {
      window.console.log(error);
    });
  }
  getAddIssues(date, type, string) {
    const data = VersionReportStore.getReportData.versionReport;
    let addIssues = [];
    _.forEach(data, (item) => {
      if (item.changeDate.split(' ')[0] === date) {
        if (item[type]) {
          addIssues = [...addIssues, ...item[type]];
        }
      }
    });
    let result = '';
    if (addIssues.length > 0) {
      result += `<p>${string}:</p>`;
      _.forEach(addIssues, (item) => {
        result += `<p>${item.issueNum} 改变故事点: ${item.changeStoryPoints ? item.changeStoryPoints : 0}</p>`;
      });
    }
    return result;
  }
  getOptions() {
    Date.prototype.format = function () {
      let s = '';
      const mouth = (this.getMonth() + 1) >= 10 ? (this.getMonth() + 1) : (`0${this.getMonth() + 1}`);
      const day = this.getDate() >= 10 ? this.getDate() : (`0${this.getDate()}`);
      s += `${this.getFullYear()}-`; // 获取年份。
      s += `${mouth}-`; // 获取月份。
      s += day; // 获取日。
      return (s); // 返回日期。
    };

    function getAll(begin, end) {
      const ab = begin.split('-');
      const ae = end.split('-');
      const db = new Date();
      db.setUTCFullYear(ab[0], ab[1] - 1, ab[2]);
      const de = new Date();
      de.setUTCFullYear(ae[0], ae[1] - 1, ae[2]);
      const unixDb = db.getTime();
      const unixDe = de.getTime();
      const result = [];
      for (let k = unixDb; k <= unixDe;) {
        result.push((new Date(parseInt(k))).format());
        k += 24 * 60 * 60 * 1000;
      }
      return result;
    }
    const version = VersionReportStore.getReportData.version;
    let startDate;
    let endDate;
    if (version.startDate) {
      startDate = version.startDate.split(' ')[0];
    } else {
      startDate = version.creationDate.split(' ')[0];
    }
    if (version.releaseDate) {
      endDate = version.releaseDate.split(' ')[0];
    } else {
      endDate = VersionReportStore.getReportData.versionReport[0].changeDate.split(' ')[0];
    }
    const xAxis = getAll(startDate, endDate);
    const data = VersionReportStore.getReportData.versionReport;
    const seriesData = {};
    _.forEach(data, (item) => {
      if (!seriesData[item.changeDate.split(' ')[0]]) {
        seriesData[item.changeDate.split(' ')[0]] = {
          time: item.changeDate,
          total: item.totalStoryPoints,
          complete: item.completedStoryPoints,
          percent: parseInt(item.unEstimatedPercentage * 100, 10),
        };
      } else if (moment(item.changeDate).isAfter(seriesData[item.changeDate.split(' ')[0]].time)) {
        seriesData[item.changeDate.split(' ')[0]] = {
          time: item.changeDate,
          total: item.totalStoryPoints,
          complete: item.completedStoryPoints,
          percent: parseInt(item.unEstimatedPercentage * 100, 10),
        };
      }
    });
    const total = [];
    const complete = [];
    const percent = [];
    _.forOwn(seriesData, (value, key) => {
      total.push([
        key, value.total,
      ]);
      complete.push([
        key, value.complete,
      ]);
      percent.push([
        key, value.percent,
      ]);
    });
    const options = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          return `
            <div>
              <p>日期: ${params[0].data[0]}</p>
              <p>总计故事点: ${params[0].data[1]}</p>
              <p>已完成故事点: ${params[1].data[1]}</p>
              <p>未预估问题的百分比: ${params[2].data[1]}</p>
              ${this.getAddIssues(params[0].data[0], 'addIssues', '添加的问题')}
              ${this.getAddIssues(params[0].data[0], 'completedIssues', '完成的问题')}
              ${this.getAddIssues(params[0].data[0], 'removeIssues', '移出的问题')}
              ${this.getAddIssues(params[0].data[0], 'storyPointsChangIssues', '故事点改变的问题')}
              ${this.getAddIssues(params[0].data[0], 'unCompletedIssues', '未完成的问题')}
            </div>
          `;
        },
      },
      legend: {
        selectedMode: false,
        top: 20,
        right: 100,
        orient: 'horizontal',
        data: [{
          icon: 'roundRect',
          name: '总计故事点',
          // textStyle: {
          //   backgroundColor: 'rgba(77,144,254,0.10)',
          // },
        }, {
          icon: 'roundRect',
          name: '已完成故事点',
          // textStyle: {
          //   backgroundColor: 'rgba(0,191,165,0.10)',
          // },
        }, {
          icon: 'roundRect',
          name: '未预估问题的百分比',
          // textStyle: {
          //   backgroundColor: 'rgba(244,67,54,0.10)',
          // },
        }],
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '3%',
        containLabel: true,
      },
      // toolbox: {
      //   feature: {
      //     saveAsImage: {},
      //   },
      // },
      xAxis: {
        type: 'time',
        data: xAxis,
        name: '日期',
      },
      yAxis: [{
        name: '故事点',
        type: 'value',
      }, {
        name: '百分比',
        type: 'value',
      }],
      series: [
        {
          name: '总计故事点',
          type: 'line',
          step: 'start',
          data: total,
          yAxisIndex: 0,
          itemStyle: {
            normal: { color: '#4D90FE' },
          },
        },
        {
          name: '已完成故事点',
          type: 'line',
          step: 'middle',
          data: complete,
          yAxisIndex: 0,
          itemStyle: {
            normal: { color: '#00BFA5' },
          },
        },
        {
          name: '未预估问题的百分比',
          type: 'line',
          step: 'end',
          data: percent,
          yAxisIndex: 1,
          itemStyle: {
            normal: { color: '#F44336' },
          },
        },
      ],
    };
    this.setState({
      options,
    });
  }
  updateIssues(data) {
    _.forEach(data, (item) => {
      VersionReportStore.axiosGetIssues(this.state.chosenVersion, item).then((res2) => {
        VersionReportStore.setIssues(item.status, 'data', res2.content);
        VersionReportStore.setIssues(item.status, 'pagination', {
          current: res2.number + 1,
          total: res2.totalElements,
          pageSize: res2.size,
        });
      }).catch((error2) => {
        window.console.log(error2);
      });
    });
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
      history.push(`/agile/reporthost/accumulation?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
    }
  }
  renderTabTable(type) {
    const columns = [{
      title: '关键字',
      dataIndex: 'issueNum',
      key: 'issueNum',
    }, {
      title: '概要',
      dataIndex: 'summary',
      key: 'summary',
    }, {
      title: '问题类型',
      dataIndex: 'typeName',
      key: 'typeName',
    }, {
      title: '优先级',
      dataIndex: 'priorityName',
      key: 'priorityName',
    }, {
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
    }, {
      title: '故事点',
      dataIndex: 'storyPoints',
      key: 'storyPoints',
    }];
    return (
      <Table
        dataSource={VersionReportStore.getIssues[type].data}
        columns={columns}
        pagination={VersionReportStore.getIssues[type].pagination}
        onChange={(pagination, filters, sorter) => {
          const data = _.clone(this.state.datas);
          let newIndex;
          _.forEach(data, (item, index) => {
            if (item.status === type) {
              newIndex = index;
              data[index].page = pagination.current - 1;
              data[index].size = pagination.pageSize;
            }
          });
          this.setState({
            datas: data,
          }, () => {
            this.updateIssues([this.state.datas[newIndex]]);
          });
        }}
      />
    );
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
        <Menu.Item key="2">
        累积流量图
        </Menu.Item>
      </Menu>
    );
    return (
      <Page>
        <Header
          title="版本报告"
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
          title={`迭代冲刺“${VersionReportStore.getReportData.version ? VersionReportStore.getReportData.version.name : ''}”的版本报告`}
          description="跟踪对应的版本发布日期。这样有助于您监控此版本是否按时发布，以便工作滞后时能采取行动。"
          link="#"
        >
          <Select
            label="版本" 
            value={this.state.chosenVersion}
            style={{
              width: 512,
            }}
            onChange={(value) => {
              this.setState({
                chosenVersion: value,
              }, () => {
                this.updateIssues(this.state.datas);
                this.getReportData();
              });
            }}
          >
            {
              VersionReportStore.getVersionList.map(item => (
                <Option value={String(item.versionId)}>V {item.name}</Option>
              ))
            }
          </Select>
          <div className="c7n-versionReport-versionInfo">
            <p style={{ fontWeight: 'bold' }}>{VersionReportStore.getReportData.version && VersionReportStore.getReportData.version.releaseDate ? `发布于 ${VersionReportStore.getReportData.version.releaseDate}` : '未发布'}</p>
            <p style={{ color: '#3F51B5' }}>在“问题管理中”查看V {VersionReportStore.getReportData.version ? VersionReportStore.getReportData.version.name : ''}<Icon style={{ fontSize: 13 }} type="open_in_new" /></p>
          </div>
          <div className="c7n-versionReport-report">
            <ReactEcharts
              option={this.state.options}
              style={{
                height: '400px',
              }}
              notMerge
              lazyUpdate
            />
          </div>
          <div className="c7n-versionReport-issues">
            <Tabs defaultActiveKey="1">
              <TabPane tab="已完成的问题" key="1">
                {this.renderTabTable('done')}
              </TabPane>
              <TabPane tab="未完成的问题" key="2">
                {this.renderTabTable('unfinished')}  
              </TabPane>
              <TabPane tab="未完成的未预估问题" key="3">
                {this.renderTabTable('unfinishedUnestimated')}
              </TabPane>
            </Tabs>
          </div>
        </Content>
      </Page>
    );
  }
}

export default VersionReport;
