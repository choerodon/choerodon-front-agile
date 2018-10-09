import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import {
  Page, Header, Content, stores, Permission, axios, 
} from 'choerodon-front-boot';
import {
  Button, Tabs, Table, Popover, Form, Icon, Spin, Avatar, Tooltip, Checkbox, Select,
} from 'choerodon-ui';
import './EditNotificationType.scss';

const { Option } = Select;
const { AppState } = stores;
const { 
  type, id, name, organizationId, 
} = AppState.currentMenuType;
@observer
class EditNotificationType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      currentProcessChecked: false,
      reportorChecked: true,
      projectMangerChecked: true,
      userChecked: false,
      roleChecked: false,
      userOptions: [],
      userOptionsLoading: false,
      roleOptions: [],
      roleOptionsLoading: false,
      dataSource: [
        {

        },
      ],


    };
  }

  componentDidMount() {
    const {
      userOptions, roleOptions, currentProcessChecked, reportorChecked, projectMangerChecked, userChecked, roleChecked, 
    } = this.state;
    this.setState({
      dataSource: [
        {
          key: 'currentProcess',
          checked: currentProcessChecked,
          typeName: '当前处理人',
        },
        {
          key: 'reportor',
          checked: reportorChecked,
          typeName: '报告人',
        },
        {
          key: 'projectManger',
          checked: projectMangerChecked,
          typeName: '项目管理员',
        },
        {
          key: 'user',
          checked: userChecked,
          typeName: '用户 (可多选)',
          selections: userOptions,
        },
        // {
        //   key: 'role',
        //   checked: roleChecked,
        //   typeName: '项目角色 (可多选)',
        //   selections: roleOptions,
        // },
      ],
    });
  }

  getColumns() {
    const {
      userOptions, roleOptions, userOptionsLoading, roleOptionsLoading, 
    } = this.state;
    const columns = [
      {
        dataIndex: 'checked',
        key: 'checked',
        render: (text, record, index) => {
          console.log(index, text);
          return (
            <Checkbox 
              style={{ marginTop: 5, marginBottom: 5 }}
              checked={text}
              onChange={this.handleCheckboxChange}
            />
          );
        },
        width: '5%',
      },
      {
        title: '通知类型',
        dataIndex: 'typeName',
        key: 'typeName',
        width: '30%',  
      },
      {
        dataIndex: 'selections',
        key: 'selections',
        render: (text, record, index) => (index > 2 ? (
          <Select
            style={{ width: 520 }}
                // onFocus={this.getUserOptions()}
            mode="multiple"
            label="请选择"
            optionFilterProp="children"
            loading={userOptionsLoading}
            filter
            allowClear
          >
            {
                    // userOptions && userOptions.map(item => (
                    //   <Option>{item}</Option>
                    // ))
                }
          </Select>
        ) : ''),
      },
    ];
    return columns;
  }

  getUserOptions() {
    // axios.get()
    //   .then((res) => {
    //     this.setState({
    //       userOptionsLoading: false,
    //       userOptions: res,
    //     });
    //   })
    //   .catch((error) => {
    //     this.setState({
    //       userOptionsLoading: false,
    //     });
    //     Choerodon.prompt('获取用户信息失败');
    //   });

    this.setState({
      userOptions: [
        'user1',
        'user2',
        'user3',
      ],
    });
  }

  getRoleOptions() {
    // axios.get()
    //   .then((res) => {
    //     this.setState({
    //       roleOptionsLoading: false,
    //       roleOptions: res,
    //     });
    //   })
    //   .catch((error) => {
    //     this.setState({
    //       roleOptionsLoading: false,
    //     });
    //     Choerodon.prompt('获取项目角色信息失败');
    //   });

    this.setState({
      roleOptions: [
        'role1',
        'role2',
        'role3',
      ],
    });
  }

  handleCheckboxChange = (e) => {

  }

  render() {
    const { dataSource, loading } = this.state;
    return (
      <Page>
        <Header
          title="编辑通知类型"
          backPath={`/agile/messageNotification?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`}
        />
        <Content 
          className="c7n-editNotificationType" 
        >
          <Table
            columns={this.getColumns()}
            dataSource={dataSource}
            filterBar={false}
            pagination={false}
            rowKey={record => record.key}
          />
          <div className="saveOrCancel">
            <Button type="primary" funcType="raised" style={{ marginRight: 10 }}>保存</Button>
            <Button 
              funcType="raised"
              onClick={() => {
                const { history } = this.props;
                history.push(`/agile/messageNotification?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`);
              }}
            >
              {'取消'}
            </Button>
          </div>
        </Content>
      </Page>
    );
  }
}

export default withRouter(EditNotificationType);
