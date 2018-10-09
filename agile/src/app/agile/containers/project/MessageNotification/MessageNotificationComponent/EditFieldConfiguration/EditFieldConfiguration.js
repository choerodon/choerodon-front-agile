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
        notificationType: notificationTypes[0].createType,
      }, {
        key: 'distribution',
        event: '问题已被分配',
        notificationType: notificationTypes[1].distributionType,
      }, {
        key: 'solved',
        event: '问题已解决',
        notificationType: notificationTypes[2].solvedType,
      }],
    });
  }

  getColumn() {
    const columns = [
      {
        title: '事件',
        dataIndex: 'event',
        key: 'event',
        width: '30%',
      },
      {
        title: '通知类型',
        dataIndex: 'notificationType',
        key: 'notificationType',
        width: '62%',
        render: (record, text) => (record && record.length > 0 ? (
          <ul className="notificationTypeList">
            {
                record.map(item => (
                  <li>{item}</li>
                ))
             }
          </ul>
        ) : '-'),
      },
      {
        render: (record, text) => (
          <Icon 
            type="mode_edit"
            onClick={() => {
              const { history } = this.props;
              const { 
                type, id, name, organizationId, 
              } = AppState.currentMenuType;
              history.push(`/agile/messageNotification/editnotificationtype?type=${type}&id=${id}&name=${encodeURIComponent(name)}&organizationId=${organizationId}&event=${text.key}`);
            }}
          />
        ),
      },
    ];
    return columns;
  }

  render() {
    const { notificationTypes, loading, dataSource } = this.state;
    return (
      <Page>
        <Header
          title="消息通知"
        />
        <Content 
          className="c7n-editFieldConfiguration" 
        >
          <Table
            dataSource={dataSource}
            columns={this.getColumn()}
            // loading={loading}
            rowKey={record => record.key}
            pagination={false}
            filterBar={false}
          />
        </Content>
      </Page>
    );
  }
}

export default withRouter(EditFieldConfiguration);
