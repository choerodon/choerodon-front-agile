import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Button, Table, Spin, Popover, Tooltip, Icon, 
} from 'choerodon-ui';
import {
  Page, Header, Content, stores, axios, Permission, 
} from 'choerodon-front-boot';
import CreateLink from './Component/CreateLink';
import EditLink from './Component/EditLink';
import DeleteLink from './Component/DeleteLink';
import './IssueLinkHome.scss';

const { AppState } = stores;

@observer
class Link extends Component {
  constructor(props) {
    super(props);
    this.state = {
      links: [],
      createLinkShow: false,
      editLinkShow: false,
      currentLinkTypeId: undefined,

      link: {},
      currentComponentId: undefined,
      loading: false,
      confirmShow: false,
      editComponentShow: false,
      createComponentShow: false,
    };
  }

  componentDidMount() {
    this.loadLinks();
  }

  showLinkType(record) {
    this.setState({
      editLinkShow: true,
      currentLinkTypeId: record.linkTypeId,
    });
  }

  clickDeleteLink(record) {
    this.setState({
      link: record,
      confirmShow: true,
    });
  }

  deleteLink() {
    this.setState({
      confirmShow: false,
    });
    this.loadLinks();
  }

  loadLinks() {
    this.setState({
      loading: true,
    });
    axios
      .get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_link_types`)
      .then((res) => {
        this.setState({
          links: res,
          loading: false,
        });
      })
      .catch((error) => {});
  }

  render() {
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    const column = [
      {
        title: '名称',
        dataIndex: 'linkName',
        width: '25%',
        render: linkName => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={linkName}>
              <p
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 0,
                }}
              >
                {linkName}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '链出描述',
        dataIndex: 'outWard',
        width: '30%',
        render: outWard => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={outWard}>
              <p
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 0,
                }}
              >
                {outWard}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '链入描述',
        dataIndex: 'inWard',
        width: '30%',
        render: inWard => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={inWard}>
              <p
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 0,
                }}
              >
                {inWard}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '',
        dataIndex: 'linkTypeId',
        width: '15%',
        render: (linkTypeId, record) => (
          <div>
            <Permission
              type={type}
              projectId={projectId}
              organizationId={orgId}
              service={['agile-service.issue-link-type.updateIssueLinkType']}
            >
              <Popover
                placement="bottom"
                mouseEnterDelay={0.5}
                content={(
                  <div>
                    <span>详情</span>
                  </div>
)}
              >
                {/* <Button shape="circle" onClick={this.showLinkType.bind(this, record)}> */}
                <Icon type="mode_edit" onClick={this.showLinkType.bind(this, record)} />
                {/* </Button> */}
              </Popover>
            </Permission>
            <Permission
              type={type}
              projectId={projectId}
              organizationId={orgId}
              service={['agile-service.issue-link-type.deleteIssueLinkType']}
            >
              <Popover
                placement="bottom"
                mouseEnterDelay={0.5}
                content={(
                  <div>
                    <span>删除</span>
                  </div>
)}
              >
                {/* <Button shape="circle" onClick={this.clickDeleteLink.bind(this, record)}> */}
                <Icon type="delete_forever" onClick={this.clickDeleteLink.bind(this, record)} />
                {/* </Button> */}
              </Popover>
            </Permission>
          </div>
        ),
      },
    ];
    return (
      <Page
        service={[
          'agile-service.issue-link-type.updateIssueLinkType',
          'agile-service.issue-link-type.deleteIssueLinkType',
          'agile-service.issue-link-type.createIssueLinkType',
        ]}
        className="c7n-issue-link"
      >
        <Header title="问题链接">
          <Permission
            type={type}
            projectId={projectId}
            organizationId={orgId}
            service={['agile-service.issue-link-type.createIssueLinkType']}
          >
            <Button funcType="flat" onClick={() => this.setState({ createLinkShow: true })}>
              <Icon type="playlist_add icon" />
              <span>创建链接</span>
            </Button>
          </Permission>
          <Button funcType="flat" onClick={() => this.loadLinks()}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="问题链接"
          description="通过自定义问题链接，可以帮助您更好的对多个问题进行关联，不再局限于父子任务。"
          link="http://v0-8.choerodon.io/zh/docs/user-guide/agile/setup/issue-link/"
        >
          <div>
            <Spin spinning={this.state.loading}>
              <Table
                rowKey={record => record.linkTypeId}
                columns={column}
                dataSource={this.state.links}
                filterBarPlaceholder="过滤表"
                scroll={{ x: true }}
              />
            </Spin>
            {this.state.createLinkShow ? (
              <CreateLink
                onOk={() => {
                  this.setState({ createLinkShow: false });
                  this.loadLinks();
                }}
                onCancel={() => this.setState({ createLinkShow: false })}
              />
            ) : null}
            {this.state.editLinkShow ? (
              <EditLink
                linkTypeId={this.state.currentLinkTypeId}
                onOk={() => {
                  this.setState({ editLinkShow: false });
                  this.loadLinks();
                }}
                onCancel={() => this.setState({ editLinkShow: false })}
              />
            ) : null}
            {this.state.confirmShow ? (
              <DeleteLink
                visible={this.state.confirmShow}
                link={this.state.link}
                onCancel={() => this.setState({ confirmShow: false })}
                onOk={this.deleteLink.bind(this)}
              />
            ) : null}
          </div>
        </Content>
      </Page>
    );
  }
}

export default Link;
