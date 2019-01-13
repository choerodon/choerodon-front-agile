import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import {
  Button, Icon, Select, Tabs, Table, Dropdown, Menu, Tooltip, Spin,
} from 'choerodon-ui';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';
import VersionReportStore from '../../../../../stores/project/versionReport/VersionReport';
import './VersionReportHome.scss';
import NoDataComponent from '../../Component/noData';
// import versionSvg from '../../Home/style/pics/no_version.svg';
import versionSvg from '../../../../../assets/image/emptyChart.svg';
import SwithChart from '../../Component/switchChart';
import { STATUS } from '../../../../../common/Constant';

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
      loading: false,
      linkFromParamUrl: undefined,
    };
  }

  componentWillMount() {
    const { location: { search } } = this.props;
    const linkFromParamUrl = _.last(search.split('&')).split('=')[0] === 'paramUrl' ? _.last(search.split('&')).split('=')[1] : undefined;
    this.setState({
      linkFromParamUrl,
    });

    VersionReportStore.axiosGetVersionList().then((res) => {
      VersionReportStore.setVersionList(res);
      this.setState({
        chosenVersion: String(res[0].versionId),
      }, () => {
        this.updateIssues(this.state.datas);
        this.getReportData(this.state.type);
      });
    }).catch((error) => {
    });
  }

  getReportData(type) {
    this.setState({
      loading: true,
    });
    VersionReportStore.axiosGetReportData(this.state.chosenVersion, type).then((res) => {
      VersionReportStore.setReportData(res);
      this.getOptions();
      this.setState({
        loading: false,
      });
    }).catch((error) => {
      this.setState({
        loading: false,
      });
    });
  }

  getAddIssues(date, type, string) {
    const data = VersionReportStore.getReportData.versionReport;
    let addIssues = [];
    for (let index = 0, len = data.length; index < len; index += 1) {
      if (data[index].changeDate.split(' ')[0] === date) {
        if (data[index][type]) {
          addIssues = [...addIssues, ...data[index][type]];
        }
      }
    }
    let result = '';
    if (addIssues.length > 0) {
      result += `<p>${string}:</p>`;
      for (let index = 0, len = addIssues.length; index < len; index += 1) {
        result += `<p>${addIssues[index].issueNum} `;
        if (this.state.type !== 'issueCount') {
          if (type === 'fieldChangIssues') {
            result += `${this.renderYname()}变化了: ${addIssues[index].changeField ? addIssues[index].changeField : 0}</p>`;
          } else {
            result += `${this.renderYname()}变化了: ${addIssues[index].newValue ? addIssues[index].newValue : 0}</p>`;
          }
        } else {
          result += '</p>';
        }
      }
    }
    return result;
  }

  renderLegendAreaStyle(type) {
    if (type === 'total') {
      return 'rgba(77,144,254,0.10)';
    } else if (type === 'completed') {
      return 'rgba(0,191,165,0.10)';
    } else {
      return 'rgba(244,67,54,0.10';
    }
  }

  getOptions() {
    const version = VersionReportStore.getReportData.version;
    const data = VersionReportStore.getReportData.versionReport.reverse();
    if (data.length === 0) {
      this.setState({
        options: {},
      });
      return;
    }
    let xAxis = [];
    const seriesData = {};
    for (let index = 0, len = data.length; index < len; index += 1) {
      if (xAxis.indexOf(data[index].changeDate.split(' ')[0]) === -1) {
        xAxis.push(data[index].changeDate.split(' ')[0]);
      }
      if (!seriesData[data[index].changeDate.split(' ')[0]]) {
        seriesData[data[index].changeDate.split(' ')[0]] = {
          time: data[index].changeDate,
          total: data[index].totalField,
          complete: data[index].completedField,
          percent: parseInt(data[index].unEstimatedPercentage * 100, 10),
        };
      } else if (moment(data[index].changeDate).isAfter(seriesData[data[index].changeDate.split(' ')[0]].time)) {
        seriesData[data[index].changeDate.split(' ')[0]] = {
          time: data[index].changeDate,
          total: data[index].totalField,
          complete: data[index].completedField,
          percent: parseInt(data[index].unEstimatedPercentage * 100, 10),
        };
      }
    }
    let total = [];
    let complete = [];
    let percent = [];
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
    if (version.startDate) {
      if (moment(version.startDate.split(' ')[0]).isBefore(data[0].changeDate.split(' ')[0])) {
        total.unshift([version.startDate.split(' ')[0], data[0].totalField]);
        complete.unshift([version.startDate.split(' ')[0], data[0].completedField]);
        percent.unshift([version.startDate.split(' ')[0], parseInt(data[0].unEstimatedPercentage, 10) * 100]);
        xAxis.unshift(version.startDate.split(' ')[0]);
      }
    }
    // 如果当前版本为发布
    if (version.statusCode === 'released') {
      // 如果有releaseDate
      if (version.releaseDate) {
        // 如果发布时间小于今天的时间
        const deleteItems = [];
        if (moment(version.releaseDate.split(' ')[0]).isBefore(data[data.length - 1].changeDate)) {
          xAxis = _.remove(xAxis, o => moment(o).isBefore(version.releaseDate) || moment(o).isSame(version.releaseDate));
          complete = _.remove(complete, o => moment(o[0]).isBefore(version.releaseDate) || moment(o[0]).isSame(version.releaseDate));
          percent = _.remove(percent, o => moment(o[0]).isBefore(version.releaseDate) || moment(o[0]).isSame(version.releaseDate));
          total = _.remove(total, o => moment(o[0]).isBefore(version.releaseDate) || moment(o[0]).isSame(version.releaseDate));
        } else if (moment(version.releaseDate.split(' ')[0]).isAfter(data[data.length - 1].changeDate)) {
          // 如果发布时间大于今天的时间
          xAxis.push(version.releaseDate.split(' ')[0]);
          total.push([version.releaseDate.split(' ')[0], data[data.length - 1].totalField]);
          complete.push([version.releaseDate.split(' ')[0], data[data.length - 1].completedField]);
          percent.push([version.releaseDate.split(' ')[0], parseInt(data[data.length - 1].unEstimatedPercentage, 10) * 100]);
        }
      }
    }
    let markAreaLengh = 0;
    if (xAxis.length >= 2) {
      markAreaLengh = parseInt(xAxis.length / 2, 10);
    }
    const markAreaData = [];
    for (let a = 0; a < markAreaLengh; a += 1) {
      markAreaData.push([{
        xAxis: 2 * a,
        itemStyle: {
          color: 'gainsboro',
          opacity: 0.5,
        },
      }, {
        xAxis: (2 * a) + 1,
      }]);
    }
    // ${this.getAddIssues(params[0].data[0], 'addIssues', '添加的问题')}
    // ${this.getAddIssues(params[0].data[0], 'completedIssues', '完成的问题')}
    // ${this.getAddIssues(params[0].data[0], 'removeIssues', '移出的问题')}
    // ${this.getAddIssues(params[0].data[0], 'fieldChangIssues', '改变的问题')}
    // ${this.getAddIssues(params[0].data[0], 'unCompletedIssues', '未完成的问题')}
    const options = {
      tooltip: {
        trigger: 'axis',
        formatter: params => `
            <div>
              <p>日期: ${params[0].data[0]}</p>
              <p>总计${this.renderYname()}: ${params[0].data[1]}</p>
              <p>已完成${this.renderYname()}: ${params[1].data[1]}</p>
              ${this.state.type === 'issueCount' ? '' : `<p>未预估问题的百分比: ${params[2].data[1]}%</p>`}
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
        boundaryGap: false,
        axisLabel: {
          formatter(value, index) {
            return `${value.split('-')[1]}/${value.split('-')[2]}`;
          },
        },
        // name: '日期',
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
          step: true,
          data: total,
          yAxisIndex: 0,
          itemStyle: {
            normal: { color: '#4D90FE' },
          },
          markArea: {
            silent: true,
            data: markAreaData,
          },
          areaStyle: {
            color: this.renderLegendAreaStyle('total'),
          },
        },
        {
          name: this.renderLegendName('completed'),
          type: 'line',
          step: true,
          data: complete,
          yAxisIndex: 0,
          itemStyle: {
            normal: { color: '#00BFA5' },
          },
          areaStyle: {
            color: this.renderLegendAreaStyle('completed'),
          },
        },
        this.state.type === 'issueCount' ? '' : {
          name: this.renderLegendName('percent'),
          type: 'line',
          step: true,
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
    for (let index = 0, len = data.length; index < len; index += 1) {
      VersionReportStore.axiosGetIssues(this.state.chosenVersion, data[index], this.state.type).then((res2) => {
        VersionReportStore.setIssues(data[index].status, 'data', res2.content);
        VersionReportStore.setIssues(data[index].status, 'pagination', {
          current: res2.number + 1,
          total: res2.totalElements,
          pageSize: res2.size,
        });
      }).catch((error2) => {
      });
    }
  }

  renderUnitColumn(type) {
    let result = '';
    if (this.state.type === 'storyPoints') {
      if (type === 'title') {
        result = '故事点';
      } else {
        result = 'storyPoints';
      }
    } else if (this.state.type === 'remainingEstimatedTime') {
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
    if (item.issueTypeDTO.typeCode === 'story') {
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
    if (item.issueTypeDTO.typeCode === 'task') {
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
    if (item.issueTypeDTO.typeCode === 'bug') {
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
    if (item.issueTypeDTO.typeCode === 'issue_epic') {
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

  renderTabTable(type) {
    const columns = [{
      title: '问题编号',
      dataIndex: 'issueNum',
      key: 'issueNum',
      render: (text, record) => (
        <span
          style={{
            color: '#3F51B5',
            cursor: 'pointer',
          }}
          role="none"
          onClick={() => {
            const { history } = this.props;
            const urlParams = AppState.currentMenuType;
            history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&paramName=${text}&paramIssueId=${record.issueId}&paramUrl=reporthost/versionReport`);
          }}
        >
          {text}
        </span>),
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
            color: record.priorityDTO ? record.priorityDTO.colour : '#FFFFFF',
            background: `${record.priorityDTO ? record.priorityDTO.colour : '#FFFFFF'}1F`,
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
            background: record.statusMapDTO ? STATUS[record.statusMapDTO.type] : '#4d90fe',
            color: 'white',
            padding: '4px 6px',
          }}
        >
          {record.statusMapDTO.name}
        </span>
      ),
    }, {
      title: this.renderUnitColumn('title'),
      dataIndex: this.renderUnitColumn('index'),
      key: this.renderUnitColumn('index'),
    }];

    return (
      <Table
        rowKey={record => record.issueId}
        dataSource={VersionReportStore.getIssues[type].data}
        columns={columns}
        pagination={VersionReportStore.getIssues[type].length > 10 ? VersionReportStore.getIssues[type].pagination : false}
        onChange={(pagination, filters, sorter) => {
          const data = _.clone(this.state.datas);
          let newIndex;
          for (let index = 0, len = data.length; index < len; index += 1) {
            if (data[index].status === type) {
              newIndex = index;
              data[index].page = pagination.current - 1;
              data[index].size = pagination.pageSize;
            }
          }
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
    history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&paramType=version&paramId=${this.state.chosenVersion}&paramName=版本${VersionReportStore.getReportData.version ? VersionReportStore.getReportData.version.name : ''}中的问题&paramUrl=reporthost/versionReport`);
  }

  render() {
    const { history } = this.props;
    const { linkFromParamUrl } = this.state;
    const urlParams = AppState.currentMenuType;
    return (
      <Page>
        <Header
          title="版本报告图"
          backPath={`/agile/${linkFromParamUrl || 'reporthost'}?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}`}
        >
          <SwithChart
            history={this.props.history}
            current="versionReport"
          />
          <Button
            funcType="flat"
            onClick={() => {
              this.updateIssues(this.state.datas);
              this.getReportData(this.state.type);
            }}
          >
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="版本报告图"
          description="跟踪对应的版本发布日期。这样有助于您监控此版本是否按时发布，以便工作滞后时能采取行动。"
          link="https://v0-10.choerodon.io/zh/docs/user-guide/report/agile-report/versionburndown/"
        >
          <Spin spinning={this.state.loading}>
            {VersionReportStore.getVersionList.length ? (
              <React.Fragment>
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
                    <Option value={String(item.versionId)} key={item.versionId}>{item.name}</Option>
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
                    <Option key={item.id} value={String(item.id)}>{item.name}</Option>
                  ))
                }
                </Select>
                <div className="c7n-versionReport-versionInfo">
                  <p style={{ fontWeight: 'bold' }}>{VersionReportStore.getReportData.version && VersionReportStore.getReportData.version.statusCode === 'released' ? `发布于 ${VersionReportStore.getReportData.version.releaseDate ? VersionReportStore.getReportData.version.releaseDate.split(' ')[0] : '未指定发布日期'}` : '未发布'}</p>
                  <p
                    style={{
                      color: '#3F51B5',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    role="none"
                    onClick={this.goIssues.bind(this)}
                  >
                    {'在“问题管理中”查看V'}
                    {' '}
                    {VersionReportStore.getReportData.version ? VersionReportStore.getReportData.version.name : ''}
                    <Icon style={{ fontSize: 13 }} type="open_in_new" />

                  </p>
                </div>
                {
                JSON.stringify(this.state.options) === '{}' ? '' : (
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
                )
              }
                <div className="c7n-versionReport-issues">
                  <Tabs defaultActiveKey="1">
                    <TabPane tab="已完成的问题" key="1">
                      {this.renderTabTable('done')}
                    </TabPane>
                    <TabPane tab="未完成的问题" key="2">
                      {this.renderTabTable('unfinished')}
                    </TabPane>
                    {
                    this.state.type === 'issueCount' ? '' : (
                      <TabPane tab="未完成的未预估问题" key="3">
                        {this.renderTabTable('unfinishedUnestimated')}
                      </TabPane>
                    )
                  }
                  </Tabs>
                </div>
              </React.Fragment>
            ) : <NoDataComponent img={versionSvg} title="版本" links={[{ name: '发布版本', link: '/agile/release' }]} />}
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default VersionReport;
