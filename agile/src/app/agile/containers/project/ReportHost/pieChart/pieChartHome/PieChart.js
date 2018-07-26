import React, { Component } from 'react';
import { observer } from 'mobx-react';
import echarts from 'echarts/lib/echarts';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, Tabs, Table, Select, Icon, Spin} from 'choerodon-ui';
import ReportStore from '../../../../../stores/project/Report';
import './pie.scss';
import SwitchChart from '../../Component/switchChart';
import VersionReportStore from '../../../../../stores/project/versionReport/VersionReport';
// import './ReleaseDetail.scss';


const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { AppState } = stores;

@observer
class ReleaseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colors: [],
      type: '经办人',
    };
  }
  componentDidMount() {
    VersionReportStore.getPieDatas(AppState.currentMenuType.id, 'assignee');
  }

  getOption() {
    return {
      // title : {
      //   text: '某站点用户访问来源',
      //   subtext: '统计图',
      //   x:'center'
      // },
      // color:['#9665E2','#F7667F','#FAD352', '#45A3FC','#56CA77'],
      color: VersionReportStore.getColors,
      tooltip: {
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
          data: VersionReportStore.getPieData,
          label: {
            formatter: (value) => { return value.data.name + '{img|}'},
            rich: {
              img: {
                width: 20,
                height: 20,
                // align: 'left',
                backgroundColor: {
                  image: 'http://minio.staging.saas.hand-china.com/iam-service/file_16672131bdf144888ba616034934f401_a.gif',
                }
              },
            }
          },
          itemStyle : {
            normal: {
              borderWidth: 2,
              borderColor: '#ffffff',
            },
            color: (data) => {
              return this.state.colors[data.dataIndex];
            }
        },

    },
      ]
    };
  }
  changeType =(value, option) => {
    VersionReportStore.getPieDatas(AppState.currentMenuType.id, value);
    this.setState({ type: option.key });
  };
  render() {
    const data = VersionReportStore.getPieData;
    let total = 0;
    for (let i = 0; i < data.length; i += 1) {
      total += data[i].value;
    }
    const colors = VersionReportStore.getColors;
    const urlParams = AppState.currentMenuType;
    const type = [
      { title: '经办人', value: 'assignee' },
      { title: '模块', value: 'component' },
      { title: '问题类型', value: 'issueType' },
      { title: '修复版本', value: 'fixVersion' },
      { title: '优先级', value: 'priority' },
      { title: '状态', value: 'status' },
      { title: '冲刺', value: 'sprint' },
      { title: '史诗', value: 'epic' },
      { title: '解决结果', value: 'resolution' },
    ];
    return (
      <Page className="pie-chart">
        <Header
          title="统计图"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <SwitchChart />
          <Button><Icon type="refresh" />刷新</Button>
        </Header>
        <Content
          title={`项目"${AppState.currentMenuType.name}"下的问题统计图`}
          description="了解每个冲刺中完成、进行和退回待办的工作。这有助于您确定您团队的工作量是否超额，更直观的查看冲刺的范围与工作量。"
        >
          <Spin spinning={VersionReportStore.pieLoading}>
            <Select
              defaultValue={'assignee'}
              label="统计类型"
              style={{
                width: 512,
                marginBottom: 32,
              }}
              onChange={this.changeType}
            >
              {
                type.map(item => (
                  <Option value={item.value} key={item.title}>{item.title}</Option>
                ))
              }
            </Select>
            <div style={{ marginTop: 30, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
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
                      <td style={{ paddingRight: 53 }}>{this.state.type}</td>
                      <td style={{ paddingRight: 68 }}>问题</td>
                      <td>百分比</td>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr>
                        <td style={{ paddingTop: 12, paddingRight: 106 }}>
                          <div className="pie-legend-icon" style={{ background: colors[index] }} />
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
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default ReleaseDetail;

