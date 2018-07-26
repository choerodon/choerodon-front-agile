import React, { Component } from 'react';
import { observer } from 'mobx-react';
import echarts from 'echarts/lib/echarts';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, Tabs, Table, Select, Icon, Tooltip, Dropdown, Menu } from 'choerodon-ui';
import filter from 'lodash/filter';
import ReportStore from '../../../../../stores/project/Report';
import reportData from '../../Home/list';
import './pie.scss';
import VersionReportStore from "../../../../../stores/project/versionReport/VersionReport";
// import './ReleaseDetail.scss';


const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { AppState } = stores;

@observer
class ReleaseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    // ReportStore.init();
  }

  getOption() {
    return {
      // title : {
      //   text: '某站点用户访问来源',
      //   subtext: '统计图',
      //   x:'center'
      // },
      color:['#9665E2','#F7667F','#FAD352', '#45A3FC','#56CA77'],
      // color:['#9665E2','#F7667F'],
      tooltip : {
        trigger: 'item',
        formatter: "问题: {c} {a} <br/>{b} : {d}%",
        padding: 10,
        textStyle: {
          color: '#000',
        },
        extraCssText: 'background: #FFFFFF;\n' +
        'border: 1px solid #DDDDDD;\n' +
        'box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20);',
      },
      series : [
        {
          name: '',
          type: 'pie',
          // radius: '55%',
          hoverAnimation: false,
          center: ['40%', '50%'],
          data:[
            {value:335, name:'gg@hand-china.com'},
            {value:310, name:'aa@hand-china.com'},
            {value:234, name:'bb@hand-china.com'},
            {value:135, name:'cc@hand-china.com'},
            {value:1548, name:'ff@hand-china.com'},
            {value:130, name:'bb@hand-china.com'},
            {value:1542, name:'nn@hand-china.com'}
        }
      ]
    };
  }
  handleClick(e) {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    const url = filter(reportData, item => item.key === e.key)[0].link;
    history.push(`${url}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
  }
  render() {
    const data = [
      {value:335, name:'gg@hand-china.com'},
      {value:310, name:'aa@hand-china.com'},
      {value:234, name:'bb@hand-china.com'},
      {value:135, name:'cc@hand-china.com'},
      {value:1548, name:'ff@hand-china.com'},
      {value:130, name:'bb@hand-china.com'},
      {value:1542, name:'nn@hand-china.com'}
    ];
    let total = 0;
    for (let i = 0; i < data.length; i += 1) {
      total += data[i].value;
    }
    const colors = ['#9665E2','#F7667F','#FAD352', '#45A3FC','#56CA77'];
    const menu = (
      <Menu onClick={this.handleClick.bind(this)}>
        {reportData.map(item => (
          <Menu.Item key={item.key}>
            {item.title}
          </Menu.Item>
        ))}
      </Menu>
    );
    const urlParams = AppState.currentMenuType;
    const type = [
      { title: '经办人', value: '' },
      { title: '模块', value: '' },
      { title: '问题类型', value: '' },
      { title: '修复版本', value: '' },
      { title: '优先级', value: '' },
      { title: '状态', value: '' },
      { title: '冲刺', value: '' },
      { title: '史诗', value: '' },
      { title: '解决结果', value: '' },
    ];
    return (
      <Page className="pie-chart">
        <Header
          title="统计图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <Button>刷新</Button>
          <Dropdown placement="bottomCenter" trigger={['click']} overlay={menu}>
            <Button icon="arrow_drop_down" funcType="flat">
              切换报表
            </Button>
          </Dropdown>
        </Header>
        <Content
          title={`迭代冲刺“${ReportStore.currentSprint.sprintName || ''}”的统计图`}
          description="了解每个冲刺中完成、进行和退回待办的工作。这有助于您确定您团队的工作量是否超额，更直观的查看冲刺的范围与工作量。"
          link="http://v0-8.choerodon.io/zh/docs/user-guide/agile/report/sprint/"
        >
          <Select
            label="统计类型"
            value={this.state.chosenVersion}
            style={{
              width: 512,
              marginBottom: 32,
            }}
            onChange={(value) => {

            }}
          >
            {
              type.map(item => (
                <Option value={item.value}>{item.title}</Option>
              ))
            }
          </Select>
          <div style={{ marginTop: 30, display: 'flex' }}>
            <ReactEchartsCore
              ref={(pie) => { this.pie = pie; }}
              style={{ width: '58%', height: 404 }}
              echarts={echarts}
              option={this.getOption()}
            />
            <div className="pie-title">
              <p className="pie-legend-title">数据统计</p>
              <table>
                <thead>
                  <tr>
                    <td style={{ paddingRight: 106 }}>经办人</td>
                    <td style={{ paddingRight: 68 }}>问题</td>
                    <td>百分比</td>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr>
                      <td style={{ paddingTop: 12, paddingRight: 106 }}>
                        <div className="pie-legend-icon" style={{ background: colors[index % 5] }} />
                        <div className="pie-legend-text" >{item.name}</div>
                      </td>
                      <td style={{ paddingTop: 12, paddingRight: 68 }}>{item.value}</td>
                      <td style={{ paddingTop: 12 }}>{`${((item.value/total)*100).toFixed(2)} %`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Content>
      </Page>
    );
  }
}

export default ReleaseDetail;

