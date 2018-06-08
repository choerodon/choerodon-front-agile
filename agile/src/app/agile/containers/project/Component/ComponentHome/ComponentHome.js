import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Table, Spin, Popover, Modal, Radio, Select, Tooltip, message, Icon } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import './ComponentHome.scss';
import '../../../main.scss';
import pic from '../../../../assets/image/模块管理－空.png';
import { loadComponents, deleteComponent } from '../../../../api/ComponentApi';
import CreateComponent from '../ComponentComponent/AddComponent';
import EditComponent from '../ComponentComponent/EditComponent';
import EmptyBlock from '../../../../components/EmptyBlock';

const confirm = Modal.confirm;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { AppState } = stores;

@observer
class ComponentHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      components: [],
      component: {},
      currentComponentId: undefined,
      radio: 1,
      relatedComponentId: undefined,
      originComponents: [],
      loading: false,
      confirmShow: false,
      editComponentShow: false,
      createComponentShow: false,
    };
  }

  componentDidMount() {
    this.loadComponents();
  }

  onRadioChange = (e) => {
    this.setState({
      radio: e.target.value,
    });
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
      relatedComponentId: undefined,
      radio: 1,
    });
  }

  deleteComponent() {
    let relatedComponentId;
    if (this.state.radio === 1) {
      relatedComponentId = 0;
    } else if (!this.state.relatedComponentId) {
      message.warning('请选择关联的模块');
      return;
    } else {
      relatedComponentId = this.state.relatedComponentId;
    }
    deleteComponent(this.state.component.componentId, relatedComponentId)
      .then((res) => {
        this.setState({
          confirmShow: false,
        });
        this.loadComponents();
      });
  }

  handleRelatedComponentChange = (value) => {
    this.setState({ relatedComponentId: value });
  }

  loadComponents() {
    this.setState({
      loading: true,
    });
    loadComponents()
      .then((res) => {
        this.setState({
          components: res,
          loading: false,
        });
      });
  }

  renderDelete() {
    const radioStyle = {
      display: 'block',
      height: '20px',
      lineHeight: '20px',
      fontSize: '12px',
    };
    return (
      <div style={{ margin: '0 0 32px 20px' }}>
        <RadioGroup label="" onChange={this.onRadioChange} value={this.state.radio}>
          <Radio style={radioStyle} value={1}>不关联到别的模块</Radio>
          <Radio style={radioStyle} value={2}>
            <span>关联到其他模块</span>
            <Select
              disabled={this.state.radio !== 2}
              style={{ width: 300, marginLeft: 18 }}
              value={this.state.relatedComponentId}
              onChange={this.handleRelatedComponentChange.bind(this)}
              onFocus={() => {
                loadComponents(this.state.component.componentId).then((res) => {
                  this.setState({
                    originComponents: res,
                  });
                });
              }}
            >
              {this.state.originComponents.map(component => (
                <Option key={component.componentId} value={component.componentId}>
                  {component.name}
                </Option>),
              )}
            </Select>
          </Radio>
        </RadioGroup>
      </div>
    );
  }

  render() {
    const column = [
      {
        title: '模块',
        dataIndex: 'name',
        width: '20%',
        render: name => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={name}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {name}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '问题',
        dataIndex: 'issueCount',
        width: '10%',
        render: issueCount => (
          <div style={{ width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{issueCount}</span>
            <span>issues</span>
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
              {
                managerId && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        marginRight: 5,
                        textAlign: 'center',
                        lineHeight: '18px',
                        background: '#c5cbe8',
                        color: '#6473c3',
                        flexShrink: 0,
                      }}
                    >
                      {record.managerId && record.managerName ? record.managerName.slice(0, 1) : ''}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.managerId ? `${record.managerName}` : ''}
                    </span>
                  </div>
                )
              }
            </Tooltip>
          </div>
        ),
      },
      {
        title: '模块描述',
        dataIndex: 'description',
        width: '30%',
        render: description => (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <Tooltip placement="topLeft" mouseEnterDelay={0.5} title={description}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}>
                {description}
              </p>
            </Tooltip>
          </div>
        ),
      },
      {
        title: '默认经办人',
        dataIndex: 'defaultAssigneeRole',
        width: '15%',
      },
      {
        title: '',
        dataIndex: 'componentId',
        width: '10%',
        render: (componentId, record) => (
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
      <Page
        className="c7n-component"
      >
        <Header title="模块管理">
          <Button funcTyp="flat" onClick={() => this.setState({ createComponentShow: true })}>
            <Icon type="playlist_add icon" />
            <span>创建模块</span>
          </Button>
          <Button funcTyp="flat" onClick={() => this.loadComponents()}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title={`项目"${AppState.currentMenuType.name}"的模块管理`}
          description="根据项目需求，可以分拆为多个模块，每个模块可以进行负责人划分，配置后可以将项目中的问题归类到对应的模块中。例如“后端任务”，“基础架构”等等。"
        >
          <Spin spinning={this.state.loading}>
            {
              this.state.components.length === 0 && !this.state.loading ? (
                <EmptyBlock
                  style={{ marginTop: 50 }}
                  border
                  pic={pic}
                  title="您尚未添加任何组件到此项目"
                  des="组成部分是一个项目的分节。在一个项目内用它们把问题分成较小部分的组。"
                />
              ) : (
                <Table
                  columns={column}
                  dataSource={this.state.components}
                  scroll={{ x: true }}
                />
              )
            }
          </Spin>
          {
            this.state.createComponentShow ? (
              <CreateComponent 
                visible={this.state.createComponentShow}
                onCancel={() => this.setState({ createComponentShow: false })}
                onOk={() => {
                  this.loadComponents();
                  this.setState({
                    createComponentShow: false,
                  });
                }}
              />
            ) : null
          }
          {
            this.state.editComponentShow ? (
              <EditComponent
                componentId={this.state.currentComponentId}
                visible={this.state.editComponentShow}
                onCancel={() => this.setState({ editComponentShow: false })}
                onOk={() => {
                  this.loadComponents();
                  this.setState({
                    editComponentShow: false,
                  });
                }}
              />
            ) : null
          }
          {
            this.state.confirmShow && (
              <Modal
                width={600}
                title={`删除模块：${this.state.component.name}`}
                visible={this.state.confirmShow}
                onOk={this.deleteComponent.bind(this)}
                onCancel={() => this.setState({ confirmShow: false })}
                okText="删除"
                okType="danger"
              >
                <div style={{ margin: '20px 0', position: 'relative' }}>
                  <Icon style={{ color: '#d50000', position: 'absolute', fontSize: '16px' }} type="error" />
                  <div style={{ marginLeft: 20, width: 400 }}>
                    有问题关联到这个模块，而且这个项目中已经没有其他模块可供关联 这个模块将会从所有问题中移除。
                  </div>
                </div>
                <ul style={{ margin: '20px 0 20px 20px', paddingLeft: '20px' }}>
                  <li>
                    <span style={{ color: '#303f9f' }}>相关的问题（{this.state.component.issueCount}）</span>
                  </li>
                </ul>
                {
                  this.state.component.issueCount ? (
                    <div>
                      {this.renderDelete()}
                    </div>
                  ) : null
                }
              </Modal>
            )
          }
        </Content>
      </Page>
    );
  }
}

export default ComponentHome;
