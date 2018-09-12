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
import seeChangeRange from './seeChangeRange.svg';
import seeProgress from './seeProgress.svg';
import speedIcon from './speedIcon.svg';
import sprintIcon from './sprintIcon.svg';
import storyPointIcon from './storyPointIcon.svg';
import completed from './completed.svg';
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
      tabActiveKey: 'done',
    };
  }

  componentDidMount = () => {
    ES.loadEpicAndChartAndTableData();
  };

  getLegendData() {
    const arr = ['工作已完成', '工作剩余', '工作增加'];
    const legendData = [];
    arr.forEach((item) => {
      legendData.push({
        name: item,
        textStyle: { fontSize: 12 },
      });
    });
    return legendData;
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
    // 如果xAxisLabel项多于10个，则上下交错显示
    const xAxisData = chartDataOrigin.length >= 10 ? chartDataOrigin.map((item, index) => {
      if (index % 2 === 1) {
        return `\n\n${item.name}`;
      }
      return item.name;
    }) : chartDataOrigin.map(item => item.name);

    // const xAxisData = _.map(chartDataOrigin, 'name');

    const option = {
      grid: {
        x: 40,
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
          // data: _.map(ES.chartDataOrigin, 'name'),
          data: xAxisData,
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
            interval: 0,
            // rotate: 20,
            show: true,
            showMinLabel: true,
            showMaxLabel: true,
            // margin: 0,
            agile: 'left',
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
      legend: {
        show: true,
        data: this.getLegendData(),
        right: 50,
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 30,
        icon: 'rect',
      },
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
          params[0].name = _.trim(params[0].name, '\n\n');
          const sprint = chartDataOrigin.filter(item => item.name === params[0].name)[0];
          let res = params[0].name;
          res += `<br/>冲刺开始处：${sprint.start}`;
          res += `<br/>已完成: ${(params[1].value === '-' ? 0 : params[1].value) + (params[4].value === '-' ? 0 : params[4].value)}`;
          res += `<br/>添加至epic: ${sprint.add}`;
          res += `<br/>剩余: ${(params[2].value === '-' ? 0 : params[2].value) + (params[3].value === '-' ? 0 : params[3].value)}`;
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
          name: '工作已完成',
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
          name: '工作剩余',
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
          name: '工作增加',
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
    if (chartDataOrigin.length > 3) {
      const lastThree = chartDataOrigin.slice(chartDataOrigin.length - 3, chartDataOrigin.length);
      const lastThreeDone = [];
      lastThree.forEach((item) => {
        lastThreeDone.push(item.done);
      });
      return _.floor(_.sum(lastThreeDone) / 3, 2);
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

  getSprintCount() {
    return Math.ceil(this.getStoryPoints() / this.getSprintSpeed());
  }

  getTableDta(type) {
    if (type === 'compoleted') {
      // return ES.tableData.filter(v => v.completed === 1);
      return ES.tableData.sprintBurnDownReportDTOS;
    }
    if (type === 'unFinish') {
      // return ES.tableData.filter(v => v.completed === 0);
      return ES.tableData.incompleteIssues;
    }
    return [];
  }

  refresh() {
    if (!ES.currentEpicId) {
      ES.loadEpicAndChartAndTableData();
    } else {
      ES.loadChartData();
      ES.loadTableData();
      // this.setInitialPagination();
    }
  }

  handleChangeCurrentEpic(epicId) {
    ES.setCurrentEpic(epicId);
    ES.loadChartData();
    ES.loadTableData();
    this.setState({
      tabActiveKey: 'done',
    });
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

  handleLinkToIssue(linkType, item) {
    const urlParams = AppState.currentMenuType;
    const {
      type, id, organizationId,
    } = urlParams;
    const { history } = this.props;
    let urlPush = `/agile/issue?type=${type}&id=${id}&name=${urlParams.name}&organizationId=${organizationId}`;
    if (JSON.stringify(item) !== '{}') {
      if (linkType === 'sprint') {
        urlPush += `&paramType=sprint&paramId=${item.sprintId}&paramName=${item.sprintName || '未分配'}下的问题&paramUrl=reposthost/epicBurnDown`;
      }
      if (linkType === 'epic') {
        urlPush += `&paramType=epic&paramId=${item.issueId}&paramName=${item.epicName || '未分配'}下的问题&paramUrl=reporthost/epicBurnDown`;
      }
      history.push(urlPush);
    }
  }

  renderTable = (type) => {
    const sprintBurnDownReportDTOS = this.getTableDta('compoleted');
    let firstCompleteIssues = 0;
    const column = [
      ...[
        {
          // width: '15%',
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
          // width: '30%',
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
          // width: '15%',
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
          // width: '15%',
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
          // width: '15%',
          title: '状态',
          dataIndex: 'statusCode',
          render: (statusCode, record) => (
            <div>
              <Tooltip mouseEnterDelay={0.5} title={`任务状态:${record.statusName}`}>
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
          // width: '10%',
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
    if (type === 'unFinish') {
      return (
        <Table
          rowKey={record => record.issueId}
          dataSource={this.getTableDta(type)}
          filterBar={false}
          columns={column}
          scroll={{ x: true }}
          loading={ES.tableLoading}
          pagination={!!(this.getTableDta(type) && this.getTableDta(type).length > 10)}
        />
      );
    }
    if (sprintBurnDownReportDTOS && sprintBurnDownReportDTOS.length !== 0) {
      for (let i = 0; i < sprintBurnDownReportDTOS.length; i++) {
        if (sprintBurnDownReportDTOS[i].completeIssues.length !== 0) {
          firstCompleteIssues = i;
          break;
        }
        firstCompleteIssues++;
      }
      if (firstCompleteIssues !== sprintBurnDownReportDTOS.length) {
        return (
          <div>
            {
                sprintBurnDownReportDTOS.map((item) => {
                  if (item.completeIssues.length !== 0) {
                    return (
                      <div 
                        style={{ marginBottom: 22 }}
                        key={item.sprintId}
                      >
                        <p style={{ 
                          position: 'relative',
                          marginBottom: 12, 
                        }}
                        >
                          <span 
                            style={{ 
                              color: '#3f51b5',
                              cursor: 'pointer',
                            }}
                            role="none"
                            onClick={() => {
                              const { history } = this.props;
                              const urlParams = AppState.currentMenuType;
                            // history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${issueNum}&paramIssueId=${record.issueId}&paramUrl=reporthost/EpicBurndown`);
                            }
                          }
                          >
                            {`${item.sprintName}`}
                          </span>
                          <span
                            style={{
                              color: 'rgba(0,0,0,0.65)',
                              fontSize: 12,
                              marginLeft: 12,
                            }}
                          >
                            {`${item.startDate.slice(0, 11).replace(/-/g, '.')}-${item.endDate.slice(0, 11).replace(/-/g, '.')}`}
                          </span>
                          <span
                            style={{ 
                              display: 'inline-block',
                              position: 'absolute',
                              right: 0,
                              color: '#3f51b5',
                              cursor: 'pointer',
                              fontSize: 13,
                              flex: 1,
                            }}
                            role="none"
                            onClick={this.handleLinkToIssue.bind(this, 'sprint', item)}
                          >
                            {'在“问题管理中”查看'}
                          </span>
                        </p>
                        <Table
                          rowKey={record => record.issueId}
                          dataSource={item.completeIssues}
                          filterBar={false}
                          columns={column}
                          scroll={{ x: true }}
                          loading={ES.tableLoading}
                          pagination={!!(item.completeIssues && item.completeIssues.length > 10)}
                        />
                      </div>
                    );
                  }
                })
              //  : <p>当前史诗下的冲刺没有已完成的问题</p>
            }
          </div>);
      }
      return <p>当前史诗下的冲刺没有已完成的问题</p>;
    }
     
    return <p>当前史诗下的冲刺没有已完成的问题</p>;
  }

  renderToolbarTitle = () => {
    const { chartDataOrigin } = ES;
    if (this.getSprintSpeed() === 0) {
      return `根据最近${chartDataOrigin.length}次冲刺的数据，无法预估迭代次数`;
    }
    return `根据最近${chartDataOrigin.length}次冲刺的数据，将花费${this.getSprintCount()}个迭代来完成此史诗。`;
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
          <div className="pic">
            <img src={completed} alt="所有预估的问题都已完成!" />
          </div>
          <div className="word">所有预估的问题都已完成！</div>
        </div>
      );
    }
    return (
      <div className="toolbar-forcast">
        <h3 className="title">{this.renderToolbarTitle()}</h3>
        <div className="word">
          <div className="icon">
            <img src={sprintIcon} alt="冲刺迭代" />
          </div>
          <span>{`冲刺迭代：${!this.getSprintSpeed() ? '无法预估' : this.getSprintCount()}`}</span>
        </div>
        <div className="word">
          <div className="icon">
            <img src={speedIcon} alt="冲刺速度" />
          </div>
          <span>{`冲刺速度：${this.getSprintSpeed()}`}</span>
        </div>
        <div className="word">
          <div className="icon">
            <img src={storyPointIcon} alt="剩余故事点" />
          </div>
          <span>{`剩余故事点：${this.getStoryPoints()}`}</span>
        </div>
      </div>
    );
  }

  renderEpicInfo() {
    if (ES.currentEpicId != undefined) {
      const currentEpic = ES.epics.filter(item => item.issueId === ES.currentEpicId)[0];
      return (
        <p className="c7n-epicInfo">
          <span
            style={{ 
              color: '#3f51b5',
              cursor: 'pointer',
            }}
            role="none"
            onClick={this.handleLinkToIssue.bind(this, 'epic', ES.currentEpicId != undefined ? ES.epics.filter(item => item.issueId === ES.currentEpicId)[0] : {})}
          >
            {`${currentEpic.epicName}`}
          </span>
          <span>{`,${currentEpic.summary}`}</span>
        </p>
      );
    }
    return '';
  }

  render() {
    const { history } = this.props;
    const { checkbox, tabActiveKey } = this.state;
    const urlParams = AppState.currentMenuType;
    return (
      <Page className="c7n-epicBurndown">
        <Header 
          title="史诗燃尽图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <SwithChart
            history={history}
            current="epicBurndown"
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
                    style={{ width: 512, marginRight: 33, height: 35 }}
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
                      <figure className="icon-show-progress">
                        <div className="icon-show-info-svg">
                          <img src={seeProgress} alt="查看进度" />
                        </div>
                        <figcaption className="icon-show-info-detail">
                          <p className="icon-show-info-detail-header">查看进度</p>
                          <p className="icon-show-info-detail-content">按照史诗查看冲刺进度</p>
                        </figcaption>
                      </figure>
                      <figure>
                        <div className="icon-show-info-svg">
                          <img src={seeChangeRange} alt="查看变更范围" />
                        </div>
                        <figcaption className="icon-show-info-detail">
                          <p className="icon-show-info-detail-header">查看变更范围</p>
                          <p className="icon-show-info-detail-content">跟踪范围的扩大和缩小，由底部条状信息显示。</p>
                        </figcaption>
                      </figure>
                    </div>
                  </div>
                 
                </div>
                <div>
                  {this.renderEpicInfo()}
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
                <Tabs 
                  activeKey={tabActiveKey} 
                  onChange={(key) => {
                    this.setState({
                      tabActiveKey: key,
                    });
                  }}
                >
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
