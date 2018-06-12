import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Modal, Form, Input, Select, message } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import { getUsers } from '../../../../api/CommonApi';
import { loadComponent, updateComponent } from '../../../../api/ComponentApi';

const { Sidebar } = Modal;
const { TextArea } = Input;
const FormItem = Form.Item;
const { Option } = Select;
const { AppState } = stores;

@observer
class EditComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originUsers: [],
      selectLoading: false,
      createLoading: false,

      component: {},
      defaultAssigneeRole: undefined,
      description: undefined,
      managerId: undefined,
      name: undefined,
    };
  }

  componentDidMount() {
    this.loadComponent(this.props.componentId);
    this.loadUsers();
  }

  getFirst(str) {
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return '';
  }

  loadComponent(componentId) {
    loadComponent(componentId)
      .then((res) => {
        const { defaultAssigneeRole, description, managerId, name } = res;
        this.setState({
          defaultAssigneeRole,
          description,
          managerId,
          name,
          component: res,
        });
      });
  }

  loadUsers() {
    getUsers().then((res) => {
      this.setState({
        originUsers: res.content,
        selectLoading: false,
      });
    });
  }

  handleOk(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { defaultAssigneeRole, description, managerId, name } = values;
        const component = {
          objectVersionNumber: this.state.component.objectVersionNumber,
          componentId: this.state.component.componentId,
          defaultAssigneeRole,
          description,
          managerId,
          name,
        };
        this.setState({ createLoading: true });
        updateComponent(component.componentId, component)
          .then((res) => {
            this.setState({
              createLoading: false,
            });
            this.props.onOk();
          })
          .catch((error) => {
            this.setState({
              createLoading: false,
            });
            message.error('修改模块失败');
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        title="查看模块"
        visible={this.props.visible || false}
        onCancel={this.props.onCancel.bind(this)}
        onOk={this.handleOk.bind(this)}
        onText="修改"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title={`在项目"${AppState.currentMenuType.name}"中查看模块`}
          description="请在下面输入模块名称、模块概要、负责人和默认经办人策略，修改模版。"
        >
          <Form>
            <FormItem>
              {getFieldDecorator('name', {
                initialValue: this.state.name,
                rules: [{
                  required: true,
                  message: '模块名称必须',
                }],
              })(
                <Input label="模块名称" maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('managerId', {
                initialValue: this.state.managerId,
              })(
                <Select
                  label="负责人"
                  allowClear
                  filter
                  filterOption={(input, option) =>
                    option.props.children.props.children[1].props.children.toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0}
                  loading={this.state.selectLoading}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    this.loadUsers();
                  }}
                >
                  {this.state.originUsers.map(user =>
                    (<Option key={user.id} value={user.id}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                        <span
                          style={{ background: '#c5cbe8', color: '#6473c3', width: '20px', height: '20px', textAlign: 'center', lineHeight: '20px', borderRadius: '50%', marginRight: '8px' }}
                        >
                          {user.loginName ? this.getFirst(user.realName) : ''}
                        </span>
                        <span>{`${user.loginName} ${user.realName}`}</span>
                      </div>
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('description', {
                initialValue: this.state.description,
              })(
                <TextArea label="模块描述" autosize maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('defaultAssigneeRole', {
                initialValue: this.state.defaultAssigneeRole,
                rules: [{
                  required: true,
                  message: '默认经办人必须',
                }],
              })(
                <Select label="默认经办人">
                  {['模块负责人', '无'].map(defaultAssigneeRole =>
                    (<Option key={defaultAssigneeRole} value={defaultAssigneeRole}>
                      {defaultAssigneeRole}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(EditComponent);
