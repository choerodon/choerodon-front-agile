import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, Table, Tooltip, Popover, Button, Icon } from 'choerodon-ui';
import { stores, Content, axios } from 'choerodon-front-boot';
import TimeAgo from 'timeago-react';
import UserHead from '../UserHead';

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

  createMergeRequest(record) {
    const projectId = AppState.currentMenuType.id;
    const { applicationId, gitlabMergeRequestId } = record;
    axios.get(`/devops/v1/projects/${projectId}/apps/${applicationId}/git/url`)
      .then((res) => {
        const url = `${res}/merge_requests/${gitlabMergeRequestId}`;
        window.open(url, '_blank');
      })
      .catch((error) => {
        window.console.error('get gitlab url failed');
      });
  }

  render() {
    const { issueId, issueNum, num, visible, onCancel } = this.props;
    const column = [
      {
        title: '编码',
        dataIndex: 'id',
        width: '25%',
        render: id => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={id}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                # {id}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '名称',
        dataIndex: 'title',
        width: '25%',
        render: title => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={title}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {title}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '状态',
        dataIndex: 'state',
        width: '10%',
        render: state => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            {state === 'opened' ? '开放' : ''}            
          </div>
        ),
      },
      {
        title: '审查人',
        dataIndex: 'assigneeId',
        width: '15%',
        render: (assigneeId, record) => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <UserHead
              user={{
                id: assigneeId,
                realName: record.assigneeName,
                avatar: record.imageUrl,
              }}
            />
          </div>
        ),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: '15%',
        render: updatedAt => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <TimeAgo
              datetime={updatedAt}
              locale={Choerodon.getMessage('zh_CN', 'en')}
            />
          </div>
        ),
      },
      {
        title: '',
        dataIndex: 'gitlabMergeRequestId',
        width: '10%',
        render: (gitlabMergeRequestId, record) => (
          <div>
            <Popover placement="bottom" mouseEnterDelay={0.5} content={<div><span>合并请求</span></div>}>
              <Button shape="circle" onClick={this.createMergeRequest.bind(this, record)}>
                <Icon type="device_hub" />
              </Button>
            </Popover>
          </div>
        ),
      },
    ];
    return (
      <Sidebar
        className="c7n-commits"
        title={`${issueNum}: ${num} 合并请求`}
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
            dataSource={this.state.mergeRequests}
            loading={this.state.loading}
          />
        </Content>
      </Sidebar>
    );
  }
}
export default withRouter(MergeRequest);
