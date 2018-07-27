import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, Tabs, Table, Select, Icon, Tooltip, Dropdown, Menu, Spin } from 'choerodon-ui';
import SwithChart from '../../Component/switchChart';
import VS from '../../../../../stores/project/velocityChart';
import './VelocityChart.scss';

const { AppState } = stores;
const Option = Select.Option;

@observer
class VelocityChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  componentDidMount() {
    VS.setCurrentUnit('story_point');
    VS.setChartData([]);
    VS.setChartDataX([]);
    VS.setChartDataYCommitted([]);
    VS.setChartDataYCompleted([]);
    VS.setChartYAxisName('故事点');
    VS.setTableData([]);
    VS.loadChartAndTableData();
  }

  getOption() {
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        orient: 'horizontal', // 'vertical'
        x: 'right', // 'center' | 'left' | {number},
        y: 0, // 'center' | 'bottom' | {number}
        padding: [0, 50, 0, 0],
        itemWidth: 14,
        data: [
          {
            name: '提交',
            icon: 'rectangle',
          }, {
            name: '已完成',
            icon: 'rectangle',
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
        name: '冲刺',
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
        },
        // splitArea: {
        //   show: true,
        //   interval: 0,
        // },
        splitLine: {
          show: false,
          onGap: false,
          interval: 0,
          lineStyle: {
            color: ['#eee'],
            width: 1,
            type: 'solid',
          }, 
        },
        boundaryGap: true,
        // boundaryGap: false,
        // data: ['7/1-7/7 迭代冲刺', '7/8-7/14 迭代冲刺', '7/15-7/21 迭代冲刺', '7/22-7/27 迭代冲刺', '7/28-8/1 迭代冲刺', '', ''],
        data: VS.chartDataX.slice(),
        // axisLabel: {
        //   formatter(value, index) {
        //     return `${value.split(' ')[0]}\n${value.split(' ')[1]}`;
        //   },
        // },
      },
      yAxis: {
        name: VS.chartYAxisName,
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
          show: true,
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 1,
          },
        },
      },
      series: [
        {
          name: '提交',
          type: 'bar',
          barWidth: 34,
          barGap: '12%',
          itemStyle: {
            color: '#d3d3d3',
          },
          data: VS.chartDataYCommitted.slice(),
        },
        {
          name: '已完成',
          type: 'bar',
          barWidth: 34,
          data: VS.chartDataYCompleted.slice(),
          itemStyle: {
            color: '#00bfa5',
          },
          lineStyle: {
            type: 'dashed',
            color: 'grey',
          },
        },
      ],
    };
  }

  refresh() {
    VS.loadChartAndTableData();
  }

  handleChangeCurrentUnit(unit) {
    VS.setCurrentUnit(unit);
    VS.loadChartData(unit);
  }

  getTableValue(record, type) {
    const currentUnit = VS.beforeCurrentUnit;
    const CAMEL = {
      story_point: 'StoryPoints',
      remain_time: 'RemainTime',
      issue_count: 'IssueCount',
    };
    const currentProp = `${type}${CAMEL[currentUnit]}`;
    if (currentUnit === 'remain_time') {
      return this.transformRemainTime(record[currentProp]);
    }
    return record[currentProp] || 0;
  }

  transformRemainTime(remainTime, type) {
    if (!remainTime) {
      return '0';
    }
    let time = remainTime * 1;
    const w = Math.floor(time / 40);
    time -= 40 * w;
    const d = Math.floor(time / 8);
    time -= 8 * d;
    return `${w ? `${w}周 ` : ''}${d ? `${d}天 ` : ''}${time ? `${time}小时 ` : ''}`;
  }

  renderTable() {
    const column = [
      {
        width: '33%',
        title: '冲刺',
        dataIndex: 'sprintName',
        render: (sprintName, record) => (
          <span
            style={{ 
              color: '#3f51b5',
              cursor: 'pointer',
            }}
            role="none"
            onClick={() => {
              const { history } = this.props;
              const urlParams = AppState.currentMenuType;
              // history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${issueNum}&paramIssueId=${record.issueId}&paramUrl=reporthost/sprintreport`);
            }}
          >
            {sprintName}
          </span>
        ),
      }, {
        width: '33%',
        title: '预估',
        dataIndex: 'committedRemainTime',
        render: (committedRemainTime, record) => (
          <span>
            {/* {this.transformRemainTime(committedRemainTime)} */}
            {this.getTableValue(record, 'committed')}
          </span>
        ),
      }, {
        width: '33%',
        title: '完成',
        dataIndex: 'completedRemainTime',
        render: (completedRemainTime, record) => (
          <span>
            {/* {this.transformRemainTime(completedRemainTime)} */}
            {this.getTableValue(record, 'completed')}
          </span>
        ),
      },
    ];
    return (
      <Table
        rowKey={record => record.sprintId}
        dataSource={VS.chartData}
        columns={column}
        filterBar={false}
        pagination={false}
        scroll={{ x: true }}
        loading={VS.tableLoading}
      />
    );
  }

  render() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    return (
      <Page className="c7n-velocity">
        <Header 
          title="迭代速度图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <SwithChart
            history={this.props.history}
            current="velocityChart"
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
          title="迭代速度图"
          description="跟踪各个迭代已完成的工时量。这有助于您确定团队的开发速度并预估在未来迭代中能完成的工作量。"
          // link="http://v0-8.choerodon.io/zh/docs/user-guide/agile/report/sprint/"
        >
          <Select
            style={{ width: 512 }}
            label="单位选择"
            value={VS.currentUnit}
            onChange={this.handleChangeCurrentUnit.bind(this)}
          >
            <Option key="story_point" value="story_point">故事点</Option>
            <Option key="issue_count" value="issue_count">问题计数</Option>
            <Option key="remain_time" value="remain_time">剩余时间</Option>
          </Select>
          <Spin spinning={VS.chartLoading}>
            <ReactEcharts className="c7n-chart" option={this.getOption()} />
          </Spin>
          {this.renderTable()}
        </Content>
      </Page>
    );
  }
}

export default VelocityChart;
