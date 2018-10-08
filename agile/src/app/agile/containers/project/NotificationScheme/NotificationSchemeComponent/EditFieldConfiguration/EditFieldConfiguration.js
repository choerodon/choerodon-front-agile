import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import {
  Page, Header, Content, stores, Permission, 
} from 'choerodon-front-boot';
import {
  Button, Tabs, Table, Popover, Form, Icon, Spin, Avatar, Tooltip, 
} from 'choerodon-ui';
import './EditFieldConfiguration.scss';

const { AppState } = stores;

@observer
class EditFieldConfiguration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      notificationTypes: [
        {
          createType: [
            '当前处理人',
            '报告人',
            '项目管理员',
            '用户:王嘉嘉-jiajia.wang@google.com，林大力-dali.lin@google.com，董冬冬-dongdong.dong@google.com',
            '用户角色:开发人员',
          ],
        },
        {
          distributionType: [
            '当前处理人',
            '报告人',
            '项目管理员',
          ],
        },
        {
          solvedType: [
  
          ],
        },
      ],
      dataSource: [],
    };
  }

  componentDidMount() {
    const { notificationTypes } = this.state;
    this.setState({
      dataSource: [{
        key: 'create',
        event: '问题已创建',
        notificationType: notificationTypes.createType,
      }, {
        key: 'distribution',
        event: '问题已被分配',
        notificationType: notificationTypes.distributionType,
      }, {
        key: 'solved',
        event: '问题已解决',
        notificationType: notificationTypes.solvedType,
      }],
    });
  }

  getColumn() {
    const columns = [
      {
        title: '事件',
        dataIndex: 'event',
        key: 'event',
      },
      {
        title: '通知类型',
        dataIndex: 'notificationType',
        key: 'notificationType',
        render: (record, text) => {
          console.log(record, text);
          return (record && record.length > 0 ? (
            <ul>
              {
                record.map(item => (
                  <li>{item}</li>
                ))
             }
            </ul>
          ) : '-');
        },
      },
    ];
    return columns;
  }

  render() {
    const { notificationTypes, loading, dataSource } = this.state;
    return (
      <Page>
        <Header
         title="编辑字段配置"
         des="测试新建通知方案"
       />
        <Content 
         className="c7n-editFieldConfiguration" 
         title="测试新建通知方案"
         description="测试新建通知方案描述描述描述描述描述描述描述描述描述描述描述描述描述"
       >
         <Table
           dataSource={dataSource}
           columns={this.getColumn()}
            // loading={loading}
           rowKey={record => record.key}
         />
       </Content>
      </Page>
    );
  }
}

export default withRouter(EditFieldConfiguration);
