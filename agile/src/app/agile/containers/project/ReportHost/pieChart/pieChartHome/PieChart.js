import React, { Component } from 'react';
import { observer } from 'mobx-react';
import echarts from 'echarts/lib/echarts';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import {
  Page, Header, Content, stores, 
} from 'choerodon-front-boot';
import {
  Button, Select, Icon, Spin, Tooltip, 
} from 'choerodon-ui';
import './pie.scss';
import { reduce } from 'zrender/lib/core/util';
import SwitchChart from '../../Component/switchChart';
import VersionReportStore from '../../../../../stores/project/versionReport/VersionReport';
import NoDataComponent from '../../Component/noData';
import pic from '../../../../../assets/image/问题管理－空.png';
import ReleaseStore from '../../../../../stores/project/release/ReleaseStore';

const Option = Select.Option;
const { AppState } = stores;

@observer
class ReleaseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colors: [],
      type: '经办人',
      value: 'assignee',
    };
  }

  componentDidMount() {
    VersionReportStore.getPieDatas(AppState.currentMenuType.id, 'assignee');
  }

  // getRich = () => {
  //   const data = VersionReportStore.getPieData;
  //   const rich = {
  //     border: {
  //       width: 18,
  //       height: 18,
  //       borderRadius: 18,
  //     },
  //   };
  //   if (data.length) {
  //     data.map((item, index) => {
  //       // if (item.jsonObject && item.jsonObject.assigneeImageUrl === 'null') {
  //       //   rich[index] = {
  //       //     // width: 18,
  //       //     height: 18,
  //       //     borderRadius: 18,
  //       //     backgroundColor: {
  //       //       image: item.jsonObject.assigneeImageUrl,
  //       //     },
  //       //
  //       //   };
  //       // } else if (item.jsonObject && !item.jsonObject.assigneeImageUrl) {
  //       if (item.jsonObject) {
  //         rich[index] = {
  //           width: 18,
  //           height: 18,
  //           borderRadius: 18,
  //           borderWidth: 1,
  //           align: 'center',
  //           backgroundColor: '#c5cbe8',
  //           color: '#3f51b5',
  //         };
  //       }

  //       return rich;
  //     });
  //   }

  //   return rich;
  // };
  // 定义一个函数
  compare(pro) { 
    return function (obj1, obj2) { 
      const val1 = obj1[pro]; 
      const val2 = obj2[pro]; 
      if (val1 < val2) { 
        return 1; 
      } else if (val1 > val2) { 
        return -1; 
      } else { 
        return 0; 
      } 
    }; 
  } 

  getDataName() {
    const datas = VersionReportStore.pieData;
    const smallData = VersionReportStore.getSmallData;
    smallData.sort(this.compare('percent'));
    const objSmallData = {
      percent: [],
      name: [],
      // percent: '20%',
      // name: 'lwf',
    };
    for (let i = 0; i < smallData.length; i++) {
      objSmallData.percent.push(`{dataPercent|${smallData[i].percent}%}`);
      objSmallData.name.push(`{dataName|${smallData[i].name}}`);
    }
    return objSmallData;
  }

  getFirstName = (str) => {
    if (!str) {
      return '';
    }
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return str[0].toUpperCase();
  };

  getOption() {
    const colors = VersionReportStore.colors;
    const datas = VersionReportStore.pieData;
    return {
      // title : {
      //   text: '某站点用户访问来源',
      //   subtext: '统计图',
      //   x:'center'
      // },
      // color:['#9665E2','#F7667F','#FAD352', '#45A3FC','#56CA77'],
      color: colors,
      tooltip: {
        trigger: 'item',
        // formatter: '问题: {c} {a} <br/>{b} : {d}%',
        formatter: value => (
          `<div>
              <span>问题：${value.data.value}</span><br/>
              <span>百分比：${(value.data.percent.toFixed(2))}%</span>
            </div>`
        ),
        padding: 10,
        textStyle: {
          color: '#000',
          fontSize: 12,
          lineHeight: 20,
        },
        extraCssText: 'background: #FFFFFF;\n'
        + 'border: 1px solid #DDDDDD;\n'
        + 'box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20);\n'
        + 'border-radius: 0',
      },
      series: [
        {
          name: '',
          type: 'pie',
          // radius: '55%',
          // hoverAnimation: false,
          startAngle: 220,
          center: ['50%', '50%'],
          data: datas,
          // labelLine: {
          //   length: 100,
          //   length2: 200,
          // },
          label: {
            fontSize: '13px',
            color: 'rgba(0,0,0,0.65)',
            position: 'outside',

            formatter: (value) => {
              if (value.data.name === null) {
                return '未分配';
              } 
              if (value.data.name === '其它') {
                return [
                  '{title|其它}',
                  `${this.getDataName().percent.join('')}`,
                  `${this.getDataName().name.join('')}`,
                ].join('\n');
              }
              // else {
              //   // if (this.state.type === '经办人' && value.data.jsonObject.assigneeImageUrl) {
              //   //   return `{${value.dataIndex}|}${value.data.name}`;
              //   // } else if (this.state.type === '经办人' && !value.data.jsonObject.assigneeImageUrl) {
              //   if (this.state.type === '经办人') {
              //     // return `{${value.dataIndex}|${this.getFirstName(value.data.name)}}${value.data.name}`;
              //     return value.data.name;
              //   } else {
              //     return value.data.name;
              //   }
              // }
            },
            // rich: this.state.type === '经办人' ? this.getRich() : {},
            rich: {
              title: {
                fontSize: '13px',
                color: 'rgba(0,0,0,0.65)',
              },
              dataPercent: {
                fontSize: '13px',
                color: 'rgba(0,0,0,0.65)',
                padding: [5, 10],
                align: 'center',
                backgroundColor: 'rgba(250,211,82,0.90)',
              },
              dataName: {
                fontSize: '13px',
                color: 'rgba(0,0,0,0.65)',
                padding: [5, 10],
                align: 'center',
              },
            },
          },
          itemStyle: {
            normal: {
              // borderRadius: 18,
              borderWidth: 2,
              borderColor: '#ffffff',
            },
            // color: (data) => {
            //   return this.state.colors[data.dataIndex];
            // }
          },

        },
      ],
    };
  }

  handelRefresh = () => {
    VersionReportStore.getPieDatas(AppState.currentMenuType.id, this.state.value);
  };

  changeType =(value, option) => {
    // VersionReportStore.setPieData([]);
    this.setState({ type: option.key, value });
    VersionReportStore.getPieDatas(AppState.currentMenuType.id, value);
    VersionReportStore.setOtherDataEmpty();
  };

  render() {
    const data = VersionReportStore.getPieData;
    const sourceData = VersionReportStore.getSourceData;
    let total = 0;
    for (let i = 0; i < data.length; i += 1) {
      total += data[i].value;
    }
    const colors = VersionReportStore.colors;
    const urlParams = AppState.currentMenuType;
    const type = [
      { title: '经办人', value: 'assignee' },
      { title: '模块', value: 'component' },
      { title: '问题类型', value: 'typeCode' },
      { title: '修复版本', value: 'version' },
      { title: '优先级', value: 'priorityCode' },
      { title: '状态', value: 'statusCode' },
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
          <SwitchChart
            history={this.props.history}
            current="pieReport"
          />
          <Button onClick={this.handelRefresh}>
            <Icon type="refresh" />

刷新
</Button>
        </Header>
        <Content
          title={data.length ? `项目"${AppState.currentMenuType.name}"下的问题统计图` : '无问题的统计图'}
          description="根据指定字段以统计图呈现项目或筛选器下的问题，这可以使您一目了然地了解问题详情。"
        >
          <Spin spinning={VersionReportStore.pieLoading}>
            {data.length ? (
              <React.Fragment>
                <Select
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  defaultValue="assignee"
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
                <div style={{
                  marginTop: 30, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', 
                }}
                >
                  <ReactEchartsCore
                    ref={(pie) => { this.pie = pie; }}
                    style={{ width: '58%', height: 500 }}
                    echarts={echarts}
                    option={this.getOption()}
                  />
                  <div className="pie-title">
                    <p className="pie-legend-title">数据统计</p>
                    <table>
                      <thead>
                        <tr>
                          <td style={{ width: '158px' }}>{this.state.type}</td>
                          <td style={{ width: '62px' }}>问题</td>
                          <td style={{ paddingRight: 35 }}>百分比</td>
                        </tr>
                      </thead>
                    </table>
                    <table className="pie-legend-tbody">
                      {
                        sourceData.map((item, index) => (
                          <tr>
                            <td style={{ width: '158px' }}>
                              <div className="pie-legend-icon" style={{ background: colors[index] }} />
                              <Tooltip title={item && item.name}>
                                <div className="pie-legend-text">{item.name ? item.name : '未分配'}</div>
                              </Tooltip>
                            </td>
                            <td style={{ width: '62px' }}>
                              <a
                                role="none"
                                onClick={() => {
                                  console.log('this.state.value');
                                  this.props.history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramType=${this.state.value}&paramId=${item.typeName === null ? '0' : item.typeName}&paramName=${item.name === null ? '未分配' : item.name}下的问题&paramUrl=reporthost/piechart`);
                                }}
                              >
                                {item.value}
      
                              </a>
      
                            </td>
                            <td style={{ width: '62px', paddingRight: 15 }}>{`${(item.percent).toFixed(2)} %`}</td>
                          </tr>
                        ))
                      }
                    </table>        
                  </div>
                </div>
              </React.Fragment>
            ) : <NoDataComponent title="问题" links={[{ name: '问题管理', link: '/agile/issue' }]} img={pic} /> }
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default ReleaseDetail;
