import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Button, Spin, message, Icon, Select, Table, Menu, Dropdown, 
} from 'choerodon-ui';
import {
  Page, Header, Content, stores, 
} from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';
import BurndownChartStore from '../../../../../stores/project/burndownChart/BurndownChartStore';
import './BurndownChartHome.scss';
import restSvg from '../../../../../assets/image/rest.svg';
import hopeSvg from '../../../../../assets/image/hope.svg';
import NoDataComponent from '../../Component/noData';
import epicSvg from '../../Home/style/pics/no_sprint.svg';
import SwithChart from '../../Component/switchChart';

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
      endDate: '',
      startDate: '',
    };
  }

  componentWillMount() {
    this.getSprintData();
  }

  getBetweenDateStr(start, end) {
    const result = [];
    const beginDay = start.split('-');
    const endDay = end.split('-');
    const diffDay = new Date();
    const dateList = new Array();
    let i = 0;
    diffDay.setDate(beginDay[2]);
    diffDay.setMonth(beginDay[1] - 1);
    diffDay.setFullYear(beginDay[0]);
    result.push(start);
    while (i == 0) {
      const countDay = diffDay.getTime() + 24 * 60 * 60 * 1000;
      diffDay.setTime(countDay);
      dateList[2] = diffDay.getDate();
      dateList[1] = diffDay.getMonth() + 1;
      dateList[0] = diffDay.getFullYear();
      if (String(dateList[1]).length == 1) { dateList[1] = `0${dateList[1]}`; }
      if (String(dateList[2]).length == 1) { dateList[2] = `0${dateList[2]}`; }
      result.push(`${dateList[0]}-${dateList[1]}-${dateList[2]}`);
      if (dateList[0] == endDay[0] && dateList[1] == endDay[1] && dateList[2] == endDay[2]) {
        i = 1;
      }
    }
    return result;
  }

  getSprintData() {
    BurndownChartStore.axiosGetSprintList().then((res) => {
      BurndownChartStore.setSprintList(res);
      this.setState({
        defaultSprint: res[0].sprintId,
        endDate: res[0].endDate,
        startDate: res[0].startDate,
      }, () => {
        this.getChartData();
        this.getChartCoordinate();
      });
    }).catch((error) => {
    });
  }

  getChartCoordinate() {
    BurndownChartStore.axiosGetBurndownCoordinate(this.state.defaultSprint, this.state.select).then((res) => {
      this.setState({ expectCount: res.expectCount });
      const keys = Object.keys(res.coordinate);
      let [minDate, maxDate] = [keys[0], keys[0]];
      for (let a = 1, len = keys.length; a < len; a += 1) {
        if (moment(keys[a]).isAfter(maxDate)) {
          maxDate = keys[a];
        }
        if (moment(keys[a]).isBefore(minDate)) {
          minDate = keys[a];
        }
      }
      // 如果后端给的最大日期小于结束日期
      let allDate;
      if (moment(maxDate).isBefore(this.state.endDate.split(' ')[0])) {
        allDate = this.getBetweenDateStr(minDate, this.state.endDate.split(' ')[0]);
      } else if (moment(minDate).isSame(maxDate)) {
        allDate = [minDate];
      } else {
        allDate = this.getBetweenDateStr(minDate, maxDate);
      }
      // const allDate = this.getBetweenDateStr(minDate, maxDate);
      const allDateValues = [];
      for (let b = 0, len = allDate.length; b < len; b += 1) {
        const nowKey = allDate[b];
        if (res.coordinate.hasOwnProperty(nowKey)) {
          allDateValues.push(res.coordinate[allDate[b]]);
        } else if (moment(nowKey).isAfter(maxDate)) {
          allDateValues.push(null);
        } else {
          const beforeKey = allDate[b - 1];
          allDateValues.push(res.coordinate[beforeKey]);
          res.coordinate[nowKey] = res.coordinate[beforeKey];
        }
      }
      const sliceDate = _.map(allDate, item => item.slice(5).replace('-', '/'));
      this.setState({
        xAxis: sliceDate,
        yAxis: allDateValues,
      });
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
        for (let index = 0, len = data.length; index < len; index += 1) {
          if (!_.some(newData, { date: data[index].date })) {
            newData.push({
              date: data[index].date,
              issues: [{
                issueId: data[index].issueId,
                issueNum: data[index].issueNum,
                newValue: data[index].newValue,
                oldValue: data[index].oldValue,
                statistical: data[index].statistical,
                parentIssueId: data[index].parentIssueId,
                parentIssueNum: data[index].parentIssueNum,
              }],
              type: data[index].type,
            });
          } else {
            let index2;
            for (let i = 0, len2 = newData.length; i < len2; i += 1) {
              if (newData[i].date === data[index].date) {
                index2 = i;
              }
            }
            if (newData[index2].type.indexOf(data[index].type) === -1) {
              newData.push({
                date: data[index].date,
                issues: [{
                  issueId: data[index].issueId,
                  issueNum: data[index].issueNum,
                  newValue: data[index].newValue,
                  oldValue: data[index].oldValue,
                  statistical: data[index].statistical,
                  parentIssueId: data[index].parentIssueId,
                  parentIssueNum: data[index].parentIssueNum,
                }],
                type: data[index].type,
              });
              // newData[index2].type += `-${data[index].type}`;
            } else {
              newData[index2].issues = [...newData[index2].issues, {
                issueId: data[index].issueId,
                issueNum: data[index].issueNum,
                newValue: data[index].newValue,
                oldValue: data[index].oldValue,
                statistical: data[index].statistical,
                parentIssueId: data[index].parentIssueId,
                parentIssueNum: data[index].parentIssueNum,
              }];
            }
          }
        }
        for (let index = 0, dataLen = newData.length; index < dataLen; index += 1) {
          let rest = 0;
          if (newData[index].type !== 'endSprint') {
            if (index > 0) {
              rest = newData[index - 1].rest;
            }
          }
          for (let i = 0, len = newData[index].issues.length; i < len; i += 1) {
            if (newData[index].issues[i].statistical) {
              rest += newData[index].issues[i].newValue - newData[index].issues[i].oldValue;
            }
          }
          newData[index].rest = rest;
        }
        BurndownChartStore.setBurndownList(newData);
        this.setState({
          loading: false,
        });
        // if (moment(this.state.endDate).isAfter(_.map(newData, 'date')[_.map(newData, 'date').length - 1])) {
        //   this.setState({
        //     xAxis: [..._.map(newData, 'date'), this.state.endDate],
        //     yAxis: _.map(newData, 'rest'),
        //     loading: false,
        //   });
        // } else {
        //   this.setState({
        //     xAxis: _.map(newData, 'date'),
        //     yAxis: _.map(newData, 'rest'),
        //     loading: false,
        //   });
        // }
      }).catch((error) => {
      });
  }

  getMaxY() {
    // const data = this.state.yAxis;
    // let max = 0;
    // for (let index = 0, len = data.length; index < len; index += 1) {
    //   if (data[index] > max) {
    //     max = data[index];
    //   }
    // }
    let max = 0;
    const data = BurndownChartStore.getBurndownList;
    const tar = data.filter(item => item.type === 'startSprint');
    if (tar.length) {
      max = tar[0].rest;
    }
    return max;
  }

  getOption() {
    const { select } = this.state;
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
        },
        extraCssText:
          'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
      },
      legend: {
        top: '24px',
        right: '3.2%',
        data: [{
          name: '期望值',
          icon: 'line',
        }, {
          name: '剩余值',
          icon: 'line',
        }],
      },
      grid: {
        y2: 30,
        top: '60',
        left: '20',
        right: '40',
        containLabel: true,
      },
      // grid: {
      //   left: '3%',
      //   right: '3%',
      //   // bottom: '3%',
      //   containLabel: true,
      //   show: true,
      // },
      // toolbox: {
      //   feature: {
      //     saveAsImage: {},
      //   },
      // },


      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.state.xAxis,
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
          interval: parseInt(this.state.xAxis.length / 7) ? parseInt(this.state.xAxis.length / 7) - 1 : 0,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
            fontStyle: 'normal',
          },
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
      },
      yAxis: {
        name: this.renderChartTitle(),
        nameTextStyle: {
          color: '#000',
        },
        nameGap: 22,
        type: 'value',
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
            if (select === 'remainingEstimatedTime' && value) {
              return `${value}h`;
            } else {
              return value;
            }
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
          symbol: 'none',
          name: '期望值',
          type: 'line',
          data: [[this.state.startDate.split(' ')[0].slice(5).replace('-', '/'), this.state.expectCount], [this.state.endDate.split(' ')[0].slice(5).replace('-', '/'), 0]],
          itemStyle: {
            color: 'rgba(0,0,0,0.65)',
          },
          lineStyle: {
            type: 'dotted',
            color: 'rgba(0,0,0,0.65)',
          },
        },
        {
          symbol: 'none',
          name: '剩余值',
          type: 'line',
          itemStyle: {
            color: '#4D90FE',
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
      this.getChartCoordinate();
    });
  }
  
  renderChartTitle() {
    let result = '';
    if (this.state.select === 'remainingEstimatedTime') {
      result = '剩余时间';
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

  judgeText(text) {
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
      result = '用户修改剩余时间';
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

  renderTypeText(text) {
    const splitArray = text.split('-');
    return (
      <div>
        {
          splitArray.map(item => (
            <p>{this.judgeText(item)}</p>
          ))
        }
      </div>
    );
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
              <p
                style={{ 
                  whiteSpace: 'nowrap', 
                  color: '#3F51B5',
                  cursor: 'pointer',
                }}
                role="none"
                onClick={() => {
                  const { history } = this.props;
                  const urlParams = AppState.currentMenuType;
                  if (item.parentIssueId) {
                    history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${item.parentIssueNum}&paramIssueId=${item.parentIssueId}&paramUrl=reporthost/burndownchart`);
                  } else {
                    history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramName=${item.issueNum}&paramIssueId=${item.issueId}&paramUrl=reporthost/burndownchart`);
                  }
                }}
              >
                {item.parentIssueId ? `${item.parentIssueNum}/${item.issueNum}` : item.issueNum}

              </p>
            ))
          }
        </div>
      ),
    }, {
      title: '事件类型',
      dataIndex: 'type',
      key: 'type',
      render: text => (
        <div>{this.renderTypeText(text)}</div>
      ),
    }, {
      title: '事件详情',
      dataIndex: 'detail',
      key: 'detail',
      render: (text, record) => (
        <div>
          {
            record.issues.map(item => (
              <div>
                {this.renderDetail(item, record)}
              </div>
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
              <div>
                {this.renderUp(item)}
              </div>
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
              <div>
                {this.renderDown(item)}
              </div>
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
    for (let index = 0, len = BurndownChartStore.getSprintList.length; index < len; index += 1) {
      if (BurndownChartStore.getSprintList[index].sprintId === this.state.defaultSprint) {
        sprintName = BurndownChartStore.getSprintList[index].sprintName;
      }
    }
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    
    return (
      <Page>
        <Header
          title="燃尽图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <SwithChart
            history={this.props.history}
            current="burndownchart"
          />
          <Button funcType="flat" onClick={this.getChartData.bind(this)}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title={sprintName ? `迭代冲刺“${sprintName}”的燃尽图` : '无冲刺迭代的燃尽图'}
          description="跟踪记录所有问题的剩余工作工作时间，预估完成冲刺任务的可能性，回顾总结迭代过程中的经验与不足。这有助于在团队管理方面取得更进一步的掌控与把握。"
          link="http://v0-9.choerodon.io/zh/docs/user-guide/agile/report/burn-down/"
        >
          <Spin spinning={this.state.loading}>
            {
              BurndownChartStore.getSprintList.length > 0 ? (
                <div>
                  <div>
                    <Select
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      style={{ width: 244 }} 
                      label="迭代冲刺" 
                      value={this.state.defaultSprint}
                      onChange={(value) => {
                        let endDate;
                        let startDate;
                        for (let index = 0, len = BurndownChartStore.getSprintList.length; index < len; index += 1) {
                          if (BurndownChartStore.getSprintList[index].sprintId === value) {
                            endDate = BurndownChartStore.getSprintList[index].endDate;
                            startDate = BurndownChartStore.getSprintList[index].startDate;
                          }
                        }
                        this.setState({
                          defaultSprint: value,
                          endDate,
                          startDate,
                        }, () => {
                          this.getChartData();
                          this.getChartCoordinate();
                        });
                      }}
                    >
                      {BurndownChartStore.getSprintList.length > 0 
                        ? BurndownChartStore.getSprintList.map(item => (
                          <Option value={item.sprintId}>{item.sprintName}</Option>
                        )) : ''}
                    </Select>
                    <Select
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      style={{ width: 244, marginLeft: 24 }} 
                      label="单位" 
                      defaultValue={this.state.select}
                      onChange={this.handleChangeSelect.bind(this)}
                    >
                      <Option value="remainingEstimatedTime">剩余时间</Option>
                      <Option value="storyPoints">故事点</Option>
                      <Option value="issueCount">问题计数</Option>
                    </Select>
                  </div>
                  <ReactEcharts option={this.getOption()} />
                  <Table
                    dataSource={BurndownChartStore.getBurndownList}
                    columns={columns}
                    pagination={false}
                    rowKey={record => `${record.date}-${record.type}`}
                  />
                </div>
              ) : (
                <NoDataComponent title="冲刺" links={[{ name: '待办事项', link: '/agile/backlog' }]} img={epicSvg} />
              )
            }
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default BurndownChartHome;
