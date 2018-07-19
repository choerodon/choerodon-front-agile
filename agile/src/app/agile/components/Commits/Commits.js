import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, Table, Tooltip, Popover, Button, Icon } from 'choerodon-ui';
import { stores, Content, axios } from 'choerodon-front-boot';
import TimeAgo from 'timeago-react';

const { AppState } = stores;
const Sidebar = Modal.Sidebar;

class Commits extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commits: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.loadCommits();
  }

  loadCommits() {
    const { issueId } = this.props;
    this.setState({ loading: true });
    axios.get(`/devops/v1/project/${AppState.currentMenuType.id}/issue/${issueId}/commit/list`)
      .then((res) => {
        this.setState({
          commits: res,
          loading: false,
        });
      });
  }

  createMergeRequest(record) {
    const win = window.open('loadin');
    const projectId = AppState.currentMenuType.id;
    const { appId } = record;
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/url`)
      .then((res) => {
        const url = `${res}/merge_requests/new?change_branches=true&merge_request[source_branch]=${record.branchName}&merge_request[target_branch]=master`;
        // window.open(url, '_blank');
        win.location.href = url;
      })
      .catch((error) => {
      });
  }

  render() {
    const { issueId, issueNum, time, visible, onCancel } = this.props;
    const column = [
      {
        title: '应用名称',
        dataIndex: 'appName',
        width: '25%',
        render: appName => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={appName}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {appName}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '分支',
        dataIndex: 'branchName',
        width: '30%',
        render: branchName => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={branchName}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {branchName}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '提交数',
        dataIndex: 'appId',
        width: '15%',
        render: (appId, record) => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={status}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {record.commits.length}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: '20%',
        render: (status, record) => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Popover
              overlayStyle={{
                boxShadow: '0 5px 5px -3px rgba(0, 0, 0, 0), 0 8px 10px 1px rgba(0, 0, 0, 0), 0 3px 14px 2px rgba(0, 0, 0, 0)',
              }}
              content={(<div>
                {
                  record.mergeRequests && record.mergeRequests.length ? (
                    <ul>
                      {
                        record.mergeRequests.map(v => (
                          <li style={{ listStyleType: 'none' }}>
                            <span style={{ display: 'inline-block', width: 150 }}>{v.title}</span>
                            <span style={{ display: 'inline-block', width: 50 }}>{v.state === 'opened' ? '开放' : ''}</span>
                          </li>
                        ))
                      }
                    </ul>
                  ) : <div>暂无merge request</div>
                }
              </div>)}
            >
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                开放
              </p>
            </Popover>
          </div>
        ),
      },
      {
        title: '',
        dataIndex: 'id',
        width: '10%',
        render: (id, record) => (
          <div>
            <Popover placement="bottom" mouseEnterDelay={0.5} content={<div><span>创建合并请求</span></div>}>
              <Button shape="circle" onClick={this.createMergeRequest.bind(this, record)}>
                <Icon type="merge_request" />
              </Button>
            </Popover>
          </div>
        ),
      },
    ];
    return (
      <Sidebar
        className="c7n-commits"
        title={(
          <div>
            <span>{`${time ? 'issueNum : ' : 'issueNum'} `}</span>
            <span>
              {
                time ? (
                  <TimeAgo
                    datetime={time}
                    locale={Choerodon.getMessage('zh_CN', 'en')}
                  />
                ) : ''
              }
            </span>
          </div>
        )}
        visible={visible || false}
        okText="关闭"
        okCancel={false}
        onOk={onCancel}
      >
        <Content
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
          }}
          title="查看提交"
          description="采用Git flow工作流模式，自动创建分支模式所特有的流水线，持续交付过程中对feature、release、hotfix等分支进行管理。"
        >
          <Table
            filterBar={false}
            rowKey={record => record.id}
            columns={column}
            dataSource={this.state.commits}
            loading={this.state.loading}
          />
        </Content>
      </Sidebar>
    );
  }
}
export default withRouter(Commits);
