import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Form, Input, Button, Modal, Icon, Tooltip } from 'choerodon-ui';

import './CreateTest.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;

class CreateTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLoading: false,
    };
  }

  componentDidMount() {
  }

  handleCreateIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { testStep, testData, expectedResult } = values;
        const { nextRank, issueId } = this.props;
        const testCaseStepDTO = {
          attachments: [],
          issueId: 7031,
          lastRank: null,
          nextRank,
          testStep,
          testData,
          expectedResult,
        };
        this.handleSave(testCaseStepDTO);
      }
    });
  };

  handleSave = (testCaseStepDTO) => {
    const projectId = AppState.currentMenuType.id;
    this.setState({ createLoading: true });
    axios.put(`/test/v1/projects/${projectId}/case/step/change`, testCaseStepDTO)
      .then((res) => {
        this.setState({ createLoading: false });
        this.props.onOk();
      });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk } = this.props;

    return (
      <Sidebar
        className="c7n-createTest"
        title="测试详细信息"
        visible
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <Content
          style={{
            paddingTop: 0,
            paddingLeft: 0,
            width: 512,
          }}
          title={`在项目"${AppState.currentMenuType.name}"中创建问题链接`}
          description="您可以为一个或多个成员分配一个或多个全局层的角色，即给成员授予全局层的权限。"
        >
          <Form layout="vertical">
            <FormItem label="测试步骤">
              {getFieldDecorator('testStep', {
                rules: [{ required: true, message: '测试步骤为必输项' }],
              })(
                <Input label="测试步骤" maxLength={30} />,
              )}
            </FormItem>
            <FormItem label="测试数据">
              {getFieldDecorator('testData', {
                rules: [{ required: true, message: '测试数据为必输项' }],
              })(
                <Input label="测试数据" maxLength={30} />,
              )}
            </FormItem>
            <FormItem label="预期结果">
              {getFieldDecorator('expectedResult', {
                rules: [{ required: true, message: '预期结果为必输项' }],
              })(
                <Input label="预期结果" maxLength={30} />,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(CreateTest));
