import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Button, Icon, Select, Tabs, Table } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import VersionReportStore from '../../../../../stores/project/versionReport/VersionReport';

const { AppState } = stores;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

@observer
class VersionReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chosenVersion: '',
      datas: [{
        status: 'done',
        page: 0,
        size: 10,
      }, {
        status: 'unfinished',
        page: 0,
        size: 10,
      }, {
        status: 'unfinishedUnestimated',
        page: 0,
        size: 10,
      }],
    };
  }
  componentWillMount() {
    VersionReportStore.axiosGetVersionList().then((res) => {
      VersionReportStore.setVersionList(res);
      this.setState({
        chosenVersion: String(res[0].versionId),
      }, () => {
        this.updateIssues(this.state.datas);
        this.getReportData();
      });
    }).catch((error) => {
      window.console.log(error);
    });
  }
  getReportData() {
    VersionReportStore.axiosGetReportData(this.state.chosenVersion).then((res) => {
      window.console.log(res);
    }).catch((error) => {
      window.console.log(error);
    });
  }
  updateIssues(data) {
    _.forEach(data, (item) => {
      VersionReportStore.axiosGetIssues(this.state.chosenVersion, item).then((res2) => {
        VersionReportStore.setIssues(item.status, 'data', res2.content);
        VersionReportStore.setIssues(item.status, 'pagination', {
          current: res2.number + 1,
          total: res2.totalElements,
          pageSize: res2.size,
        });
      }).catch((error2) => {
        window.console.log(error2);
      });
    });
  }
  renderTabTable(type) {
    const columns = [{
      title: '关键字',
      dataIndex: 'issueNum',
      key: 'issueNum',
    }, {
      title: '概要',
      dataIndex: 'summary',
      key: 'summary',
    }, {
      title: '问题类型',
      dataIndex: 'typeName',
      key: 'typeName',
    }, {
      title: '优先级',
      dataIndex: 'priorityName',
      key: 'priorityName',
    }, {
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
    }, {
      title: '故事点',
      dataIndex: 'storyPoints',
      key: 'storyPoints',
    }];
    window.console.log(VersionReportStore.getIssues[type].pagination);
    return (
      <Table
        dataSource={VersionReportStore.getIssues[type].data}
        columns={columns}
        pagination={VersionReportStore.getIssues[type].pagination}
        onChange={(pagination, filters, sorter) => {
          window.console.log(pagination);
          const data = _.clone(this.state.datas);
          let newIndex;
          _.forEach(data, (item, index) => {
            if (item.status === type) {
              newIndex = index;
              data[index].page = pagination.current - 1;
              data[index].size = pagination.pageSize;
            }
          });
          this.setState({
            datas: data,
          }, () => {
            this.updateIssues([this.state.datas[newIndex]]);
          });
        }}
      />
    );
  }
  render() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    return (
      <Page>
        <Header
          title="版本报告"
          backPath={`/agile/reporthost?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`}
        >
          <Button funcTyp="flat" onClick={() => { this.getData(); }}>
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content
          title="迭代冲刺“xxxx”的版本报告"
          description="跟踪对应的版本发布日期。这样有助于您监控此版本是否按时发布，以便工作滞后时能采取行动。"
          link="#"
        >
          <Select
            label="版本" 
            value={this.state.chosenVersion}
            style={{
              width: 512,
            }}
            onChange={(value) => {
              this.setState({
                chosenVersion: value,
              }, () => {
                this.updateIssues(this.state.datas);
              });
            }}
          >
            {
              VersionReportStore.getVersionList.map(item => (
                <Option value={String(item.versionId)}>{item.name}</Option>
              ))
            }
          </Select>
          <div className="c7n-versionReport-issues">
            <Tabs defaultActiveKey="1">
              <TabPane tab="已完成的问题" key="1">
                {this.renderTabTable('done')}
              </TabPane>
              <TabPane tab="未完成的问题" key="2">
                {this.renderTabTable('unfinished')}  
              </TabPane>
              <TabPane tab="未完成的未预估问题" key="3">
                {this.renderTabTable('unfinishedUnestimated')}
              </TabPane>
            </Tabs>
          </div>
        </Content>
      </Page>
    );
  }
}

export default VersionReport;
