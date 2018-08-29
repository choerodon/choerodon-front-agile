import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Modal, Form, Select, Icon, Input } from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

@observer
class CreateEpic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  handleCreateEpic =(e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        const data = {
          priorityCode: 'medium',
          projectId: AppState.currentMenuType.id,
          epicName: value.name,
          summary: value.summary,
          typeCode: 'issue_epic',
        };
        this.setState({
          loading: true,
        });
        axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issues`, data)
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
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        title="创建史诗"
        visible={this.props.visible}
        okText="新建"
        cancelText="取消"
        onCancel={() => {
          this.props.form.resetFields();
          this.props.onCancel();
        }}
        confirmLoading={this.state.loading}
        onOk={this.handleCreateEpic}
      >
        <Content
          style={{
            padding: 0,
          }}
          title={`创建项目“${AppState.currentMenuType.name}”的史诗`}
          description="请在下面输入史诗名称、概要，创建新史诗。"
          link="http://v0-9.choerodon.io/zh/docs/user-guide/agile/backlog/epic/"
        >
          <Form style={{ width: 512 }}>
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: '史诗名称不能为空',
                }],
              })(
                <Input label="史诗名称" maxLength={44} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('summary', {
                rules: [{
                  required: true,
                  message: '概要不能为空',
                }],
              })(
                <TextArea autosize label="概要" maxLength={44} />,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(CreateEpic);

