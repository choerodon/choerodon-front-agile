import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Spin, message, Icon, Select, Table, Menu, Dropdown, Tabs, Tooltip } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';
import BurndownChartStore from '../../../../../stores/project/burndownChart/BurndownChartStore';
import ReportStore from '../../../../../stores/project/Report';
import restSvg from '../../../../../assets/image/rest.svg';
import hopeSvg from '../../../../../assets/image/hope.svg';
import { formatDate } from '../../../../../common/utils';
import NoDataComponent from '../../Component/noData';
import epicSvg from '../../Home/style/pics/no_sprint.svg';
import SwithChart from '../../Component/switchChart';
import StatusTag from '../../../../../components/StatusTag';
import PriorityTag from '../../../../../components/PriorityTag';
import TypeTag from '../../../../../components/TypeTag';
import './ReleaseDetail.scss';


const { AppState } = stores;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

@observer
class SprintReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      xAxis: [],
      yAxis: [],
      select: 'issueCount',
      defaultSprint: '',
      loading: false,
      endDate: '',
    };
  }
  componentWillMount() {
    this.getSprintData();
    ReportStore.init();
  }
  getBetweenDateStr(start, end) {
    const result = [];
    const beginDay = start.split('-');
    const endDay = end.split('-');
    const diffDay = new Date();
    const dateList = new Array();
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
  getSprintData() {
    BurndownChartStore.axiosGetSprintList().then((res) => {
      BurndownChartStore.setSprintList(res);
      this.setState({
        defaultSprint: res[0].sprintId,
        endDate: res[0].endDate,
      }, () => {
        this.getChartData();
        this.getChartCoordinate();
      });
    }).catch((error) => {
    });
  }
  getChartCoordinate() {
    BurndownChartStore.axiosGetBurndownCoordinate(this.state.defaultSprint, this.state.select).then((res) => {
      const keys = Object.keys(res);
      let [minDate, maxDate] = [keys[0], keys[0]];
      for (let a = 1, len = keys.length; a < len; a += 1) {
        if (moment(keys[a]).isAfter(maxDate)) {
          maxDate = keys[a];
        }
        if (moment(keys[a]).isBefore(minDate)) {
          minDate = keys[a];
        }
      }
      // 如果后端给的最大日期小于结束日期
      let allDate;
      if (moment(maxDate).isBefore(this.state.endDate.split(' ')[0])) {
        allDate = this.getBetweenDateStr(minDate, this.state.endDate.split(' ')[0]);
      } else if (moment(minDate).isSame(maxDate)) {
        allDate = [minDate];
      } else {
        allDate = this.getBetweenDateStr(minDate, maxDate);
      }
      // const allDate = this.getBetweenDateStr(minDate, maxDate);
      const allDateValues = [];
      for (let b = 0, len = allDate.length; b < len; b += 1) {
        const nowKey = allDate[b];
        if (res.hasOwnProperty(nowKey)) {
          allDateValues.push(res[allDate[b]]);
        } else if (moment(nowKey).isAfter(maxDate)) {
          allDateValues.push(null);
        } else {
          const beforeKey = allDate[b - 1];
          allDateValues.push(res[beforeKey]);
          res[nowKey] = res[beforeKey];
        }
      }
      const sliceDate = _.map(allDate, item => item.slice(5));
      this.setState({
        xAxis: sliceDate,
        yAxis: allDateValues,
      });
    });
  }
  getChartData() {
    this.setState({
      loading: true,
    });
    BurndownChartStore
      .axiosGetBurndownChartReport(this.state.defaultSprint, this.state.select).then((res) => {
        const data = res;
        const newData = [];
        for (let index = 0, len = data.length; index < len; index += 1) {
          if (!_.some(newData, { date: data[index].date })) {
            newData.push({
              date: data[index].date,
              issues: [{
                issueId: data[index].issueId,
                issueNum: data[index].issueNum,
                newValue: data[index].newValue,
                oldValue: data[index].oldValue,
                statistical: data[index].statistical,
                parentIssueId: data[index].parentIssueId,
                parentIssueNum: data[index].parentIssueNum,
              }],
              type: data[index].type,
            });
          } else {
            let index2;
            for (let i = 0, len2 = newData.length; i < len2; i += 1) {
              if (newData[i].date === data[index].date) {
                index2 = i;
              }
            }
            if (newData[index2].type.indexOf(data[index].type) === -1) {
              newData[index2].type += `-${data[index].type}`;
            }
            newData[index2].issues = [...newData[index2].issues, {
              issueId: data[index].issueId,
              issueNum: data[index].issueNum,
              newValue: data[index].newValue,
              oldValue: data[index].oldValue,
              statistical: data[index].statistical,
              parentIssueId: data[index].parentIssueId,
              parentIssueNum: data[index].parentIssueNum,
            }];
          }
        }
        for (let index = 0, dataLen = newData.length; index < dataLen; index += 1) {
          let rest = 0;
          if (newData[index].type !== 'endSprint') {
            if (index > 0) {
              rest = newData[index - 1].rest;
            }
          }
          for (let i = 0, len = newData[index].issues.length; i < len; i += 1) {
            if (newData[index].issues[i].statistical) {
              rest += newData[index].issues[i].newValue - newData[index].issues[i].oldValue;
            }
          }
          newData[index].rest = rest;
        }
        BurndownChartStore.setBurndownList(newData);
        this.setState({
          loading: false,
        });
      }).catch((error) => {
      });
  }
  getMaxY() {
    const data = this.state.yAxis;
    let max = 0;
    for (let index = 0, len = data.length; index < len; index += 1) {
      if (data[index] > max) {
        max = data[index];
      }
    }
    return max;
  }
  getOption() {
    return {
      title: {
        text: this.renderChartTitle(),
        textStyle: {
          fontSize: 12,
        },
        top: '24px',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        top: '24px',
        right: '0%',
        data: [{
          name: '期望值',
          icon: `image://${hopeSvg}`,
        }, {
          name: '剩余值',
          icon: `image://${restSvg}`,
        }],
      },
      grid: {
        left: '3%',
        right: '3%',
        // bottom: '3%',
        containLabel: true,
        show: true,
      },
      // toolbox: {
      //   feature: {
      //     saveAsImage: {},
      //   },
      // },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.state.xAxis,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '期望值',
          type: 'line',
          data: [[0, this.getMaxY()], [this.state.endDate.split(' ')[0], 0]],
          itemStyle: {
            color: 'grey',
          },
          lineStyle: {
            type: 'dashed',
            color: 'grey',
          },
        },
        {
          name: '剩余值',
          type: 'line',
          itemStyle: {
            color: 'red',
          },
          // stack: '总量',
          data: this.state.yAxis,
        },
      ],
    };
  }
  callback(key) {
    ReportStore.setActiveKey(key);
    const ARRAY = {
      done: 'loadDoneIssues',
      todo: 'loadTodoIssues',
      remove: 'loadRemoveIssues',
    };
    if (!ReportStore[key] && ReportStore.currentSprint.sprintId) {
      ReportStore[ARRAY[key]]();
    }
  }
  renderDoneIssue(column) {
    return (
      <div>
        <Table
          rowKey={record => record.issueId}
          dataSource={ReportStore.doneIssues}
          columns={column}
          filterBar={false}
          pagination={false}
          scroll={{ x: true }}
          loading={ReportStore.loading}
        />
      </div>
    );
  }

  renderTodoIssue(column) {
    return (
      <div>
        <Table
          rowKey={record => record.issueId}
          dataSource={ReportStore.todoIssues}
          columns={column}
          filterBar={false}
          pagination={false}
          scroll={{ x: true }}
          loading={ReportStore.loading}
        />
      </div>
    );
  }

  renderRemoveIssue(column) {
    return (
      <div>
        <Table
          rowKey={record => record.issueId}
          dataSource={ReportStore.removeIssues}
          columns={column}
          filterBar={false}
          pagination={false}
          scroll={{ x: true }}
          loading={ReportStore.loading}
        />
      </div>
    );
  }

  renderChartTitle() {
    let result = '';
    if (this.state.select === 'remainingEstimatedTime') {
      result = '剩余预估时间';
    }
    if (this.state.select === 'storyPoints') {
      result = '故事点';
    }
    if (this.state.select === 'issueCount') {
      result = '问题计数';
    }
    return result;
  }

  render() {
    const column = [
      {
        width: '15%',
        title: '关键字',
        dataIndex: 'issueNum',
        render: (issueNum, record) => (
          <span
            style={{
              color: '#3f51b5',
              cursor: 'pointer',
            }}
            role="none"
            onClick={() => {
              const { history } = this.props;
              const urlParams = AppState.currentMenuType;
              history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${issueNum}&paramIssueId=${record.issueId}&paramUrl=reporthost/sprintreport`);
            }}
          >{issueNum} {record.addIssue ? '*' : ''}</span>
        ),
      }, {
        width: '30%',
        title: '概要',
        dataIndex: 'summary',
      }, {
        width: '15%',
        title: '问题类型',
        dataIndex: 'typeCode',
        render: (typeCode, record) => (
          <div>
            <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${record.typeCode}`}>
              <div>
                <TypeTag
                  typeCode={record.typeCode}
                  showName
                />
              </div>
            </Tooltip>
          </div>
        ),
      }, {
        width: '15%',
        title: '优先级',
        dataIndex: 'priorityCode',
        render: (priorityCode, record) => (
          <div>
            <Tooltip mouseEnterDelay={0.5} title={`优先级： ${record.priorityName}`}>
              <div style={{ marginRight: 12 }}>
                <PriorityTag
                  priority={record.priorityCode}
                />
              </div>
            </Tooltip>
          </div>
        ),
      }, {
        width: '15%',
        title: '状态',
        dataIndex: 'statusCode',
        render: (statusCode, record) => (
          <div>
            <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${record.statusName}`}>
              <div>
                <StatusTag
                  style={{ display: 'inline-block' }}
                  name={record.statusName}
                  color={record.statusColor}
                />
              </div>
            </Tooltip>
          </div>
        ),
      }, {
        width: '10%',
        title: '故事点',
        dataIndex: 'storyPoints',
        render: (storyPoints, record) => (
          <div>
            {record.typeCode === 'story' ? storyPoints || '0' : ''}
          </div>
        ),
      },
    ];
    let sprintName;
    for (let index = 0, len = BurndownChartStore.getSprintList.length; index < len; index += 1) {
      if (BurndownChartStore.getSprintList[index].sprintId === this.state.defaultSprint) {
        sprintName = BurndownChartStore.getSprintList[index].sprintName;
      }
    }
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;

    return (
      <Page className="c7n-report">
        <Header
          title="冲刺报告"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <SwithChart
            history={this.props.history}
            current="sprint"
          />
          <Button
            funcType="flat"
            onClick={() => ReportStore.changeCurrentSprint(ReportStore.currentSprint.sprintId)}
          >
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title={sprintName ? `迭代冲刺“${sprintName}”的燃尽图` : '无冲刺迭代的燃尽图'}
          description="跟踪记录所有问题的剩余工作工作时间，预估完成冲刺任务的可能性，回顾总结迭代过程中的经验与不足。这有助于在团队管理方面取得更进一步的掌控与把握。"
          link="http://v0-8.choerodon.io/zh/docs/user-guide/agile/report/burn-down/"
        >
          <Spin spinning={this.state.loading}>
            {
              BurndownChartStore.getSprintList.length > 0 ? (
                <div>
                  <div>
                    <Select
                      style={{ width: 244 }}
                      label="迭代冲刺"
                      value={this.state.defaultSprint}
                      onChange={(value) => {
                        let endDate;
                        for (let index = 0, len = BurndownChartStore.getSprintList.length; index < len; index += 1) {
                          if (BurndownChartStore.getSprintList[index].sprintId === value) {
                            endDate = BurndownChartStore.getSprintList[index].endDate;
                          }
                        }
                        this.setState({
                          defaultSprint: value,
                          endDate,
                        }, () => {
                          this.getChartData();
                          this.getChartCoordinate();
                        });
                      }}
                    >
                      {BurndownChartStore.getSprintList.length > 0 ?
                        BurndownChartStore.getSprintList.map(item => (
                          <Option value={item.sprintId}>{item.sprintName}</Option>
                        )) : ''}
                    </Select>
                    <div className="c7n-sprintMessage">
                      <div className="c7n-sprintContent">
                        <span>
                          {ReportStore.getCurrentSprintStatus.status}冲刺,
                          共 {ReportStore.currentSprint.issueCount || 0} 个问题
                        </span>
                        <span>
                          {`${formatDate(ReportStore.currentSprint.startDate)} - ${formatDate(ReportStore.currentSprint.actualEndDate) || '至今'}`}
                        </span>
                      </div>
                      <p
                        style={{
                          color: '#3F51B5',
                          cursor: 'pointer',
                        }}
                        role="none"
                        onClick={() => {
                          this.props.history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramType=sprint&paramId=${ReportStore.currentSprint.sprintId}&paramName=${ReportStore.currentSprint.sprintName}下的问题&paramUrl=reporthost/sprintreport`);
                        }}
                      >
                        在“问题管理中”查看
                        <Icon style={{ fontSize: 13 }} type="open_in_new" />
                      </p>
                    </div>
                  </div>
                  <ReactEcharts option={this.getOption()} />
                  <Tabs activeKey={ReportStore.activeKey} onChange={this.callback}>
                    <TabPane tab="已完成的问题" key="done">
                      {this.renderDoneIssue(column)}
                    </TabPane>
                    <TabPane tab="未完成的问题" key="todo">
                      {this.renderTodoIssue(column)}
                    </TabPane>
                    <TabPane tab="从Sprint中删除的问题" key="remove">
                      {this.renderRemoveIssue(column)}
                    </TabPane>
                  </Tabs>
                </div>
              ) : (
                <NoDataComponent title={'冲刺'} links={[{ name: '待办事项', link: '/agile/backlog' }]} img={epicSvg} />
              )
            }
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default SprintReport;

