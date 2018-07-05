import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Modal, Form, Input } from 'choerodon-ui';

import './CopyIssue.scss';

const { AppState } = stores;
const FormItem = Form.Item;

class CopyIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLoading: false,
    };
  }

  componentDidMount() {
  }

  handleCopyIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        window.console.log(values);
        // const extra = {
        // };
        // this.setState({ createLoading: true });
        // this.props.onOk(extra);
      }
    });
  };

  render() {
    const { visible, onCancel, onOk, issueNum, issueSummary } = this.props;
    const { getFieldDecorator } = this.props.form;
  
    return (
      <Modal
        className="c7n-copyIssue"
        title={`复制问题${issueNum}`}
        visible={visible || false}
        onOk={this.handleCopyIssue}
        onCancel={onCancel}
        okText="复制"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <Form layout="vertical">
          <FormItem>
            {getFieldDecorator('issueSummary', {
              rules: [{ required: true, message: '请输入概要' }],
              initialValue: issueSummary,
            })(
              <Input
                label="概要"
                prefix="CLONE - "
                maxLength={30}
              />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
export default Form.create({})(withRouter(CopyIssue));
