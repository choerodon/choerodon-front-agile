import React, { Component } from 'react';
import { observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
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
    VS.setCurrentUnit('storyPoint');
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
        data: ['7/1-7/7 迭代冲刺', '7/8-7/14 迭代冲刺', '7/15-7/21 迭代冲刺', '7/22-7/27 迭代冲刺', '7/28-8/1 迭代冲刺', '', ''],
        // axisLabel: {
        //   formatter(value, index) {
        //     return `${value.split(' ')[0]}\n${value.split(' ')[1]}`;
        //   },
        // },
      },
      yAxis: {
        name: '故事点',
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
          data: [10, 15, 20, 25, 30, undefined, undefined],
        },
        {
          name: '已完成',
          type: 'bar',
          barWidth: 34,
          data: [5, 10, 15, 20, 25, undefined, undefined],
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
    VS.loadChartData();
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
        title: '预估时间',
        dataIndex: 'time1',
      }, {
        width: '33%',
        title: '完成',
        dataIndex: 'finish',
      },
    ];
    return (
      <Table
        rowKey={record => record.sprintId}
        dataSource={VS.tableData}
        columns={column}
        filterBar={false}
        scroll={{ x: true }}
        loading={this.state.tableLoading}
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
          description="跟踪各个Sprint已完成的工时量。这有助于您确定您的团队的速度并预估团队在未来Sprint中实际完成的工作。"
          // link="http://v0-8.choerodon.io/zh/docs/user-guide/agile/report/sprint/"
        >
          <Select
            style={{ width: 512 }}
            label="单位选择"
            value={VS.currentUnit}
            onChange={this.handleChangeCurrentUnit.bind(this)}
          >
            <Option key="storyPoint" value="storyPoint">故事点</Option>
            <Option key="count" value="count">问题计数</Option>
            <Option key="remain" value="remain">剩余时间</Option>
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
