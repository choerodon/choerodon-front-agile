import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Spin, message, Icon, Select } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import BurndownChartStore from '../../../../stores/project/burndownChart/BurndownChartStore';

const { AppState } = stores;
const Option = Select.Option;

@observer
class BurndownChartHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      xAxis: [],
      yAxis: [],
      select: 'remainingEstimatedTime',
    };
  }
  componentWillMount() {
    this.getChartData();
  }
  getChartData() {
    BurndownChartStore.axiosGetBurndownChartData(1, this.state.select).then((res) => {
      window.console.log(res);
      this.setState({
        xAxis: res.xAxis,
        yAxis: res.yAxis,
      });
    }).catch((error) => {
      window.console.log(error);
    });
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
          icon: 'pin',
        }, {
          name: '剩余值',
          icon: 'pin',
        }],
      },
      grid: {
        left: '0%',
        right: '0%',
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
          data: [[0, this.state.yAxis[0]], [this.state.yAxis.length - 1, 0]],
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
  handleChangeSelect(value) {
    this.setState({
      select: value,
    }, () => {
      this.getChartData();
    });
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
    return (
      <Page>
        <Header title="燃尽图">
          <Button funcTyp="flat">
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content
          title="迭代冲刺“xxxx”的燃尽图"
          description="了解每个sprint中完成的工作或者退回后备的工作。这有助于您确定您的团队是过量使用或如果有过多的范围扩大。"
          link="#"
        >
          <div>
            <Select style={{ width: 244 }} label="迭代冲刺" defaultValue="0">
              <Option value="0">6/10迭代冲刺</Option>
            </Select>
            <Select 
              style={{ width: 244, marginLeft: 24 }} 
              label="单位" 
              defaultValue={this.state.select}
              onChange={this.handleChangeSelect.bind(this)}
            >
              <Option value="remainingEstimatedTime">剩余预估时间</Option>
              <Option value="storyPoints">故事点</Option>
              <Option value="issueCount">问题计数</Option>
            </Select>
          </div>
          <ReactEcharts option={this.getOption()} />
        </Content>
      </Page>
    );
  }
}

export default BurndownChartHome;

