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
      inverse: true,
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
    const { inverse } = this.state;
    const { chartDataOrigin } = ES;
    console.log(JSON.stringify(ES.chartData));
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
          itemStyle: {
            color: 'rgba(0,0,0,0.65)',
          },
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
              color: 'rgba(0,0,0,0.65)',
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          inverse,
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
              color: 'rgba(0,0,0,0.65)',
            },
            formatter(value, index) {
              return !value ? value : '';
            },
          },
        },
      ],
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
        },
        borderColor: '#ddd',
        borderWidth: 1,
        extraCssText: 'box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20);',
        formatter(params) {
          const sprint = chartDataOrigin.filter(item => item.name === params[0].name)[0];
          let res = params[0].name;
          // res += `<br/>已完成: ${(params[1].value === '-' ? 0 : params[1].value) + (params[4].value === '-' ? 0 : params[4].value)}`;
          // res += `<br/>添加至epic: ${params[3].value === '-' ? 0 : params[3].value}`;
          // res += `<br/>剩余: ${(params[2].value === '-' ? 0 : params[2].value) + (params[3].value === '-' ? 0 : params[3].value)}`;
          res += `<br/>冲刺开始处：${sprint.start}`;
          res += `<br/>已完成: ${sprint.done}`;
          res += `<br/>添加至epic: ${sprint.add}`;
          res += `<br/>剩余: ${sprint.left}`;
          return res;
        },
      },
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

  transformPlaceholder2Zero = arr => arr.map(v => (v === '-' ? 0 : v))
  
  getSprintSpeed =() => {
    const { chartData, chartDataOrigin } = ES;
    const totalCompleted = [];
    // const chartData1 = [];
    // chartData1[1] = ['-', '-', 6, 3, '-'];
    // chartData1[4] = ['-', '-', 3, '-', '-'];
    // if (chartData1[1].length > 3) {
    //   chartData1[1] = this.transformPlaceholder2Zero(chartData1[1]);
    //   chartData1[4] = this.transformPlaceholder2Zero(chartData1[4]);
    //   chartData1[1].forEach((item, i) => {
    //     totalCompleted.push(item + chartData1[4][i]);
    //   });
    //   return _.floor(_.sum(totalCompleted) / totalCompleted.length);
    // }
   
    
    if (chartDataOrigin.length > 3) {
      const arrCompleted = this.transformPlaceholder2Zero(chartData[1]);
      const arrCompletedAgain = this.transformPlaceholder2Zero(chartData[4]);
      arrCompleted.forEach((item, i) => {
        totalCompleted.push(item + arrCompletedAgain[i]);
      });
      return _.floor(_.sum(totalCompleted) / totalCompleted.length);
    }

    return 0;
  }

  getStoryPoints = () => {
    const { chartData } = ES;
    if (chartData[2].length > 3) {
      const lastRemain = _.last(this.transformPlaceholder2Zero(chartData[2]));
      const lastAdd = _.last(this.transformPlaceholder2Zero(chartData[3]));
      return lastRemain + lastAdd;
    }
    return 0;
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
    this.setState({
      checkbox,
      inverse: checkbox[0] !== 'checked',
    });
  }

  handleIconMouseEnter = () => {
    const iconShowInfo = document.getElementsByClassName('icon-show-info')[0];
    iconShowInfo.style.display = 'flex';
  }

  handleIconMouseLeave = () => {
    const iconShowInfo = document.getElementsByClassName('icon-show-info')[0];
    iconShowInfo.style.display = 'none';
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
            >
              {issueNum} 
              {' '}
              {record.addIssue ? '*' : ''}

            </span>
          ),
        },
        {
          width: '30%',
          title: '概要',
          dataIndex: 'summary',
          render: summary => (
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={summary}>
                <p style={{
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, 
                }}
                >
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

  renderToolbar = () => {
    const { chartDataOrigin } = ES;
    if (chartDataOrigin.length < 3) {
      return (
        <div className="toolbar-cannot-forcast">
          <h3 className="title">尚不可预测</h3>
          <div className="word">至少3个冲刺完成，才能显示预测</div>
        </div>
      );
    }
    if (this.getStoryPoints() === 0) {
      return (
        <div className="toolbar-complete">
          <div className="pic" />
          <div className="word">所有预估的问题都已完成！</div>
        </div>
      );
    }
    return (
      <div className="toolbar-forcast">
        <h3 className="title">{`根据最近${chartDataOrigin.length}次冲刺的数据，将花费${Math.ceil(this.getStoryPoints() / this.getSprintSpeed())}个迭代来完成此史诗。`}</h3>
        <div className="word">
          <span className="icon" style={{ background: '#4D90FE' }}>
            <Icon type="cached" />
          </span>
          <span>{`冲刺迭代：${Math.ceil(this.getStoryPoints() / this.getSprintSpeed())}`}</span>
        </div>
        <div className="word">
          <span className="icon" style={{ background: 'rgb(255, 177, 0)' }}>
            <Icon type="directions_run" />
          </span>
          <span>{`冲刺速度：${this.getSprintSpeed()}`}</span>
        </div>
        <div className="word">
          <span className="icon" style={{ background: '#00BFA5' }}>
            <Icon type="turned_in" />
          </span>
          <span>{`剩余故事点：${this.getStoryPoints()}`}</span>
        </div>
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
                  <div className="c7n-epicSelectHeader">
                    <CheckboxGroup
                      label="查看选项"
                      value={checkbox}
                      options={[{ label: '根据图表校准冲刺', value: 'checked' }]}
                      onChange={this.handleChangeCheckbox.bind(this)}
                    />
                    <span className="icon-show" role="none" onMouseEnter={this.handleIconMouseEnter} onMouseLeave={this.handleIconMouseLeave}>
                      <Icon type="help icon" />
                    </span>

                    <div className="icon-show-info" onMouseEnter={this.handleIconMouseEnter} onMouseLeave={this.handleIconMouseLeave}>
                      <figure>
                        <div className="icon-show-info-svg" />
                        <figcaption className="icon-show-info-detail">
                          <p className="icon-show-info-detail-header">查看进度</p>
                          <p className="icon-show-info-detail-content">按照史诗查看冲刺进度</p>
                        </figcaption>
                      </figure>
                      <figure>
                        <div className="icon-show-info-svg" />
                        <figcaption className="icon-show-info-detail">
                          <p className="icon-show-info-detail-header">查看变更范围</p>
                          <p className="icon-show-info-detail-content">跟踪范围的扩大和缩小，由底部条状信息显示。</p>
                        </figcaption>
                      </figure>
                    </div>
                  </div>
                 
                </div>
               
                <Spin spinning={ES.chartLoading}>
                  <div>
                    {
                      ES.chartDataOrigin.length ? (
                        <div className="c7n-report">
                          <div className="c7n-chart">
                            {
                              ES.reload ? null : (
                                <div style={{ position: 'relative' }}>
                                  <ul className="chart-legend">
                                    <li>工作已完成</li>
                                    <li>工作剩余</li>
                                    <li>工作增加</li>
                                  </ul>
                                  <div className="c7n-chart-yaxixName">
                                    {'故事点'}
                                  </div>
                                  <ReactEcharts
                                    ref={(e) => { this.echarts_react = e; }}
                                    option={this.getOption()}
                                    style={{ height: 400 }}
                                  />
                                </div>
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
                des={(
                  <div>
                    <span>请在</span>
                    <span
                      style={{ color: '#3f51b5', margin: '0 5px', cursor: 'pointer' }}
                      role="none"
                      onClick={() => {
                        history.push(`/agile/backlog?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
                      }}
                    >
                      {'待办事项'}
                    </span>
                    <span>或</span>
                    <span
                      style={{ color: '#3f51b5', margin: '0 5px', cursor: 'pointer' }}
                      role="none"
                      onClick={() => {
                        history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
                      }}
                    >
                      {'问题管理'}
                    </span>
                    <span>中创建一个史诗</span>
                  </div>
                )}
              />
            )
          }
          
        </Content>
      </Page>
    );
  }
}

export default EpicBurndown;
