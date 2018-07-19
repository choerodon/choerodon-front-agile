import React, { Component } from 'react';
import { Modal, Radio, Select, message, Icon } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import { getUsers } from '../../../../api/CommonApi';
import { createComponent } from '../../../../api/ComponentApi';
import { loadComponents, deleteComponent } from '../../../../api/ComponentApi';
import './component.scss';

const confirm = Modal.confirm;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { AppState } = stores;

class DeleteComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      component: {},
      radio: 1,
      relatedComponentId: undefined,
      originComponents: [],
      loading: false,
      confirmShow: false,
    };
  }

  componentDidMount() {
    this.init();
  }

  onRadioChange = (e) => {
    this.setState({
      radio: e.target.value,
    });
  }

  init() {
    this.setState({
      component: this.props.component || {},
      radio: 1,
      relatedComponentId: undefined,
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
    this.setState({
      loading: true,
    });
    deleteComponent(this.state.component.componentId, relatedComponentId)
      .then((res) => {
        this.setState({
          loading: false,
        });
        this.props.onOk();
      })
      .catch((error) => {
        this.setState({
          loading: false,
        });
      });
  }

  handleRelatedComponentChange = (value) => {
    this.setState({ relatedComponentId: value });
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
    const menu = AppState.currentMenuType;
    const urlParams = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return (
      <Modal
        width={600}
        title={`删除模块：${this.state.component.name}`}
        visible={this.props.visible || false}
        confirmLoading={this.state.loading}
        onOk={this.deleteComponent.bind(this)}
        onCancel={this.props.onCancel.bind(this)}
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
            <span
              style={{ color: '#303f9f', cursor: 'pointer' }}
              role="none"
              onClick={() => {
                this.props.history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramType=component&paramId=${this.state.component.componentId}&paramName=${this.state.component.name}&paramUrl=component`);
              }}
            >
              相关的问题（{this.state.component.issueCount}）
            </span>
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
    );
  }
}

export default DeleteComponent;
