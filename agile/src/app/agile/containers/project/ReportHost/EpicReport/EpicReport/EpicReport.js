import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, Tabs, Table, Select, Icon, Tooltip, Dropdown, Menu, Spin } from 'choerodon-ui';
import SwithChart from '../../Component/switchChart';
import StatusTag from '../../../../../components/StatusTag';
import PriorityTag from '../../../../../components/PriorityTag';
import TypeTag from '../../../../../components/TypeTag';
import './EpicReport.scss';

const TabPane = Tabs.TabPane;
const { AppState } = stores;
const Option = Select.Option;
const MONTH = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

@observer
class EpicReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  getOption() {
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        orient: 'horizontal', // 'vertical'
        x: 'center', // 'center' | 'left' | {number},
        y: 0, // 'center' | 'bottom' | {number}
        padding: [0, 50, 0, 0],
        itemWidth: 14,
        data: [
          {
            name: '已完成 原预估时间',
            icon: 'rectangle',
          },
          {
            name: '总计 原预估时间',
            icon: 'rectangle',
          },
          {
            name: '问题数量',
            icon: 'line',
          },
          {
            name: '未预估问题数',
            icon: 'line',
          },
        ],
      },
      grid: {
        y2: 10,
        top: '30',
        left: 0,
        right: '50',
        containLabel: true,
      },
      calculable: true,
      xAxis: {
        name: '日期',
        nameLocation: 'end',
        nameTextStyle: {
          color: '#000',
          // verticalAlign: 'bottom',
          padding: [35, 0, 0, 0],
        },
        nameGap: -10,
        type: 'category',
        axisTick: { show: false },
        splitNumber: 3,
        axisLine: { // 轴线
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
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
            // fontWeight: 'bold',
          },
          formatter(value, index) {
            return `${value.split('-')[1]}/${MONTH[value.split('-')[0] * 1]}月`;
          },
        },
        splitArea: {
          show: false,
          interval: 0,
          color: 'rgba(0, 0, 0, 0.16)',
        },
        splitLine: {
          show: true,
          onGap: false,
          interval: 0,
          lineStyle: {
            color: ['#eee'],
            width: 1,
            type: 'solid',
          }, 
        },
        boundaryGap: true,
        data: ['06-04', '06-05', '06-06', '06-07', '06-08', '06-09', '06-10'],
      },
      yAxis: [{
        name: '原预估时间',
        nameTextStyle: {
          color: '#000',
        },
        type: 'value',
        axisTick: { show: false },
        axisLine: { // 轴线
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
          margin: 18,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
            // fontWeight: 'bold',
          },
          formatter(value, index) {
            if (value) {
              return `${value}h`;
            }
            return value;
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
      }, {
        name: '问题计数',
        nameTextStyle: {
          color: '#000',
        },
        type: 'value',
        axisTick: { show: false },
        axisLine: { // 轴线
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
          margin: 18,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
            // fontWeight: 'bold',
          },
        },
        splitLine: {
          show: false,
          // lineStyle: {
          //   color: '#eee',
          //   type: 'solid',
          //   width: 1,
          // },
        },
      }],
      series: [
        {
          name: '问题数量',
          type: 'line',
          step: true,
          itemStyle: {
            color: 'rgba(48, 63, 159, 1)',
          },
          yAxisIndex: 1,
          data: [11, 20, 16, 11, 7, 8, 5],
        },
        {
          name: '未预估问题数',
          type: 'line',
          step: true,
          itemStyle: {
            color: '#ff9915',
          },
          yAxisIndex: 1,
          data: [1, 10, 6, 1, 3, 0, 1],
        },
        {
          name: '已完成 原预估时间',
          type: 'line',
          step: true,
          yAxisIndex: 0,
          data: [0, 14, 18, 20, 25, 28, 25],
          itemStyle: {
            color: '#4e90fe',
          },
          areaStyle: {
            color: 'rgba(77, 144, 254, 0.1)',
          },
        },
        {
          name: '总计 原预估时间',
          type: 'line',
          step: true,
          yAxisIndex: 0,
          data: [0, 30, 30, 28, 30, 30, 30],
          itemStyle: {
            color: 'rgba(0, 0, 0, 0.16)',
          },
          areaStyle: {
            color: 'rgba(245, 245, 245, 0.5)',
          },
        },
      ],
    };
  }

  renderTable() {
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
        render: (storyPoints, record) => (
          <div>
            {record.typeCode === 'story' ? storyPoints || '0' : ''}
          </div>
        ),
      },
    ];
    return (
      <Table
        rowKey={record => record.sprintId}
        dataSource={[]}
        columns={column}
        scroll={{ x: true }}
        loading={false}
      />
    );
  }

  render() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    return (
      <Page className="c7n-epicReport">
        <Header 
          title="史诗报告图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <SwithChart
            history={this.props.history}
            current="epicReport"
          />
          <Button 
            funcType="flat" 
            // onClick={this.refresh.bind(this)}
          >
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="史诗报告图"
          description="随时了解一个史诗的完成进度。这有助于您跟踪未完成或未分配问题来管理团队的开发进度。"
          // link="http://v0-8.choerodon.io/zh/docs/user-guide/agile/report/sprint/"
        >
          <div style={{ display: 'flex' }}>
            <Select
              style={{ width: 244 }}
              label="史诗选择"
            >
              {
                [].map(epic => (
                  <Option key={epic.issueId} value={epic.issueId}>{epic.summary}</Option>
                ))
              }
            </Select>
            <Select
              style={{ width: 244, marginLeft: 24 }}
              label="单位选择"
            >
              <Option key="storyPoint" value="storyPoint">故事点</Option>
              <Option key="count" value="count">问题计数</Option>
              <Option key="remain" value="remain">剩余时间</Option>
            </Select>
          </div>
          <div className="c7n-report">
            <div className="c7n-chart">
              <ReactEcharts option={this.getOption()} style={{ height: 400 }} />
            </div>
            <div className="c7n-toolbar">
              <h2>汇总</h2>
              <h4>状态汇总</h4>
              <ul>
                <li><span className="c7n-tip">合计：</span><span>55</span></li>
                <li><span className="c7n-tip">已完成：</span><span>43</span></li>
                <li><span className="c7n-tip">未预估：</span><span>9</span></li>
              </ul>
              <h4>时间汇总</h4>
              <ul>
                <li><span className="c7n-tip">合计：</span><span>2w 26m</span></li>
                <li><span className="c7n-tip">已完成：</span><span>1w 4d 2h 26m</span></li>
              </ul>
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
                在“问题管理”中查看
                <Icon style={{ fontSize: 13 }} type="open_in_new" />
              </p>
            </div>
          </div>
          <Tabs>
            <TabPane tab="已完成的问题" key="done">
              {this.renderTable()}
            </TabPane>
            <TabPane tab="未完成的问题" key="todo">
              {this.renderTable()}
            </TabPane>
            <TabPane tab="未完成的未预估问题" key="undo">
              {this.renderTable()}
            </TabPane>
          </Tabs>
        </Content>
      </Page>
    );
  }
}

export default EpicReport;
