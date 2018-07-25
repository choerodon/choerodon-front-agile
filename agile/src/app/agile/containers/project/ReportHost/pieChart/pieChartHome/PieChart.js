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
      title : {
        text: '某站点用户访问来源',
        subtext: '统计图',
        x:'center'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
      },
      series : [
        {
          name: '访问来源',
          type: 'pie',
          radius : '55%',
          center: ['50%', '60%'],
          data:[
            {value:335, name:'直接访问'},
            {value:310, name:'邮件营销'},
            {value:234, name:'联盟广告'},
            {value:135, name:'视频广告'},
            {value:1548, name:'搜索引擎'}
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
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
      <Page className="c7n-report">
        <Header
          title="饼图"
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
          title={`迭代冲刺“${ReportStore.currentSprint.sprintName || ''}”的饼图`}
          description="了解每个冲刺中完成、进行和退回待办的工作。这有助于您确定您团队的工作量是否超额，更直观的查看冲刺的范围与工作量。"
          link="http://v0-8.choerodon.io/zh/docs/user-guide/agile/report/sprint/"
        >
          <Select
            label="统计类型"
            value={this.state.chosenVersion}
            style={{
              width: 244,
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
          <ReactEchartsCore
            echarts={echarts}
            className="c7n-chart"
            option={this.getOption()}
          />
        </Content>
      </Page>
    );
  }
}

export default ReleaseDetail;

