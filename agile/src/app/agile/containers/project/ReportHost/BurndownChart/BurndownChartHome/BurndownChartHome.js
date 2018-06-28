import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Spin, message, Icon, Select, Table, Menu, Dropdown } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import '../../../../main.scss';
import BurndownChartStore from '../../../../../stores/project/burndownChart/BurndownChartStore';
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
                parentIssueId: item.parentIssueId,
                parentIssueNum: item.parentIssueNum,
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
              parentIssueId: item.parentIssueId,
              parentIssueNum: item.parentIssueNum,
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
        left: '3%',
        right: '3%',
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
        axisLabel: {
          formatter(value, index) {
            window.console.log();
            return `${value.split(' ')[0]}\n${value.split(' ')[1]}`;
          },
        },
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
  handleClick(e) {
    if (e.key === '0') {
      const { history } = this.props;
      const urlParams = AppState.currentMenuType;
      history.push(`/agile/reporthost/sprintreport?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`);
    }
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
  renderDetail(item, record) {
    window.console.log(record);
    let result = '-';
    if (record.type !== 'startSprint' && record.type !== 'endSprint') {
      if (item.statistical) {
        if (item.oldValue !== item.newValue) {
          result = `由${item.oldValue}到${item.newValue}`;
        }
      }
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
    if (text === 'addDuringSprint') {
      result = '在冲刺期间添加';
    }
    if (text === 'removeDoneDuringSprint') {
      result = '在冲刺期间从已完成到一个其他状态';
    }
    if (text === 'timespent') {
      result = '用户登记工作日志';
    }
    if (text === 'removeDuringSprint') {
      result = '冲刺中移除';
    }
    if (text === 'endSprint') {
      result = '关闭冲刺';
    }
    if (text === 'addDoneDuringSprint') {
      result = '在冲刺期间移动到已完成';
    }
    if (text === 'timeestimate') {
      result = '用户修改剩余估计时间';
    }
    if (text === 'valueChange') {
      if (this.state.select === 'remainingEstimatedTime') {
        result = '用户修改预估时间';
      } else if (this.state.select === 'storyPoints') {
        result = '用户修改故事点';
      } else {
        result = '用户修改问题计数';
      }
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
              <p style={{ whiteSpace: 'nowrap', color: '#3F51B5' }}>{item.parentIssueId ? `${item.parentIssueNum}/${item.issueNum}` : item.issueNum}</p>
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
      dataIndex: 'detail',
      key: 'detail',
      render: (text, record) => (
        <div>
          {
            record.issues.map(item => (
              <p>
                {this.renderDetail(item, record)}
              </p>
            ))
          }
        </div>
      ),
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
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    const menu = (
      <Menu onClick={this.handleClick.bind(this)}>
        <Menu.Item key="0">
          Sprint报告
        </Menu.Item>
      </Menu>
    );
    return (
      <Page>
        <Header
          title="燃尽图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}
        >
          <Button funcTyp="flat" onClick={this.getChartData.bind(this)}>
            <Icon type="refresh" />刷新
          </Button>
          <Dropdown placement="bottomCenter" trigger={['click']} overlay={menu}>
            <Button icon="arrow_drop_down" funcTyp="flat">
              切换报表
            </Button>
          </Dropdown>
        </Header>
        <Content
          title={sprintName ? `迭代冲刺“${sprintName}”的燃尽图` : '无冲刺迭代的燃尽图'}
          description="跟踪记录所有问题的剩余工作工作时间，预估完成冲刺任务的可能性，回顾总结迭代过程中的经验与不足。这有助于在团队管理方面取得更进一步的掌控与把握。"
          link="#"
        >
          <Spin spinning={this.state.loading}>
            {
              BurndownChartStore.getSprintList.length > 0 ? (
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
                    pagination={false}
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

