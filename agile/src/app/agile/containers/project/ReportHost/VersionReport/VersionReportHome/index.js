import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Button, Icon, Select, Tabs, Table, Dropdown, Menu, Tooltip } from 'choerodon-ui';
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
      type: 'storyPoints',
    };
  }
  componentWillMount() {
    VersionReportStore.axiosGetVersionList().then((res) => {
      VersionReportStore.setVersionList(res);
      this.setState({
        chosenVersion: String(res[0].versionId),
      }, () => {
        this.updateIssues(this.state.datas);
        this.getReportData(this.state.type);
      });
    }).catch((error) => {
      window.console.log(error);
    });
  }
  getReportData(type) {
    VersionReportStore.axiosGetReportData(this.state.chosenVersion, type).then((res) => {
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
        result += `<p>${item.issueNum} 改变${this.renderYname()}: ${item.changeField ? item.changeField : 0}</p>`;
      });
    }
    return result;
  }

  getOptions() {
    // Date.prototype.format = function () {
    //   let s = '';
    //   const mouth = (this.getMonth() + 1) >= 10 ? (this.getMonth() + 1) : (`0${this.getMonth() + 1}`);
    //   const day = this.getDate() >= 10 ? this.getDate() : (`0${this.getDate()}`);
    //   s += `${this.getFullYear()}-`; // 获取年份。
    //   s += `${mouth}-`; // 获取月份。
    //   s += day; // 获取日。
    //   return (s); // 返回日期。
    // };

    // function getAll(begin, end) {
    //   const ab = begin.split('-');
    //   const ae = end.split('-');
    //   const db = new Date();
    //   db.setUTCFullYear(ab[0], ab[1] - 1, ab[2]);
    //   const de = new Date();
    //   de.setUTCFullYear(ae[0], ae[1] - 1, ae[2]);
    //   const unixDb = db.getTime();
    //   const unixDe = de.getTime();
    //   const result = [];
    //   for (let k = unixDb; k <= unixDe;) {
    //     result.push((new Date(parseInt(k))).format());
    //     k += 24 * 60 * 60 * 1000;
    //   }
    //   return result;
    // }
    const version = VersionReportStore.getReportData.version;
    // let startDate;
    // let endDate;
    // if (version.startDate) {
    //   startDate = version.startDate.split(' ')[0];
    // } else {
    //   startDate = version.creationDate.split(' ')[0];
    // }
    // if (version.releaseDate) {
    //   endDate = version.releaseDate.split(' ')[0];
    // } else {
    //   endDate = VersionReportStore.getReportData.versionReport[0].changeDate.split(' ')[0];
    // }
    const data = VersionReportStore.getReportData.versionReport;
    const xAxis = [];
    const seriesData = {};
    _.forEach(data, (item) => {
      xAxis.push(item.changeDate.split(' ')[0]);
      if (!seriesData[item.changeDate.split(' ')[0]]) {
        seriesData[item.changeDate.split(' ')[0]] = {
          time: item.changeDate,
          total: item.totalField,
          complete: item.completedField,
          percent: parseInt(item.unEstimatedPercentage * 100, 10),
        };
      } else if (moment(item.changeDate).isAfter(seriesData[item.changeDate.split(' ')[0]].time)) {
        seriesData[item.changeDate.split(' ')[0]] = {
          time: item.changeDate,
          total: item.totalField,
          complete: item.completedField,
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
    if (moment(version.startDate).isBefore(data[data.length - 1].changeDate)) {
      total.unshift([version.startDate.split(' ')[0], total[0][1]]);
      complete.unshift([version.startDate.split(' ')[0], complete[0][1]]);
      percent.unshift([version.startDate.split(' ')[0], percent[0][1]]);
      xAxis.unshift(version.startDate.split(' ')[0]);
    }
    const options = {
      tooltip: {
        trigger: 'axis',
        formatter: params => `
            <div>
              <p>日期: ${params[0].data[0]}</p>
              <p>总计故事点: ${params[0].data[1]}</p>
              <p>已完成故事点: ${params[1].data[1]}</p>
              <p>未预估问题的百分比: ${params[2].data[1]}</p>
              ${this.getAddIssues(params[0].data[0], 'addIssues', '添加的问题')}
              ${this.getAddIssues(params[0].data[0], 'completedIssues', '完成的问题')}
              ${this.getAddIssues(params[0].data[0], 'removeIssues', '移出的问题')}
              ${this.getAddIssues(params[0].data[0], 'fieldChangIssues', '改变的问题')}
              ${this.getAddIssues(params[0].data[0], 'unCompletedIssues', '未完成的问题')}
            </div>
          `,
      },
      legend: {
        selectedMode: false,
        top: 20,
        right: 100,
        orient: 'horizontal',
        data: [{
          icon: 'roundRect',
          name: this.renderLegendName('total'),
          // textStyle: {
          //   backgroundColor: 'rgba(77,144,254,0.10)',
          // },
        }, {
          icon: 'roundRect',
          name: this.renderLegendName('completed'),
          // textStyle: {
          //   backgroundColor: 'rgba(0,191,165,0.10)',
          // },
        }, {
          icon: 'roundRect',
          name: this.renderLegendName('percent'),
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
        type: 'category',
        data: xAxis,
        name: '日期',
      },
      yAxis: [{
        name: this.renderYname(),
        type: 'value',
      }, {
        name: '百分比',
        type: 'value',
      }],
      series: [
        {
          name: this.renderLegendName('total'),
          type: 'line',
          step: 'start',
          data: total,
          yAxisIndex: 0,
          itemStyle: {
            normal: { color: '#4D90FE' },
          },
        },
        {
          name: this.renderLegendName('completed'),
          type: 'line',
          step: 'middle',
          data: complete,
          yAxisIndex: 0,
          itemStyle: {
            normal: { color: '#00BFA5' },
          },
        },
        {
          name: this.renderLegendName('percent'),
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
  renderUnitColumn(type) {
    let result = '';
    if (this.state.type === "storyPoints") {
      if (type === 'title') {
        result = '故事点';
      } else {
        result = 'storyPoints';
      }
    } else if (this.state.type === "remainingEstimatedTime") {
      if (type === 'title') {
        result = '剩余时间';
      } else {
        result = 'remainingTime';
      }
    }
    return result;
  }
  renderLegendName(type) {
    let result;
    if (this.state.type === 'storyPoints') {
      if (type === 'total') {
        result = '总计故事点';
      }
      if (type === 'completed') {
        result = '已完成故事点';
      }
      if (type === 'percent') {
        result = '未预估问题百分比';
      }
    }
    if (this.state.type === 'remainingEstimatedTime') {
      if (type === 'total') {
        result = '剩余预计时间';
      }
      if (type === 'completed') {
        result = '已完成剩余预计时间';
      }
      if (type === 'percent') {
        result = '未预估问题百分比';
      }
    }
    if (this.state.type === 'issueCount') {
      if (type === 'total') {
        result = '总问题数';
      }
      if (type === 'completed') {
        result = '已完成问题数';
      }
      if (type === 'percent') {
        result = '未预估问题百分比';
      }
    }
    return result;
  }
  renderTypecode(item, type) {
    if (item.typeCode === 'story') {
      if (type === 'background') {
        return '#00BFA5';
      } else {
        return (
          <Tooltip title="类型： 故事">
            <Icon style={{ color: 'white', fontSize: '14px' }} type="turned_in" />
          </Tooltip>
        );
      }
    }
    if (item.typeCode === 'task') {
      if (type === 'background') {
        return '#4D90FE';
      } else {
        return (
          <Tooltip title="类型： 任务">
            <Icon style={{ color: 'white', fontSize: '14px' }} type="assignment" />
          </Tooltip>
        );
      }
    }
    if (item.typeCode === 'bug') {
      if (type === 'background') {
        return '#F44336';
      } else {
        return (
          <Tooltip title="类型： 缺陷">
            <Icon style={{ color: 'white', fontSize: '14px' }} type="bug_report" />
          </Tooltip>
        );
      }
    }
    if (item.typeCode === 'issue_epic') {
      if (type === 'background') {
        return 'rgb(116, 59, 231)';
      } else {
        return (
          <Tooltip title="类型： 史诗">
            <Icon style={{ color: 'white', fontSize: '14px' }} type="priority" />
          </Tooltip>
        );
      }
    }
    return '';
  }
  renderPriorityStyle(type, item) {
    if (type === 'color') {
      if (item.priorityCode === 'medium') {
        return 'rgb(53, 117, 223)';
      } else if (item.priorityCode === 'high') {
        return 'rgb(255, 177, 0)';
      } else {
        return 'rgba(0, 0, 0, 0.36)';
      }
    } else if (item.priorityCode === 'medium') {
      return 'rgba(77, 144, 254, 0.2)';
    } else if (item.priorityCode === 'high') {
      return 'rgba(255, 177, 0, 0.12)';
    } else {
      return 'rgba(0, 0, 0, 0.08)';
    }
  }
  renderTabTable(type) {
    const columns = [{
      title: '关键字',
      dataIndex: 'issueNum',
      key: 'issueNum',
      render: text => <span style={{ color: '#3F51B5' }}>{text}</span>,
    }, {
      title: '概要',
      dataIndex: 'summary',
      key: 'summary',
    }, {
      title: '问题类型',
      dataIndex: 'typeName',
      key: 'typeName',
      render: (text, record) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: this.renderTypecode(record, 'background'),
              width: 20,
              height: 20,
              borderRadius: '50%',
              textAlign: 'center',
            }}
          >
            {this.renderTypecode(record, 'icon')}
          </div>
          <span style={{ marginLeft: 8 }}>{record.typeName}</span>
        </div>
      ),
    }, {
      title: '优先级',
      dataIndex: 'priorityName',
      key: 'priorityName',
      render: (text, record) => (
        <span
          style={{
            color: this.renderPriorityStyle('color', record),
            background: this.renderPriorityStyle('background', record),
            padding: '1px 4px',
          }}
        >
          {text}
        </span>
      ),
    }, {
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
      render: (text, record) => (
        <span 
          label="sprintIssue" 
          className="c7n-backlog-sprintIssueStatus"
          style={{
            background: record.statusColor ? record.statusColor : '#4d90fe',
            color: 'white',
            padding: '4px 6px',
          }}
        >{text}</span>
      ),
    }, {
      title: this.renderUnitColumn('title'),
      dataIndex: this.renderUnitColumn('index'),
      key: this.renderUnitColumn('index'),
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

  renderYname() {
    let result = '';
    if (this.state.type === 'storyPoints') {
      result = '故事点';
    }
    if (this.state.type === 'remainingEstimatedTime') {
      result = '剩余时间';
    }
    if (this.state.type === 'issueCount') {
      result = '问题计数';
    }
    return result;
  }

  goIssues() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramType=versionReport&paramId=${this.state.chosenVersion}&paramName=版本${VersionReportStore.getReportData.version ? VersionReportStore.getReportData.version.name : ''}中的问题`);
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
              width: 244,
            }}
            onChange={(value) => {
              this.setState({
                chosenVersion: value,
              }, () => {
                this.updateIssues(this.state.datas);
                this.getReportData(this.state.type);
              });
            }}
          >
            {
              VersionReportStore.getVersionList.map(item => (
                <Option value={String(item.versionId)}>V {item.name}</Option>
              ))
            }
          </Select>
          <Select
            label="单位" 
            value={this.state.type}
            style={{
              width: 244,
              marginLeft: 24,
            }}
            onChange={(value) => {
              this.setState({
                type: value,
              }, () => {
                this.updateIssues(this.state.datas);
                this.getReportData(this.state.type);
              });
            }}
          >
            {
              [{
                name: '故事点',
                id: 'storyPoints',
              }, {
                name: '剩余时间',
                id: 'remainingEstimatedTime',
              }, {
                name: '问题计数',
                id: 'issueCount',
              }].map(item => (
                <Option value={String(item.id)}>{item.name}</Option>
              ))
            }
          </Select>
          <div className="c7n-versionReport-versionInfo">
            <p style={{ fontWeight: 'bold' }}>{VersionReportStore.getReportData.version && VersionReportStore.getReportData.version.releaseDate ? `发布于 ${VersionReportStore.getReportData.version.releaseDate}` : '未发布'}</p>
            <p
              style={{ 
                color: '#3F51B5',
                cursor: 'pointer',
              }}
              role="none"
              onClick={this.goIssues.bind(this)}
            >在“问题管理中”查看V {VersionReportStore.getReportData.version ? VersionReportStore.getReportData.version.name : ''}<Icon style={{ fontSize: 13 }} type="open_in_new" /></p>
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
