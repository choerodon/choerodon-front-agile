import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, Icon, Tabs, Table, Spin, Modal } from 'choerodon-ui';
import StatusStore from '../../../../stores/project/status/StatusStore';
import AddStatus from '../../ScrumBoard/ScrumBoardSettingComponent/AddStatus/AddStatus';
import ScrumBoardStore from '../../../../stores/project/scrumBoard/ScrumBoardStore';

const { AppState } = stores;
const TabPane = Tabs.TabPane;
const { Sidebar } = Modal;

@observer
class StatusHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
      },
      loading: false,
      addStatus: false,
    };
  }
  componentWillMount() {
    this.refresh(this.state.pagination);
  }
  setBackground(record) {
    let result;
    if (record.categoryCode === 'todo') {
      result = 'rgb(74, 103, 133)';
    } else if (record.categoryCode === 'doing') {
      result = 'rgb(246, 195, 66)';
    } else {
      result = 'rgb(20, 136, 44)';
    }
    return result;
  }
  refresh(data) {
    this.setState({
      loading: true,
    });
    StatusStore.axiosGetStatusList(data).then((res) => {
      window.console.log(res);
      StatusStore.setStatusList(res.content);
      this.setState({
        pagination: {
          current: res.number + 1,
          total: res.totalElements,
          pageSize: 10,
        },
        loading: false,
      });
    }).catch((error) => {
      this.setState({
        loading: false,
      });
      window.console.log(error);
    });
  }
  handleChangeTable(pagination, filters, sorter) {
    const data = {
      current: pagination.current,
      total: this.state.pagination.total,
      pageSize: 10,
    };
    this.refresh(data);
  }
  render() {
    const column = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '类别',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 15,
              height: 15,
              background: this.setBackground(record),
              marginRight: 6,
              borderRadius: '2px',
            }}
          />
          {text}
        </div>
      ),
    }, {
      title: '问题数量',
      dataIndex: 'issueNumCount',
      key: 'issueNumCount',
    }, {
      title: '描述',
    }];
    return (
      <Page>
        <Header title="状态">
          <Button 
            funcTyp="flat" 
            onClick={() => { 
              this.setState({ addStatus: true });
              if (JSON.stringify(ScrumBoardStore.getStatusCategory) === '{}') {
                ScrumBoardStore.axiosGetStatusCategory().then((data) => {
                  ScrumBoardStore.setStatusCategory(data);
                }).catch((error) => {
                  window.console.log(error);
                });
              }
            }}
          >
            <Icon type="playlist_add icon" />创建状态
          </Button>
          <Button funcTyp="flat">
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content
          title="状态"
          description="根据项目需求，可以分拆为多个模块，每个模块可以进行负责人划分，配置后可以将项目中的问题归类到对应的模块中。例如“后端任务”，“基础架构”等等。"
          link="#"
        >
          <Spin spinning={this.state.loading}>
            <Table
              dataSource={StatusStore.getStatusList}
              columns={column}
              pagination={this.state.pagination}
              onChange={this.handleChangeTable.bind(this)}
            />
          </Spin>
          <AddStatus
            visible={this.state.addStatus}
            onChangeVisible={(data) => {
              this.setState({
                addStatus: data,
              });
            }}
            refresh={this.refresh.bind(this, this.state.pagination)}
            fromStatus
          />
        </Content>
      </Page>
    );
  }
}

export default StatusHome;

