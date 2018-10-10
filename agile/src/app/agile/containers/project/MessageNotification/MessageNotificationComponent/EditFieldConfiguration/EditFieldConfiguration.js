import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import {
  Page, Header, Content, stores, Permission, axios,
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
      users: [[], [], []],
      dataSource: [],
    };
  }

  componentDidMount() {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/notice`)
      .then((res) => {
        const createType = [...(res.filter(item => item.event === 'issue_created' && item.enable === true).map(o => o.noticeName))];
        const distributionType = [...(res.filter(item => item.event === 'issue_assigneed' && item.enable === true).map(o => o.noticeName))];
        const solvedType = [...(res.filter(item => item.event === 'issue_solved' && item.enable === true).map(o => o.noticeName))];
        const createUser = res.filter(item => item.event === 'issue_created' && item.noticeName === '用户')[0];
        const distributionUser = res.filter(item => item.event === 'issue_assigneed' && item.noticeName === '用户')[0];
        const solvedUser = res.filter(item => item.event === 'issue_solved' && item.noticeName === '用户')[0];
        this.setState({
          loading: false,
          users: [
            createUser && createUser.user && createUser.user !== 'null' ? createUser.user.split('，') : [],
            distributionUser && distributionUser.user && distributionUser.user !== 'null' ? distributionUser.user.split('，') : [],
            solvedUser && solvedUser.user && solvedUser.user !== 'null' ? solvedUser.user.split('，') : [],
          ],
          dataSource: [{
            key: 'issue_created',
            event: '问题已创建',
            notificationType: createType,
          }, {
            key: 'issue_assigneed',
            event: '问题已被分配',
            notificationType: distributionType,
          }, {
            key: 'issue_solved',
            event: '问题已解决',
            notificationType: solvedType,
          }],
        });
      })
      .catch((error) => {
        this.setState({
          // roleOptionsLoading: false,
          loading: false,
        });
        Choerodon.prompt('获取信息失败');
      });
  }

  getColumn() {
    const { users } = this.state;
    // console.log(users);
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
        render: (text, record, index) => (
          (text && text.length > 0 ? (
            <ul className="notificationTypeList">
              {
                      text.map((item) => {
                        if (item !== '用户') {
                          return (
                            <li>{item}</li>
                          );
                        } else if (item === '用户') {
                          return (<li>{`用户: ${users && users.length && users[index].length > 0 ? users[index].join(', ') : '-'}`}</li>);
                          // return (<li>{`用户:${users && users.length && users[index].length > 0}`}</li>);
                        }
                      })
                   }
            </ul>
          ) : '-')
        )
        ,
      },
      {
        render: (text, record, index) => (
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
            rowKey={record => record.key}
            pagination={false}
            filterBar={false}
            loading={loading}
          />
        </Content>
      </Page>
    );
  }
}

export default withRouter(EditFieldConfiguration);
