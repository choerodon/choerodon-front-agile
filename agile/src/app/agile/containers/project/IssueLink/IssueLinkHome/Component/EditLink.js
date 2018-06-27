import React, { Component } from 'react';
import { Modal, Form, Input } from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';

const { Sidebar } = Modal;
const { TextArea } = Input;
const { AppState } = stores;
const FormItem = Form.Item;

class EditLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linkType: {},
      loading: false,
    };
  }

  componentDidMount() {
    window.console.log('edit link');
    const linkTypeId = this.props.linkTypeId;
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_link_types/${linkTypeId}`)
      .then((res) => {
        this.setState({
          linkType: res,
        });
      });
  }

  handleOk(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { name, inWard, outWard } = values;
      if (!err) {
        const obj = {
          ...this.state.linkType,
          linkName: name,
          inWard,
          outWard,
        };
        this.setState({
          loading: true,
        });
        axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_link_types`, obj)
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
        title="修改问题链接"
        okText="修改"
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
          title={`在项目"${AppState.currentMenuType.name}"中修改问题链接`}
          description="请在下面输入模块名称、模块概要、负责人和默认经办人策略，创建新模版。"
        >
          <Form layout="vertical">
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: '名称为必输项',
                }],
                initialValue: this.state.linkType.linkName,
              })(
                <Input label="名称" maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('outWard', {
                rules: [{
                  required: true,
                  message: '链出描述为必输项',
                }],
                initialValue: this.state.linkType.outWard,
              })(
                <TextArea label="链出描述" autosize maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('inWard', {
                rules: [{
                  required: true,
                  message: '链入描述为必输项',
                }],
                initialValue: this.state.linkType.inWard,
              })(
                <TextArea label="链入描述" autosize maxLength={30} />,
              )}
            </FormItem>
          </Form>
          
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(EditLink);
