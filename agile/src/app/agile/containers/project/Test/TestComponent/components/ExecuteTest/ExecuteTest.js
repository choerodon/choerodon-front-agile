import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Form, Input, Button, Modal, Icon, Tooltip, Radio } from 'choerodon-ui';
import UserHead from '../UserHead';
import { getUsers, getSelf } from '../../api/CommonApi';
import { loadVersions } from '../../api/IssueApi';

import './ExecuteTest.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class CreateTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectLoading: false,
      createLoading: false,
      versions: [],
      circles: [],
      users: [],
      userMine: {},
    };
  }

  componentDidMount() {
    getSelf().then((res) => {
      this.setState({
        userMine: res || {},
      });
    });
  }

  onChangeRadio = (e) => {
    const value = e.target.value;
    if (value === 'temp') {
      this.props.form.setFieldsValue({
        version: undefined,
        circle: undefined,
      }); 
    }
    if (value === 'mine') {
      this.props.form.setFieldsValue({
        other: undefined,
      }); 
    }
  }

  handleCreateIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ createLoading: true });
        const testCycleDTO = {
          assignedTo: values.other || this.state.userMine.id,
          cycleId: values.circle,
          issueId: this.props.issueId,
          lastRank: null,
        };
        this.handleSave(testCycleDTO);
      }
    });
  };

  handleSave = (testCycleDTO) => {
    this.setState({ createLoading: true });
    axios.post(`/test/v1/projects/${AppState.currentMenuType.id}/cycle/case/insert`, testCycleDTO)
      .then((res) => {
        this.setState({ createLoading: false });
        this.props.onOk();
      })
      .catch((error) => {
      });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk } = this.props;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <Sidebar
        className="c7n-createSubIssue"
        title="执行测试"
        visible
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="执行"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title="在测试“测试1”中执行测试"
          description="您可以为一个或多个成员分配一个或多个全局层的角色，即给成员授予全局层的权限。"
        >
          <Form layout="vertical">
            <FormItem label="执行方式" style={{ marginBottom: 0 }}>
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '默认经办人策略为必选项' }],
                initialValue: 'temp',
              })(
                <RadioGroup onChange={this.onChangeRadio}>
                  <Radio style={radioStyle} value={'temp'}>执行临时</Radio>
                  <Radio style={radioStyle} value={'add'}>添加到现有测试循环和执行</Radio>
                </RadioGroup>,
              )}
            </FormItem>
            <FormItem label="版本">
              {getFieldDecorator('version', {
                rules: [{
                  required: this.props.form.getFieldValue('type') === 'add',
                  message: '当执行方式为添加到现有测试循环和执行时，此项为必选项',
                }],
              })(
                <Select
                  label="版本"
                  disabled={this.props.form.getFieldValue('type') === 'temp'}
                  loading={this.state.selectLoading}
                  filter
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    loadVersions().then((res) => {
                      this.setState({
                        versions: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.versions.map(version =>
                    (<Option
                      key={version.versionId}
                      value={version.versionId}
                    >
                      {version.name}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
            <FormItem label="测试循环">
              {getFieldDecorator('circle', {
                rules: [{
                  required: this.props.form.getFieldValue('type') === 'add',
                  message: '当执行方式为添加到现有测试循环和执行时，此项为必选项',
                }],
              })(
                <Select
                  label="测试循环"
                  disabled={this.props.form.getFieldValue('type') === 'temp' || !this.props.form.getFieldValue('version')}
                  loading={this.state.selectLoading}
                  filter
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    axios.post(`/test/v1/projects/${AppState.currentMenuType.id}/cycle/query/cycle/versionId/${this.props.form.getFieldValue('version')}`).then((res) => {
                      this.setState({
                        circles: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.circles.map(circle =>
                    (<Option
                      key={circle.cycleId}
                      value={circle.cycleId}
                    >
                      {circle.cycleName}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
            <FormItem label="被指定人" style={{ marginBottom: 0 }}>
              {getFieldDecorator('assigneed', {
                initialValue: 'mine',
              })(
                <RadioGroup label="被指定人" onChange={this.onChangeRadio}>
                  <Radio style={radioStyle} value={'mine'}>我</Radio>
                  <Radio style={radioStyle} value={'other'}>其他人</Radio>
                </RadioGroup>,
              )}
            </FormItem>
            <FormItem label="其他人">
              {getFieldDecorator('other', {
                rules: [{
                  required: this.props.form.getFieldValue('assigneed') === 'other',
                  message: '当被指定人为其他时，此项为必选项',
                }],
              })(
                <Select
                  label="其他人"
                  disabled={this.props.form.getFieldValue('assigneed') === 'mine'}
                  loading={this.state.selectLoading}
                  filter
                  filterOption={false}
                  allowClear
                  onFilterChange={(input) => {
                    this.setState({
                      selectLoading: true,
                    });
                    getUsers(input).then((res) => {
                      this.setState({
                        users: res.content,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.users.map(user =>
                    (<Option key={user.id} value={user.id}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: 2 }}>
                        <UserHead
                          user={{
                            id: user.id,
                            loginName: user.loginName,
                            realName: user.realName,
                            avatar: user.imageUrl,
                          }}
                        />
                      </div>
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
export default Form.create({})(withRouter(CreateTest));
