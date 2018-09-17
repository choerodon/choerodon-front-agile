import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import { stores, axios } from 'choerodon-front-boot';
import { Spin, Table } from 'choerodon-ui';
import EmptyBlockDashboard from '../../../../../components/EmptyBlockDashboard';
import pic from './no_issue.png';
import TypeTag from '../../../../../components/TypeTag';
import './IssueType.scss';

const { AppState } = stores;

class IssueType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      issueTypeInfo: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  getOption() {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          fontSize: 12,
          color: '#000',
        },
        extraCssText: 'box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20)',
      },
    
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            { value: 335, name: '直接访问' },
            { value: 310, name: '邮件营销' },
            { value: 234, name: '联盟广告' },
            { value: 135, name: '视频广告' },
            { value: 1548, name: '搜索引擎' },
          ],
        },
      ],
    };
    
    return option;
  }

  loadData = () => {
    const projectId = AppState.currentMenuType.id;
    this.setState({
      loading: true,
    });
    axios.get(`/agile/v1/projects/${projectId}/reports/pie_chart?fieldName=typeCode`)
      .then((res) => {
        this.setState({
          loading: false,
        });
        if (res && res.length) {
          this.setState({
            issueTypeInfo: res,
          });
        }
      });
  }
 
  renderContent() {
    const { loading, issueTypeInfo } = this.state;
    const columns = [
      {
        
        title: '问题类型',
        dataIndex: 'name',
        key: 'name',
        render: (name, record) => {
          <div>
            <TypeTag />
          </div>;
        },
      }, {
        title: '问题',
        dataIndex: 'value',
        key: 'value',
      }, {
        title: '百分比',
        dataIndex: 'percent',
        key: 'percent,',
      },
    ];
    // if (loading) {
    //   return (
    //     <div className="c7n-issueType-loading">
    //       <Spin />
    //     </div>
    //   );
    // }
    // if (!issueTypeInfo && !issueTypeInfo.length) {
    //   return (
    //     <div className="c7n-issueType-emptyBlock">
    //       <EmptyBlockDashboard
    //         pic={pic}
    //         ddes="没有问题"
    //       />
    //     </div>
    //   );
    // }
    return (
      <div className="c7n-issueType-chart">
        <ReactEcharts 
          style={{ height: 306 }}
          option={this.getOption()}
        />
        <div className="c7n-issueType-chart-legend">
          <table
            columns={columns}
            dataSource={issueTypeInfo}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="c7n-reportBoard-issueType">
        <div className="c7n-issueType-content">
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default IssueType;
