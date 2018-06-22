import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Table, Spin, Popover, Tooltip, Icon } from 'choerodon-ui';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import CreateLink from './CreateLink';

const { AppState } = stores;

@observer
class Link extends Component {
  constructor(props) {
    super(props);
    this.state = {
      links: [],
      createLinkShow: false,

      component: {},
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

  showComponent(record) {
    this.setState({
      editComponentShow: true,
      currentComponentId: record.componentId,
    });
  }

  clickDeleteComponent(record) {
    this.setState({
      component: record,
      confirmShow: true,
    });
  }

  deleteComponent() {
    this.setState({
      confirmShow: false,
    });
    this.loadComponents();
  }

  loadLinks() {
    this.setState({
      loading: true,
    });
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/issue_link_types`)
      .then((res) => {
        this.setState({
          links: res,
          loading: false,
        });
      })
      .catch((error) => {
        window.console.warn('load components failed, check your organization and project are correct, or please try again later');
      });
  }

  render() {
    const column = [
      {
        title: '名称',
        dataIndex: 'linkName',
        width: '25%',
        render: linkName => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={linkName}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
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
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
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
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
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
            <Popover placement="bottom" mouseEnterDelay={0.5} content={<div><span>详情</span></div>}>
              <Button shape="circle" onClick={this.showComponent.bind(this, record)}>
                <Icon type="mode_edit" />
              </Button>
            </Popover>
            <Popover placement="bottom" mouseEnterDelay={0.5} content={<div><span>删除</span></div>}>
              <Button shape="circle" onClick={this.clickDeleteComponent.bind(this, record)}>
                <Icon type="delete_forever" />
              </Button>
            </Popover>
          </div>
        ),
      },
    ];
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0 17px 0' }}>
          <Button type="primary" funcTyp="flat" onClick={() => this.setState({ createLinkShow: true })}>
            <Icon type="playlist_add icon" />
            <span>创建链接</span>
          </Button>
        </div>
        <Spin spinning={this.state.loading}>
          <Table
            columns={column}
            dataSource={this.state.links}
            scroll={{ x: true }}
          />
          
        </Spin>
        {
          this.state.createLinkShow ? (
            <CreateLink
              onOk={() => this.setState({ createLinkShow: false })}
              onCancel={() => this.setState({ createLinkShow: false })}
            />
          ) : null
        }
      </div>
    );
  }
}

export default Link;
