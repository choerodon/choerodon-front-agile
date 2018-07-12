import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, Table, Tooltip, Popover, Button, Icon } from 'choerodon-ui';
import { stores, Content, axios } from 'choerodon-front-boot';
import TimeAgo from 'timeago-react';

const { AppState } = stores;
const Sidebar = Modal.Sidebar;

class MergeRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mergeRequests: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.loadMergeRequest();
  }

  loadMergeRequest() {
    const { issueId } = this.props;
    this.setState({ loading: true });
    axios.get(`/devops/v1/project/${AppState.currentMenuType.id}/issue/${issueId}/merge_request/list`)
      .then((res) => {
        this.setState({
          mergeRequests: res,
          loading: false,
        });
      });
  }

  mergeRequest(record) {
    const projectId = AppState.currentMenuType.id;
    const { appId, id } = record;
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/url`)
      .then((res) => {
        const url = `${res}/merge_requests/${id}`;
        window.open(url, '_blank');
      })
      .catch((error) => {
        window.console.error('get gitlab url failed');
      });
  }

  render() {
    const { issueId, issueNum, time, visible, onCancel } = this.props;
    const column = [
      {
        title: '编码',
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
        title: '名称',
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
        title: '状态',
        dataIndex: 'status',
        width: '30%',
        render: status => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={status}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {status}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '审查人',
        dataIndex: 'status',
        width: '30%',
        render: status => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={status}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {status}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '更新时间',
        dataIndex: 'status',
        width: '30%',
        render: status => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={status}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {status}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '',
        dataIndex: 'id',
        width: '15%',
        render: (id, record) => (
          <div>
            <Popover placement="bottom" mouseEnterDelay={0.5} content={<div><span>创建合并请求</span></div>}>
              <Button shape="circle" onClick={this.createMergeRequest.bind(this, record)}>
                <Icon type="mode_edit" />
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
            <span>{`${issueNum}: `}</span>
            <span>
              <TimeAgo
                datetime={time}
                locale={Choerodon.getMessage('zh_CN', 'en')}
              />
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
          title="查看的提交"
          description="采用Git flow工作流模式，自动创建分支模式所特有的流水线，持续交付过程中对feature、release、hotfix等分支进行管理。"
          link="#"
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
export default withRouter(MergeRequest);
