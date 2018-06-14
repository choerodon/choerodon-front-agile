import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, DatePicker, Tabs, Table, Popover, Modal, Radio, Form, Select, Icon, Tooltip } from 'choerodon-ui';
import moment from 'moment';
import ReportStore from '../../../../stores/project/Report';
import './ReleaseDetail.scss';
import EchartsTheme from './EchartsTheme';
import StatusTag from '../../../../components/StatusTag';
import PriorityTag from '../../../../components/PriorityTag';
import TypeTag from '../../../../components/TypeTag';

const echarts = require('echarts');

const TabPane = Tabs.TabPane;
const { Sidebar } = Modal;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const { AppState } = stores;

@observer
class ReleaseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIssue: {},
      publicVersion: false,
    };
  }
  componentDidMount() {
    this.renderBurnDown();
    ReportStore.loadDoneIssues();
  }

  callback(key) {
    ReportStore.setActiveKey(key);
    const ARRAY = {
      done: 'loadDoneIssues',
      todo: 'loadTodoIssues',
      remove: 'loadRemoveIssues',
    };
    if (!ReportStore[key]) {
      // load key
      ReportStore[ARRAY[key]]();
    }
  }

  handleDoneIssueChange(pagination, filters, sorter, param) {
    const obj = {
      advancedSearchArgs: {},
      searchArgs: {},
    };
    const { statusCode, priorityCode, typeCode } = filters;
    const { issueNum, summary } = filters;
    obj.advancedSearchArgs.statusCode = statusCode || [];
    obj.advancedSearchArgs.priorityCode = priorityCode || [];
    obj.advancedSearchArgs.typeCode = typeCode || [];
    obj.searchArgs.issueNum = issueNum || [];
    obj.searchArgs.summary = summary || [];
    ReportStore.setDoneFilter(obj);
    ReportStore.setDoneOrder({
      order: sorter.order,
      columnKey: sorter.columnKey,
    });
    // const { current, pageSize } = IssueStore.pagination;
    // IssueStore.loadIssues(current - 1, pageSize);
  }

  handleTodoIssueChange(pagination, filters, sorter, param) {
    const obj = {
      advancedSearchArgs: {},
      searchArgs: {},
    };
    const { statusCode, priorityCode, typeCode } = filters;
    const { issueNum, summary } = filters;
    obj.advancedSearchArgs.statusCode = statusCode || [];
    obj.advancedSearchArgs.priorityCode = priorityCode || [];
    obj.advancedSearchArgs.typeCode = typeCode || [];
    obj.searchArgs.issueNum = issueNum || [];
    obj.searchArgs.summary = summary || [];
    ReportStore.setTodoFilter(obj);
    ReportStore.setTodoOrder({
      order: sorter.order,
      columnKey: sorter.columnKey,
    });
  }

  handleRemoveIssueChange(pagination, filters, sorter, param) {
    const obj = {
      advancedSearchArgs: {},
      searchArgs: {},
    };
    const { statusCode, priorityCode, typeCode } = filters;
    const { issueNum, summary } = filters;
    obj.advancedSearchArgs.statusCode = statusCode || [];
    obj.advancedSearchArgs.priorityCode = priorityCode || [];
    obj.advancedSearchArgs.typeCode = typeCode || [];
    obj.searchArgs.issueNum = issueNum || [];
    obj.searchArgs.summary = summary || [];
    ReportStore.setRemoveFilter(obj);
    ReportStore.setRemoveOrder({
      order: sorter.order,
      columnKey: sorter.columnKey,
    });
  }

  renderBurnDown() {
    const myChart = echarts.init(document.getElementsByClassName('c7n-chart')[0], EchartsTheme);
    const option = {
      // title: {
      //   text: '冲刺燃尽图',
      //   x: 0,
      //   y: 0,
      //   textStyle: {
      //     fontSize: 14,
      //     fontWeight: 'bold',
      //     color: 'rgba(0,0,0,0.87)',
      //   },
      // },
      grid: {
        x: 25,
        y: 10,
        x2: 15,
        y2: 35,
      },
      tooltip: {
        trigger: 'axis',
      },
      // legend: {
      //   data: ['期望值', '实际值'],
      //   x: 'right',
      //   y: 0,
      // },
      calculable: true,
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          // splitLine: {
          //   show: true,
          //   lineStyle: {
          //     color: ['#bac3ca'],
          //     width: 1,
          //     type: 'solid',
          //   },
          // },
          data: ['1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7'],
        },
      ],
      yAxis: [
        {
          // name: '故事点',
          // type: 'value',
          // splitLine: {
          //   show: true,
          //   lineStyle: {
          //     color: ['#bac3ca'],
          //     width: 1,
          //     type: 'solid',
          //   },
          // },
        },
      ],
      series: [
        {
          name: '期望值',
          symbol: 'none',
          type: 'line',
          itemStyle: {
            normal: {
              lineStyle: {
                // color: '#333',
                type: 'dotted',
              },
            },
          },
          data: [6, 5, 4, 3, 2, 1, 0],
        },
        {
          name: '实际值',
          symbol: 'none',
          type: 'line',
          // itemStyle: {
          //   normal: {
          //     lineStyle: {
          //       // color: '#FF5555',
          //     },
          //   },
          // },
          data: [6, 5.5, 4, 2.5, 2, 1.5, 0],
        },
      ],
    };
    myChart.setOption(option, true);
  }

  renderDoneIssue(column) {
    return (
      <div>
        <Table
          rowKey={record => record.id}
          dataSource={ReportStore.doneIssues}
          columns={column}
          pagination={ReportStore.donePagination}
          scroll={{ x: true }}
          loading={ReportStore.loading || false}
          onChange={this.handleDoneIssueChange}
        />
      </div>
    );
  }

  renderTodoIssue(column) {
    return (
      <div>
        <Table
          rowKey={record => record.id}
          dataSource={ReportStore.todoIssues}
          columns={column}
          pagination={ReportStore.todoPagination}
          scroll={{ x: true }}
          loading={ReportStore.loading || false}
          onChange={this.handleTodoIssueChange}
        />
      </div>
    );
  }

  renderRemoveIssue(column) {
    return (
      <div>
        <Table
          rowKey={record => record.id}
          dataSource={ReportStore.removeIssues}
          columns={column}
          pagination={ReportStore.removePagination}
          scroll={{ x: true }}
          loading={ReportStore.loading || false}
          onChange={this.handleRemoveIssueChange}
        />
      </div>
    );
  }

  render() {
    const column = [
      {
        width: '15%',
        title: '关键字',
        dataIndex: 'issueNum',
        filters: [],
        filteredValue: ReportStore[`${ReportStore.activeKey}Filter`].searchArgs.issueNum || null,
        sorter: true,
        sortOrder: ReportStore[`${ReportStore.activeKey}Order`].columnKey === 'issueNum' && ReportStore[`${ReportStore.activeKey}Order`].order,
        render: (issueNum, record) => (
          <span style={{ color: '#3f51b5' }}>{issueNum}</span>
        ),
      }, {
        width: '30%',
        title: '概要',
        dataIndex: 'summary',
        filters: [],
        filteredValue: ReportStore[`${ReportStore.activeKey}Filter`].searchArgs.summary || null,
        sorter: true,
        sortOrder: ReportStore[`${ReportStore.activeKey}Order`].columnKey === 'summary' && ReportStore[`${ReportStore.activeKey}Order`].order,
      }, {
        width: '15%',
        title: '问题类型',
        dataIndex: 'typeCode',
        sorter: true,
        filters: [
          {
            text: '故事',
            value: 'story',
          },
          {
            text: '任务',
            value: 'task',
          },
          {
            text: '故障',
            value: 'bug',
          },
          {
            text: '史诗',
            value: 'issue_epic',
          },
        ],
        filterMultiple: true,
        filteredValue: ReportStore[`${ReportStore.activeKey}Filter`].advancedSearchArgs.typeCode || null,
        render: (typeCode, record) => (
          <div>
            <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${record.typeCode}`}>
              <div>
                <TypeTag
                  type={{
                    typeCode: record.typeCode,
                  }}
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
        filters: [
          {
            text: '高',
            value: 'high',
          },
          {
            text: '中',
            value: 'medium',
          },
          {
            text: '低',
            value: 'low',
          },
        ],
        filterMultiple: true,
        filteredValue: ReportStore[`${ReportStore.activeKey}Filter`].advancedSearchArgs.priorityCode || null,
        sorter: true,
        sortOrder: ReportStore[`${ReportStore.activeKey}Order`].columnKey === 'priorityCode' && ReportStore[`${ReportStore.activeKey}Order`].order,
        render: (priorityCode, record) => (
          <div>
            <Tooltip mouseEnterDelay={0.5} title={`优先级： ${record.priorityName}`}>
              <div style={{ marginRight: 12 }}>
                <PriorityTag
                  priority={{
                    priorityCode: record.priorityCode,
                    priorityName: record.priorityName,
                  }}
                />
              </div>
            </Tooltip>
          </div>
        ),
      }, {
        width: '15%',
        title: '状态',
        dataIndex: 'statusCode',
        filters: [
          {
            text: '待处理',
            value: 'todo',
          },
          {
            text: '进行中',
            value: 'doing',
          },
          {
            text: '已完成',
            value: 'done',
          },
        ],
        filterMultiple: true,
        filteredValue: ReportStore[`${ReportStore.activeKey}Filter`].advancedSearchArgs.statusCode || null,
        sorter: true,
        sortOrder: ReportStore[`${ReportStore.activeKey}Order`].columnKey === 'statusCode' && ReportStore[`${ReportStore.activeKey}Order`].order,
        render: (statusCode, record) => (
          <div>
            <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${record.statusName}`}>
              <div>
                <StatusTag
                  style={{ display: 'inline-block' }}
                  status={{
                    statusColor: record.statusColor,
                    statusName: record.statusName,
                  }}
                />
              </div>
            </Tooltip>
          </div>
        ),
      }, {
        width: '10%',
        title: '故事点',
        dataIndex: 'storyPoints',
        sorter: true,
        sortOrder: ReportStore[`${ReportStore.activeKey}Order`].columnKey === 'storyPoints' && ReportStore[`${ReportStore.activeKey}Order`].order,
      },
    ];
    return (
      <Page className="c7n-report">
        <Header 
          title="冲刺报告"
        >
          <Button 
            funcTyp="flat" 
          >
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="迭代冲刺“6/10 迭代冲刺 ”的燃尽图"
          description="了解每个sprint中完成的工作或者退回后备的工作。这有助于您确定您的团队是过量使用或如果有过多的范围扩大。"
        >
          <Select
            style={{ width: 520 }}
            label="迭代冲刺"
            loading={this.state.selectLoading}
            filter
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {ReportStore.sprints.map(sprint =>
              (<Option key={sprint.id} value={sprint.id}>{sprint.name}</Option>),
            )}
          </Select>
          <div className="c7n-sprintMessage">
            <span>
              已关闭 Sprint, 由 12462李洪 结束
            </span>
            <span>
              04/六月/18 1:24 下午 - 11/六月/18 9:33 上午
            </span>
          </div>
          <div className="c7n-chart" />

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
        </Content>
      </Page>
    );
  }
}

export default Form.create()(ReleaseDetail);

