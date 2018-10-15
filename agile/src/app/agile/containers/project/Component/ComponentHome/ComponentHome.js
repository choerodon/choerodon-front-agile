import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Button, Table, Spin, Popover, Tooltip, Icon, 
} from 'choerodon-ui';
import {
  Page, Header, Content, stores, Permission, 
} from 'choerodon-front-boot';
import './ComponentHome.scss';
import pic from '../../../../assets/image/模块管理－空.png';
import { loadComponents } from '../../../../api/ComponentApi';
import CreateComponent from '../ComponentComponent/AddComponent';
import EditComponent from '../ComponentComponent/EditComponent';
import DeleteComponent from '../ComponentComponent/DeleteComponent';
import EmptyBlock from '../../../../components/EmptyBlock';
import UserHead from '../../../../components/UserHead';

const { AppState } = stores;

@observer
class ComponentHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      components: [],
      component: {},
      currentComponentId: undefined,
      loading: false,
      confirmShow: false,
      editComponentShow: false,
      createComponentShow: false,
      filters: {
        searchArgs: {},
        advancedSearchArgs: {
          defaultAssigneeRole: [],
          content: '',
        },
      },
    };
  }

  componentDidMount() {
    this.loadComponents(this.state.filters);
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
      filters: {
        advancedSearchArgs: {},
        searchArgs: {},
        content: '',
      },
    });
  }

  deleteComponent() {
    this.setState({
      confirmShow: false,
    });
    this.loadComponents(this.state.filters);
  }

  loadComponents(filters) {
    this.setState({
      loading: true,
    });
    loadComponents(filters)
      .then((res) => {
        this.setState({
          components: res.content,
          loading: false,
        });
      })
      .catch((error) => {});
  }

  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    // console.log(`filters: ${JSON.stringify(filters)}`);
    // console.log(`barFilters: ${JSON.stringify(barFilters)}`);
    const searchArgs = {};
    if (filters && filters.name && filters.name.length > 0) {
      searchArgs.name = filters.name[0];
    }
    if (filters && filters.description && filters.description.length > 0) {
      searchArgs.description = filters.description[0];
    }
    if (filters && filters.managerId && filters.managerId.length > 0) { 
      searchArgs.manager = filters.managerId[0];
    }
   
    const filtersPost = {
      advancedSearchArgs: {
        defaultAssigneeRole: filters && filters.defaultAssigneeRole && filters.defaultAssigneeRole.length > 0 ? filters.defaultAssigneeRole : [],
      },
      searchArgs,
      content: barFilters && barFilters.length > 0 ? barFilters.join('%') : '',
    };
    this.setState({
      filters: filtersPost,
    });
    this.loadComponents(filtersPost);
  }

  render() {
    const menu = AppState.currentMenuType;
    const urlParams = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    const column = [
      {
        title: '模块',
        dataIndex: 'name',
        width: '20%',
        render: name => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={name}>
              <p
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 0,
                }}
              >
                {name}
              </p>
            </Tooltip>
          </div>
        ),
        filters: [],
      },
      {
        title: '问题',
        dataIndex: 'issueCount',
        width: '10%',
        render: (issueCount, record) => (
          <div
            style={{
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: '#3f51b5',
            }}
            role="none"
            onClick={() => {
              this.props.history.push(
                `/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${
                  urlParams.name
                }&organizationId=${urlParams.organizationId}&paramType=component&paramId=${
                  record.componentId
                }&paramName=模块"${record.name}"下的问题&paramUrl=component`,
              );
            }}
          >
            <span
              style={{
                display: 'inline-block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'left',
              }}
            >
              {issueCount || 0}
              {'issues'}
            </span>
            {/* <span>{issueCount}issues</span> */}
          </div>
        ),
      },
      {
        title: '负责人',
        dataIndex: 'managerId',
        width: '15%',
        render: (managerId, record) => (
          <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={record.managerName}>
              <div>
                <UserHead
                  user={{
                    id: record.managerId,
                    loginName: '',
                    realName: record.managerName,
                    avatar: record.imageUrl,
                  }}
                />
              </div>
            </Tooltip>
          </div>
        ),
        filters: [],
      },
      {
        title: '模块描述',
        dataIndex: 'description',
        width: '30%',
        render: description => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={description}>
              <p
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 0,
                }}
              >
                {description}
              </p>
            </Tooltip>
          </div>
        ),
        filters: [],
      },
      {
        title: '默认经办人',
        dataIndex: 'defaultAssigneeRole',
        width: '15%',
        filters: [
          {
            text: '无',
            value: '无',
          }, {
            text: '模块负责人',
            value: '模块负责人',
          },
        ],
        filterMultiple: true,
      },
      {
        title: '',
        dataIndex: 'componentId',
        width: '10%',
        render: (componentId, record) => (
          <div>
            <Permission
              type={type}
              projectId={projectId}
              organizationId={orgId}
              service={['agile-service.issue-component.updateComponent']}
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
                {/* <Button shape="circle" onClick={this.showComponent.bind(this, record)}> */}
                <Icon type="mode_edit" onClick={this.showComponent.bind(this, record)} />
                {/* </Button> */}
              </Popover>
            </Permission>
            <Permission
              type={type}
              projectId={projectId}
              organizationId={orgId}
              service={['agile-service.issue-component.deleteComponent']}
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
                {/* <Button shape="circle" onClick={this.clickDeleteComponent.bind(this, record)}> */}
                <Icon
                  type="delete_forever"
                  onClick={this.clickDeleteComponent.bind(this, record)}
                />
                {/* </Button> */}
              </Popover>
            </Permission>
          </div>
        ),
      },
    ];
    return (
      <Page
        className="c7n-component"
        service={[
          'agile-service.issue-component.updateComponent',
          'agile-service.issue-component.deleteComponent',
          'agile-service.issue-component.createComponent',
          'agile-service.issue-component.listByProjectId',
        ]}
      >
        <Header title="模块管理">
          <Permission
            type={type}
            projectId={projectId}
            organizationId={orgId}
            service={['agile-service.issue-component.createComponent']}
          >
            <Button funcType="flat" onClick={() => this.setState({ createComponentShow: true })}>
              <Icon type="playlist_add icon" />
              <span>创建模块</span>
            </Button>
          </Permission>
          <Button funcType="flat" onClick={() => this.loadComponents(this.state.filters)}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title={`项目“${AppState.currentMenuType.name}”的模块管理`}
          description="根据项目需求，可以分拆为多个模块，每个模块可以进行负责人划分，配置后可以将项目中的问题归类到对应的模块中。例如“后端任务”，“基础架构”等等。"
          link="http://v0-9.choerodon.io/zh/docs/user-guide/agile/component/"
        >
          {/* <Spin spinning={this.state.loading}>
            {this.state.components.length === 0 && !this.state.loading ? (
              <EmptyBlock
                style={{ marginTop: 50 }}
                border
                pic={pic}
                title="您尚未添加任何组件到此项目"
                des="组成部分是一个项目的分节。在一个项目内用它们把问题分成较小部分的组。"
              />
            ) : (
              <Table
                pagination={this.state.components.length > 10}
                columns={column}
                dataSource={this.state.components}
                scroll={{ x: true }}
                filterBarPlaceholder="过滤表"
                onChange={this.handleFilterChange}
              />
            )}
          </Spin> */}
          <Table
            pagination={this.state.components.length > 10}
            columns={column}
            dataSource={this.state.components}
            scroll={{ x: true }}
            filterBarPlaceholder="过滤表"
            onChange={this.handleFilterChange}
            loading={this.state.loading}
          />
          {this.state.createComponentShow ? (
            <CreateComponent
              visible={this.state.createComponentShow}
              onCancel={() => this.setState({ createComponentShow: false })}
              onOk={() => {
                this.loadComponents(this.state.filters);
                this.setState({
                  createComponentShow: false,
                });
              }}
            />
          ) : null}
          {this.state.editComponentShow ? (
            <EditComponent
              componentId={this.state.currentComponentId}
              visible={this.state.editComponentShow}
              onCancel={() => this.setState({ editComponentShow: false })}
              onOk={() => {
                this.loadComponents(this.state.filters);
                this.setState({
                  editComponentShow: false,
                });
              }}
            />
          ) : null}
          {this.state.confirmShow ? (
            <DeleteComponent
              visible={this.state.confirmShow}
              component={this.state.component}
              onCancel={() => this.setState({ confirmShow: false })}
              onOk={this.deleteComponent.bind(this)}
              history={this.props.history}
            />
          ) : null}
        </Content>
      </Page>
    );
  }
}

export default ComponentHome;
