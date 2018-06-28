import React, { Component } from 'react';
import { Modal, Form, Input } from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';

const { Sidebar } = Modal;
const { TextArea } = Input;
const { AppState } = stores;
const FormItem = Form.Item;

class CreateLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
  }

  handleOk(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { name, inWard, outWard } = values;
      if (!err) {
        const obj = {
          linkName: name,
          inWard,
          outWard,
        };
        this.setState({
          loading: true,
        });
        axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_link_types`, obj)
          .then((res) => {
            this.setState({
              loading: false,
            });
            this.props.onOk();
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        className="c7n-component-component"
        title="创建问题链接"
        okText="创建"
        cancelText="取消"
        visible
        confirmLoading={this.state.loading}
        onOk={this.handleOk.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title={`在项目"${AppState.currentMenuType.name}"中创建问题链接`}
          description="请在下面输入模块名称、模块概要、负责人和默认经办人策略，创建新模版。"
        >
          <Form layout="vertical">
            <FormItem>
              {getFieldDecorator('name', { rules: [{ required: true }] })(
                <Input label="名称" maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('outWard', {})(
                <TextArea label="链出描述" autosize maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('inWard', {})(
                <TextArea label="链入描述" autosize maxLength={30} />,
              )}
            </FormItem>
          </Form>
          
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(CreateLink);
