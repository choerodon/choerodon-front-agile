import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Modal, Form, Input, Checkbox } from 'choerodon-ui';

import './CopyIssue.scss';

const { AppState } = stores;
const FormItem = Form.Item;

class CopyIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
  }

  handleCopyIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const projectId = AppState.currentMenuType.id;
        const { visible, onCancel, onOk, issueId, issueNum, issueSummary } = this.props; 
        window.console.log(values);
        this.setState({
          loading: true,
        });
        axios.post(`/agile/v1/projects/${projectId}/issues/${issueId}/copy_issue?summary=${values.issueSummary}`)
          .then((res) => {
            this.setState({
              loading: false,
            });
            this.props.onOk();
          });
      }
    });
  };

  render() {
    const { visible, onCancel, onOk, issueId, issueNum, issueSummary } = this.props;
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
        confirmLoading={this.state.loading}
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
          <FormItem>
            {getFieldDecorator('copySubIssue', {})(
              <Checkbox>
                是否复制子任务
              </Checkbox>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
export default Form.create({})(withRouter(CopyIssue));
