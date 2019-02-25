import React, { Component } from 'react';
import {
  Modal, Radio, Select, message, Icon, 
} from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';

const confirm = Modal.confirm;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { AppState } = stores;

class DeleteLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      link: {},
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
      link: this.props.link || {},
      radio: 1,
      relatedComponentId: undefined,
    });
    axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_link_types/query_all?issueLinkTypeId=${this.props.link.linkTypeId}`, {
      contents: [],
      linkName: '',
    })
      .then((res) => {
        this.setState({
          originComponents: res.content,
        });
      });
  }

  deleteComponent() {
    let relatedComponentId;
    if (this.state.radio === 1) {
      relatedComponentId = 0;
    } else if (!this.state.relatedComponentId) {
      message.warning('请选择关联的链接');
      return;
    } else {
      relatedComponentId = this.state.relatedComponentId;
    }
    this.setState({
      loading: true,
    });
    let url;
    if (relatedComponentId) {
      url = `/agile/v1/projects/${AppState.currentMenuType.id}/issue_link_types/${this.state.link.linkTypeId}?toIssueLinkTypeId=${relatedComponentId}`;
    } else {
      url = `/agile/v1/projects/${AppState.currentMenuType.id}/issue_link_types/${this.state.link.linkTypeId}`;
    }
    axios.delete(url)
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
          <Radio style={radioStyle} value={1}>不关联到别的链接</Radio>
          <Radio style={radioStyle} value={2}>
            <span>关联到其他链接</span>
            <Select
              disabled={this.state.radio !== 2}
              style={{ width: 300, marginLeft: 18 }}
              value={this.state.relatedComponentId}
              onChange={this.handleRelatedComponentChange.bind(this)}
            >
              {this.state.originComponents.map(component => (
                <Option key={component.linkTypeId} value={component.linkTypeId}>
                  {component.linkName}
                </Option>
              ))}
            </Select>
          </Radio>
        </RadioGroup>
      </div>
    );
  }

  render() {
    return (
      <Modal
        width={600}
        title={`删除链接：${this.state.link.linkName}`}
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







            删除后相关联的任务都会消失，是否要直接删除或者更换。
</div>
        </div>
        {this.renderDelete()}
      </Modal>
    );
  }
}

export default DeleteLink;
