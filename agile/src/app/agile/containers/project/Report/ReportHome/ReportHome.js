import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, Tabs, Table, Select, Icon, Tooltip } from 'choerodon-ui';
import ReportStore from '../../../../stores/project/Report';
import './ReleaseDetail.scss';
import EchartsTheme from './EchartsTheme';
import StatusTag from '../../../../components/StatusTag';
import PriorityTag from '../../../../components/PriorityTag';
import TypeTag from '../../../../components/TypeTag';

const echarts = require('echarts');

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { AppState } = stores;

@observer
class ReleaseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
          rowKey={record => record.id}
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
          rowKey={record => record.id}
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

  render() {
    const column = [
      {
        width: '15%',
        title: '关键字',
        dataIndex: 'issueNum',
        render: (issueNum, record) => (
          <span style={{ color: '#3f51b5' }}>{issueNum}</span>
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

export default ReleaseDetail;

