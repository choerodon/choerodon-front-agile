import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Spin, message, Icon, Select, Table } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import '../../../main.scss';
import BurndownChartStore from '../../../../stores/project/burndownChart/BurndownChartStore';
import burndownChartStore from '../../../../stores/project/burndownChart/BurndownChartStore';
import './BurndownChartHome.scss';

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
      defaultSprint: '',
      loading: false,
    };
  }
  componentWillMount() {
    this.getSprintData();
  }
  getSprintData() {
    BurndownChartStore.axiosGetSprintList().then((res) => {
      window.console.log(res);
      BurndownChartStore.setSprintList(res);
      this.setState({
        defaultSprint: res[0].sprintId,
      }, () => {
        this.getChartData();
      });
    }).catch((error) => {
      window.console.log(error);
    });
  }
  getChartData() {
    this.setState({
      loading: true,
    });
    BurndownChartStore
      .axiosGetBurndownChartReport(this.state.defaultSprint, this.state.select).then((res) => {
        window.console.log(res);
        const data = res;
        const newData = [];
        _.forEach(data, (item) => {
          if (!_.some(newData, { date: item.date })) {
            newData.push({
              date: item.date,
              issues: [{
                issueId: item.issueId,
                issueNum: item.issueNum,
                newValue: item.newValue,
                oldValue: item.oldValue,
                statistical: item.statistical,
              }],
              type: item.type,
            });
          } else {
            let index;
            _.forEach(newData, (item2, i) => {
              if (item2.date === item.date) {
                index = i;
              }
            });
            newData[index].issues = [...newData[index].issues, {
              issueId: item.issueId,
              issueNum: item.issueNum,
              newValue: item.newValue,
              oldValue: item.oldValue,
              statistical: item.statistical,
            }];
          }
        });
        _.forEach(newData, (item, index) => {
          let rest = 0;
          if (item.type !== 'endSprint') {
            if (index > 0) {
              rest = newData[index - 1].rest;
            }
          }
          _.forEach(item.issues, (is) => {
            if (is.statistical) {
              rest += is.newValue - is.oldValue;
            }
          });
          newData[index].rest = rest;
        });
        window.console.log(newData);
        BurndownChartStore.setBurndownList(newData);
        this.setState({
          xAxis: _.map(newData, 'date'),
          yAxis: _.map(newData, 'rest'),
          loading: false,
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
  renderUp(item) {
    let result = '-';
    if (item.newValue > item.oldValue) {
      if (item.statistical) {
        result = item.newValue - item.oldValue;
      }
    }
    return result;
  }
  renderDown(item) {
    let result = '-';
    if (item.newValue < item.oldValue) {
      if (item.statistical) {
        result = item.oldValue - item.newValue;
      }
    }
    return result;
  }
  renderTypeText(text) {
    let result = '';
    if (text === 'startSprint') {
      result = '开启冲刺';
    }
    if (text === 'removeDuringSprint') {
      result = '冲刺中移除';
    }
    if (text === 'endSprint') {
      result = '关闭冲刺';
    }
    if (text === 'addDoneDuringSprint') {
      result = '冲刺中移动到已完成';
    }
    return result;
  }
  render() {
    const columns = [{
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    }, {
      title: '问题',
      dataIndex: 'issues',
      key: 'issues',
      render: (text, record) => (
        <div>
          {
            text.map(item => (
              <p style={{ whiteSpace: 'nowrap', color: '#3F51B5' }}>{item.issueNum}</p>
            ))
          }
        </div>
      ),
    }, {
      title: '事件类型',
      dataIndex: 'type',
      key: 'type',
      render: text => (
        <p>{this.renderTypeText(text)}</p>
      ),
    }, {
      title: '事件详情',
    }, {
      title: '升',
      dataIndex: 'up',
      key: 'up',
      render: (text, record) => (
        <div>
          {
            record.issues.map(item => (
              <p>
                {this.renderUp(item)}
              </p>
            ))
          }
        </div>
      ),
    }, {
      title: '降',
      dataIndex: 'down',
      key: 'down',
      render: (text, record) => (
        <div>
          {
            record.issues.map(item => (
              <p>
                {this.renderDown(item)}
              </p>
            ))
          }
        </div>
      ),
    }, {
      title: '剩余',
      dataIndex: 'rest',
      key: 'rest',
    }];
    let sprintName;
    _.forEach(BurndownChartStore.getSprintList, (item) => {
      if (item.sprintId === this.state.defaultSprint) {
        sprintName = item.sprintName;
      }
    });
    return (
      <Page>
        <Header title="燃尽图">
          <Button funcTyp="flat" onClick={this.getChartData.bind(this)}>
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content
          title={sprintName ? `迭代冲刺“${sprintName}”的燃尽图` : '无冲刺迭代的燃尽图'}
          description="了解每个sprint中完成的工作或者退回后备的工作。这有助于您确定您的团队是过量使用或如果有过多的范围扩大。"
          link="#"
        >
          <Spin spinning={this.state.loading}>
            {
              burndownChartStore.getSprintList.length > 0 ? (
                <div>
                  <div>
                    <Select 
                      style={{ width: 244 }} 
                      label="迭代冲刺" 
                      value={this.state.defaultSprint}
                      onChange={(value) => {
                        this.setState({
                          defaultSprint: value,
                        }, () => {
                          this.getChartData();
                        });
                      }}
                    >
                      {BurndownChartStore.getSprintList.length > 0 ? 
                        BurndownChartStore.getSprintList.map(item => (
                          <Option value={item.sprintId}>{item.sprintName}</Option>
                        )) : ''}
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
                  <Table
                    dataSource={BurndownChartStore.getBurndownList}
                    columns={columns}
                  />
                </div>
              ) : (
                <div className="c7n-chart-noSprint">
                  <div className="c7n-chart-icon">
                    <Icon type="info_outline" />
                  </div>
                  <p style={{ marginLeft: 20 }}>该面板无可用冲刺</p>
                </div>
              )
            }
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default BurndownChartHome;

