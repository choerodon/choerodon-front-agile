import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import {
  Button, Tabs, Table, Select, Icon, Tooltip, Spin, Checkbox,
} from 'choerodon-ui';
import pic from './no_epic.svg';
// import finish from './legend/finish.svg';
import SwithChart from '../Component/switchChart';
import StatusTag from '../../../../components/StatusTag';
import PriorityTag from '../../../../components/PriorityTag';
import TypeTag from '../../../../components/TypeTag';
import ES from '../../../../stores/project/epicBurndown';
import EmptyBlock from '../../../../components/EmptyBlock';
import './EpicReport.scss';

const { AppState } = stores;
const { Option } = Select;
const { TabPane } = Tabs;
const CheckboxGroup = Checkbox.Group;

@observer
class EpicBurndown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkbox: undefined,
    };
  }

  componentDidMount() {
    ES.loadEpicAndChartAndTableData();
  }
  
  getLabel(record) {
    if (ES.beforeCurrentUnit === 'story_point') {
      if (record.typeCode === 'story') {
        return record.storyPoints === null ? '未预估' : record.storyPoints;
      } else {
        return '';
      }
    } else {
      return record.remainTime === null ? '未预估' : record.remainTime; 
    }
  }

  getOption() {
    const option = {
      grid: {
        y2: 10,
        top: '30',
        left: '21',
        right: '50',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          splitLine: { show: false },
          // data: ['史诗开始时的预估', '7/8迭代冲刺', '7/15-7/21', '7/20-7/221', '7/20-7/221'],
          data: _.map(ES.chartDataOrigin, 'name'),
          axisTick: { show: false },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ddd',
              type: 'solid',
              width: 1,
            },
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#000',
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          inverse: true,
          axisTick: { show: false },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ddd',
              type: 'solid',
              width: 1,
            },
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#000',
            },
            formatter(value, index) {
              return !value ? value : '';
            },
          },
        },
      ],
      series: [
        {
          name: '辅助',
          type: 'bar',
          stack: '总量',
          barWidth: 52,
          itemStyle: {
            normal: {
              barBorderColor: 'rgba(0,0,0,0)',
              color: 'rgba(0,0,0,0)',
            },
            emphasis: {
              barBorderColor: 'rgba(0,0,0,0)',
              color: 'rgba(0,0,0,0)',
            },
          },
          // data: [0, 0, 0, 16, 19],
          data: ES.chartData[0],
        },
        {
          name: 'compoleted',
          type: 'bar',
          stack: '总量',
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'inside',
                color: '#fff',
                formatter(param) {
                  return param.value === '-' ? null : `-${param.value}`;
                },
              },
              color: 'rgba(0,191,165,0.8)',
            },
          },
          // data: ['-', '-', 16, 3, '-'],
          data: ES.chartData[1],
        },
        {
          name: 'remaining',
          type: 'bar',
          stack: '总量',
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'inside',
                color: '#fff',
              },
              color: 'rgba(69,163,252,0.8)',
            },
          },
          // data: [3, 3, '-', 13, 18],
          data: ES.chartData[2],
        },
        {
          name: 'added',
          type: 'bar',
          stack: '总量',
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'inside',
                color: '#fff',
                formatter(param) {
                  return param.value === '-' ? null : `+${param.value}`;
                },
              },
              color: 'rgba(27,128,223,0.8)',
              opacity: 0.75,
            },
          },
          // data: ['-', 13, 16, 5, '-'],
          data: ES.chartData[3],
        },
        {
          name: 'compoleted again',
          type: 'bar',
          stack: '总量',
          itemStyle: {
            normal: {
              label: {
                show: true,
                position: 'inside',
                color: '#fff',
                formatter(param) {
                  return param.value === '-' ? null : `-${param.value}`;
                },
              },
              color: 'rgba(0,191,165,0.8)',
            },
          },
          // data: ['-', '-', 3, '-', '-'],
          data: ES.chartData[4],
        },
      ],
    };
    return option;         
  }

  getTableDta(type) {
    if (type === 'compoleted') {
      return ES.tableData.filter(v => v.completed === 1);
    }
    if (type === 'unFinish') {
      return ES.tableData.filter(v => v.completed === 0);
    }
    return [];
  }

  refresh() {
    if (!ES.currentEpicId) {
      ES.loadEpicAndChartAndTableData();
    } else {
      ES.loadChartData();
      ES.loadTableData();
    }
  }

  handleChangeCurrentEpic(epicId) {
    ES.setCurrentEpic(epicId);
    ES.loadChartData();
    ES.loadTableData();
  }

  handleChangeCheckbox(checkbox) {
    this.setState({ checkbox });
  }

  renderTable(type) {
    const column = [
      ...[
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
                history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${issueNum}&paramIssueId=${record.issueId}&paramUrl=reporthost/EpicBurndown`);
              }}
            >{issueNum} {record.addIssue ? '*' : ''}</span>
          ),
        },
        {
          width: '30%',
          title: '概要',
          dataIndex: 'summary',
          render: summary => (
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={summary}>
                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                  {summary}
                </p>
              </Tooltip>
            </div>
          ),
        },
        {
          width: '15%',
          title: '问题类型',
          dataIndex: 'typeCode',
          render: (typeCode, record) => (
            <div>
              <TypeTag
                typeCode={record.typeCode}
                showName
              />
            </div>
          ),
        },
        {
          width: '15%',
          title: '优先级',
          dataIndex: 'priorityCode',
          render: (priorityCode, record) => (
            <div>
              <PriorityTag
                priority={record.priorityCode}
              />
            </div>
          ),
        },
        {
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
        },
      ],
      ...[
        ES.beforeCurrentUnit === 'issue_count' ? {} : {
          width: '10%',
          title: ES.beforeCurrentUnit === 'story_point' ? '故事点' : '剩余时间',
          dataIndex: 'storyPoints',
          render: (storyPoints, record) => (
            <div>
              {this.getLabel(record)}
            </div>
          ),
        },
      ],
    ];
    return (
      <Table
        rowKey={record => record.issueId}
        dataSource={this.getTableDta(type)}
        filterBar={false}
        columns={column}
        scroll={{ x: true }}
        loading={ES.tableLoading}
      />
    );
  }

  renderToolbar() {
    return (
      <div className="toolbar-forcast">
        <h3 className="title">根据最近3次冲刺的数据，将花费4个迭代来完成此史诗。</h3>
        <div className="word">
          <span className="icon" />
          <span>冲刺迭代：0</span>
        </div>
        <div className="word">
          <span className="icon" />
          <span>冲刺速度：4</span>
        </div>
        <div className="word">
          <span className="icon" />
          <span>剩余故事点：0</span>
        </div>
      </div>
    );
    return (
      <div className="toolbar-complete">
        <div className="pic" />
        <div className="word">所有预估的问题都已完成！</div>
      </div>
    );
    return (
      <div className="toolbar-cannot-forcast">
        <h3 className="title">尚不可预测</h3>
        <div className="word">至少3个冲刺完成，才能显示预测</div>
      </div>
    );
  }

  render() {
    const { history } = this.props;
    const { checkbox } = this.state;
    const urlParams = AppState.currentMenuType;
    return (
      <Page className="c7n-epicReport">
        <Header 
          title="史诗燃尽图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <SwithChart
            history={history}
            current="epicReport"
          />
          <Button 
            funcType="flat" 
            onClick={this.refresh.bind(this)}
          >
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="史诗燃尽图"
          description="跟踪版本的预测发布日期（优先Scrum）。这样有助于您监控此版本是否按时发布，以便工作滞后时能采取行动。"
          // link="http://v0-9.choerodon.io/zh/docs/user-guide/agile/report/sprint/"
        >
          {
            !(!ES.epics.length && ES.epicFinishLoading) ? (
              <div>
                <div style={{ display: 'flex' }}>
                  <Select
                    style={{ width: 512, marginRight: 33 }}
                    label="史诗"
                    value={ES.currentEpicId}
                    onChange={this.handleChangeCurrentEpic.bind(this)}
                  >
                    {
                      ES.epics.map(epic => (
                        <Option key={epic.issueId} value={epic.issueId}>{epic.epicName}</Option>
                      ))
                    }
                  </Select>
                  <CheckboxGroup
                    label="查看选项"
                    value={checkbox}
                    options={[{ label: '根据图表校准冲刺', value: 'checked' }]}
                    onChange={this.handleChangeCheckbox.bind(this)}
                  />
                  <span className="icon-show">
                    <Icon type="refresh icon" />
                  </span>
                </div>
                <Spin spinning={ES.chartLoading}>
                  <div>
                    {
                      ES.chartData.length ? (
                        <div className="c7n-report">
                          <div className="c7n-chart">
                            {
                              ES.reload ? null : (
                                <ReactEcharts
                                  ref={(e) => { this.echarts_react = e; }}
                                  option={this.getOption()}
                                  style={{ height: 400 }}
                                />
                              )
                            }
                          </div>
                          <div className="c7n-toolbar">
                            {this.renderToolbar()}
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '30px 0 20px', textAlign: 'center' }}>
                          {ES.tableData.length ? '当前单位下问题均未预估，切换单位或从下方问题列表进行预估。' : '当前史诗下没有问题。'}
                        </div>
                      )
                    }
                    
                  </div>
                </Spin>
                <Tabs>
                  <TabPane tab="已完成的问题" key="done">
                    {this.renderTable('compoleted')}
                  </TabPane>
                  <TabPane tab="未完成的问题" key="todo">
                    {this.renderTable('unFinish')}
                  </TabPane>
                </Tabs>
              </div>
            ) : (
              <EmptyBlock
                style={{ marginTop: 40 }}
                textWidth="auto"
                pic={pic}
                title="当前项目无可用史诗"
                des={
                  <div>
                    <span>请在</span>
                    <span
                      style={{ color: '#3f51b5', margin: '0 5px', cursor: 'pointer' }}
                      role="none"
                      onClick={() => {
                        history.push(`/agile/backlog?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
                      }}
                    >
                      待办事项
                    </span>
                    <span>或</span>
                    <span
                      style={{ color: '#3f51b5', margin: '0 5px', cursor: 'pointer' }}
                      role="none"
                      onClick={() => {
                        history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
                      }}
                    >
                      问题管理
                    </span>
                    <span>中创建一个史诗</span>
                  </div>
                }
              />
            )
          }
          
        </Content>
      </Page>
    );
  }
}

export default EpicBurndown;
