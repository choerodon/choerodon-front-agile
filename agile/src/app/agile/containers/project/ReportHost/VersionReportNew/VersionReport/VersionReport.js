import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import {
 Page, Header, Content, stores 
} from 'choerodon-front-boot';
import {
 Button, Tabs, Table, Select, Icon, Tooltip, Spin 
} from 'choerodon-ui';
import pic from './no_version.svg';
import finish from './legend/finish.svg';
import total from './legend/total.svg';
import noEstimated from './legend/noEstimated.svg';
import SwithChart from '../../Component/switchChart';
import StatusTag from '../../../../../components/StatusTag';
import PriorityTag from '../../../../../components/PriorityTag';
import TypeTag from '../../../../../components/TypeTag';
import VS from '../../../../../stores/project/versionReportNew';
import EmptyBlock from '../../../../../components/EmptyBlock';
import './VersionReport.scss';

const TabPane = Tabs.TabPane;
const { AppState } = stores;
const Option = Select.Option;
const MONTH = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

@observer
class EpicReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linkFromParamUrl: undefined,
    };
  }

  componentDidMount() {
    const { location: { search } } = this.props;
    const linkFromParamUrl = _.last(search.split('&')).split('=')[1];
    this.setState({
      linkFromParamUrl,
    });

    VS.loadEpicAndChartAndTableData();
  }
  
  getLabel(record) {
    if (VS.beforeCurrentUnit === 'story_point') {
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
    const commonOption = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        orient: 'horizontal',
        x: 'center',
        y: 0,
        padding: [0, 50, 0, 0],
        itemWidth: 14,
        data: [
          ...[
            VS.beforeCurrentUnit === 'issue_count' ? {} : {
              name: `总计 ${VS.getChartYAxisName}`,
              icon: `image://${total}`,
            },
          ],
          ...[
            VS.beforeCurrentUnit === 'issue_count' ? {} : {
              name: `已完成 ${VS.getChartYAxisName}`,
              icon: `image://${finish}`,
            },
          ],
          ...[
            VS.beforeCurrentUnit === 'issue_count' ? {
              name: '问题数量',
              icon: `image://${total}`,
            } : {},
          ],
          ...[
            VS.beforeCurrentUnit === 'issue_count' ? {} : {
              name: '未预估问题百分比',
              icon: `image://${noEstimated}`,
            },
          ],
          ...[
            VS.beforeCurrentUnit === 'issue_count' ? {
              name: '已完成问题数',
              icon: `image://${finish}`,
            } : {},
          ],
        ],
      },
      grid: {
        y2: 10,
        top: '30',
        left: 0,
        right: '20',
        containLabel: true,
      },
      calculable: true,
      xAxis: {
        // name: '日期',
        type: 'category',
        boundaryGap: false,
        nameLocation: 'end',
        nameGap: -10,
        nameTextStyle: {
          color: '#000',
          // verticalAlign: 'bottom',
          padding: [35, 0, 0, 0],
        },
        axisTick: { show: false },
        axisLine: {
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
          },
          formatter(value, index) {
            // return `${value.split('-')[2]}/${MONTH[value.split('-')[1] * 1]}月`;
            return value.slice(5);
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
            width: 2,
            type: 'solid',
          }, 
        },
        data: VS.getChartDataX,
      },
    };
    let option;
    if (VS.beforeCurrentUnit === 'issue_count') {
      option = {
        yAxis: [
          {
            name: '问题数',
            nameTextStyle: {
              color: '#000',
            },
            type: 'value',
            minInterval: 1,
            axisTick: { show: false },
            axisLine: {
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
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#eee',
                type: 'solid',
                width: 2,
              },
            },
          },
        ],
        series: [
          {
            name: '问题数量',
            type: 'line',
            step: true,
            itemStyle: {
              color: '#78aafe',
            },
            areaStyle: {
              color: 'rgba(77, 144, 254, 0.1)',
            },
            data: VS.getChartDataYIssueCountAll,
          },
          {
            name: '已完成问题数',
            type: 'line',
            step: true,
            itemStyle: {
              color: '#00bfa4',
            },
            areaStyle: {
              color: 'rgba(0, 191, 165, 0.1)',
            },
            data: VS.getChartDataYIssueCountCompleted,
          },
          {
            name: '未预估问题百分比',
            type: 'line',
            step: true,
            itemStyle: {
              color: '#f44336',
            },
            areaStyle: {
              color: 'rgba(244, 67, 54, 0.1)',
            },
            data: VS.getChartDataYIssueCountUnEstimate,
          },
        ],
      };
    } else {
      option = {
        yAxis: [
          {
            name: VS.getChartYAxisName,
            nameTextStyle: {
              color: '#000',
            },
            type: 'value',
            minInterval: 1,
            axisTick: { show: false },
            axisLine: {
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
              },
              formatter(value, index) {
                if (value && VS.beforeCurrentUnit === 'remain_time') {
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
                width: 2,
              },
            },
          },
          {
            name: '百分比',
            nameTextStyle: {
              color: '#000',
            },
            type: 'value',
            minInterval: 1,
            axisTick: { show: false },
            axisLine: {
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
              },
              // formatter(value, index) {
              //   if (value && VS.beforeCurrentUnit !== 'issue_count') {
              //     return `${value}%`;
              //   }
              //   return value;
              // },
            },
            splitLine: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: '问题数量',
            type: 'line',
            step: true,
            itemStyle: {
              color: '#78aafe',
            },
            areaStyle: {
              color: 'rgba(77, 144, 254, 0.1)',
            },
            yAxisIndex: 1,
            data: VS.getChartDataYIssueCountAll,
          },
          {
            name: '已完成问题数',
            type: 'line',
            step: true,
            itemStyle: {
              color: '#00bfa4',
            },
            areaStyle: {
              color: 'rgba(0, 191, 165, 0.1)',
            },
            yAxisIndex: 1,
            data: VS.getChartDataYIssueCountCompleted,
          },
          {
            name: '未预估问题百分比',
            type: 'line',
            step: true,
            itemStyle: {
              color: '#f44336',
            },
            areaStyle: {
              color: 'rgba(244, 67, 54, 0.1)',
            },
            yAxisIndex: 1,
            data: VS.getChartDataYIssueCountUnEstimate,
          },
          {
            name: `已完成 ${VS.getChartYAxisName}`,
            type: 'line',
            step: true,
            yAxisIndex: 0,
            data: VS.getChartDataYCompleted,
            itemStyle: {
              color: '#00bfa4',
            },
            areaStyle: {
              color: 'rgba(0, 191, 165, 0.1)',
            },
          },
          {
            name: `总计 ${VS.getChartYAxisName}`,
            type: 'line',
            step: true,
            yAxisIndex: 0,
            data: VS.getChartDataYAll,
            itemStyle: {
              color: '#78aafe',
            },
            areaStyle: {
              color: 'rgba(77, 144, 254, 0.1)',
            },
          },
        ],
      };
    }
    return Object.assign({}, commonOption, option);
  }

  getTableDta(type) {
    if (type === 'compoleted') {
      return VS.tableData.filter(v => v.completed === 1);
    }
    if (type === 'unFinish') {
      return VS.tableData.filter(v => v.completed === 0);
    }
    if (type === 'unFinishAndunEstimate') {
      return VS.tableData.filter(v => v.completed === 0 && ((v.storyPoints === null && v.typeCode === 'story') || (v.remainTime === null && v.typeCode !== 'story')));
    }
    return [];
  }

  refresh() {
    if (!VS.currentVersionId) {
      VS.loadEpicAndChartAndTableData();
    } else {
      VS.loadChartData();
      VS.loadTableData();
    }
  }

  handleChangeCurrentVersion(versionId) {
    VS.setCurrentVersion(versionId);
    VS.loadChartData();
    VS.loadTableData();
  }

  handleChangeCurrentUnit(unit) {
    VS.setCurrentUnit(unit);
    VS.loadChartData();
  }

  transformRemainTime(remainTime) {
    if (!remainTime) {
      return '0';
    }
    let time = remainTime * 1;
    const w = Math.floor(time / 40);
    time -= 40 * w;
    const d = Math.floor(time / 8);
    time -= 8 * d;
    return `${w ? `${w}w ` : ''}${d ? `${d}d ` : ''}${time ? `${time}h ` : ''}`;
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
                history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${issueNum}&paramIssueId=${record.issueId}&paramUrl=reporthost/versionReport`);
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
 overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 
}}>
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
        VS.beforeCurrentUnit === 'issue_count' ? {} : {
          width: '10%',
          title: VS.beforeCurrentUnit === 'story_point' ? '故事点' : '剩余时间',
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
        pagination={this.getTableDta(type).length > 10}
        rowKey={record => record.issueId}
        dataSource={this.getTableDta(type)}
        filterBar={false}
        columns={column}
        scroll={{ x: true }}
        loading={VS.tableLoading}
      />
    );
  }

  render() {
    const { history } = this.props;
    const { linkFromParamUrl } = this.state;
    const urlParams = AppState.currentMenuType;
    return (
      <Page className="c7n-versionReport">
        <Header 
          title="版本报告"
          backPath={`/agile/${linkFromParamUrl || 'reporthost'}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <SwithChart
            history={this.props.history}
            current="versionReport"
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
          title="版本报告"
          description="跟踪对应的版本发布日期。这样有助于您监控此版本是否按时发布，以便工作滞后时能采取行动。"
          link="http://v0-9.choerodon.io/zh/docs/user-guide/agile/report/version-report/"
        >
          {
            !(!VS.versions.length && VS.versionFinishLoading) ? (
              <div>
                <div style={{ display: 'flex' }}>
                  <Select
                    style={{ width: 244 }}
                    label="版本"
                    value={VS.currentVersionId}
                    onChange={this.handleChangeCurrentVersion.bind(this)}
                  >
                    {
                      VS.versions.map(version => (
                        <Option key={version.versionId} value={version.versionId}>{version.name}</Option>
                      ))
                    }
                  </Select>
                  <Select
                    style={{ width: 244, marginLeft: 24 }}
                    label="单位"
                    value={VS.currentUnit}
                    onChange={this.handleChangeCurrentUnit.bind(this)}
                  >
                    <Option key="story_point" value="story_point">故事点</Option>
                    <Option key="issue_count" value="issue_count">问题计数</Option>
                    <Option key="remain_time" value="remain_time">剩余时间</Option>
                  </Select>
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: '600', marginBottom: 0 }}>{VS.getCurrentVersion.versionId && VS.getCurrentVersion.statusCode === 'released' ? `发布于 ${VS.getCurrentVersion.releaseDate ? VS.getCurrentVersion.releaseDate : '未指定发布日期'}` : '未发布'}</p>
                  <p
                    style={{
                      color: '#3F51B5',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 0,
                    }}
                    role="none"
                    onClick={() => {
                      this.props.history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramType=version&paramId=${VS.currentVersionId}&paramName=${VS.getCurrentVersion.name}下的问题&paramUrl=reporthost/VersionReport`);
                    }}
                  >

                    在“问题管理中”查看
<Icon style={{ fontSize: 13 }} type="open_in_new" />
                  </p>
                </div>
                <Spin spinning={VS.chartLoading}>
                  <div className="c7n-report">
                    {
                      VS.chartData.length ? (
                        <div className="c7n-chart">
                          {
                            VS.reload ? null : (
                              <ReactEcharts option={this.getOption()} style={{ height: 400 }} />
                            )
                          }
                        </div>
                      ) : (
                        <div style={{ padding: '20px 0', textAlign: 'center', width: '100%' }}>
                          {VS.tableData.length ? '当前单位下问题均未预估，切换单位或从下方问题列表进行预估。' : '当前版本下没有问题。'}
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
                  {
                    VS.beforeCurrentUnit === 'issue_count' ? null : (
                      <TabPane tab="未完成的未预估问题" key="undo">
                        {this.renderTable('unFinishAndunEstimate')}
                      </TabPane>
                    )
                  }
                </Tabs>
              </div>
            ) : (
              <EmptyBlock
                style={{ marginTop: 40 }}
                textWidth="auto"
                pic={pic}
                title="当前项目无可用版本"
                des={(
<div>
                    <span>请在</span>
                    <span
                      style={{ color: '#3f51b5', margin: '0 5px', cursor: 'pointer' }}
                      role="none"
                      onClick={() => {
                        history.push(`/agile/release?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
                      }}
                    >
                      发布版本
                    </span>
                    <span>中创建一个版本</span>
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

export default EpicReport;
