import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Modal, Form, Select, Input } from 'choerodon-ui';
import { createLink, loadIssuesInLink, updateIssueType } from '../../api/NewIssueApi';
import TypeTag from '../TypeTag';

import './TransformSubIssue.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const { Option } = Select;

const NAME = {
  story: '故事',
  bug: '故障',
  task: '任务',
  issue_epic: '史诗',
};

class TransformSubIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLoading: false,
      selectLoading: true,

      originIssues: [],
      originStatus: [],
    };
  }

  componentDidMount() {
    this.getStatus();
  }

  getStatus() {
    this.setState({
      selectLoading: true,
    });
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/list`)
      .then((res) => {
        this.setState({
          selectLoading: false,
          originStatus: res,
        });
      });
  }

  setBackground(categoryCode) {
    let result;
    if (categoryCode === 'todo') {
      result = 'rgb(74, 103, 133)';
    } else if (categoryCode === 'doing') {
      result = 'rgb(246, 195, 66)';
    } else {
      result = 'rgb(20, 136, 44)';
    }
    return result;
  }

  handleTransformSubIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const projectId = AppState.currentMenuType.id;
        const { initValue, visible, onCancel, onOk, issueId, issueNum, ovn } = this.props;
        const typeCode = values.typeCode;
        const epicName = values.epicName;
        const issueupdateTypeDTO = {
          epicName: typeCode === 'issue_epic' ? epicName : undefined,
          issueId,
          objectVersionNumber: ovn,
          typeCode,
        };
        this.setState({
          loading: true,
        });
        updateIssueType(issueupdateTypeDTO)
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
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk, issueId, issueNum } = this.props;

    return (
      <Sidebar
        className="c7n-transformSubIssue"
        title="转化为问题"
        visible={visible || false}
        onOk={this.handleTransformSubIssue}
        onCancel={onCancel}
        okText="转化"
        cancelText="取消"
        confirmLoading={this.state.loading}
      >
        <Content
          style={{
            padding: 0,
            width: 520,
          }}
          title={`将问题“${issueNum}”转化为任务`}
          description="请在下面选择问题类型，表示将该子任务转化为该种问题，实现子任务与其他类型问题之间的互转。"
        >
          <Form layout="vertical">
            <FormItem label="问题类型" style={{ width: 520 }}>
              {getFieldDecorator('typeCode', {
                initialValue: 'story',
                rules: [{ required: true }],
              })(
                <Select
                  label="问题类型"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {['story', 'task', 'bug', 'issue_epic'].map(type => (
                    <Option key={type} value={type}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                        <TypeTag
                          type={{
                            typeCode: type,
                          }}
                        />
                        <span style={{ marginLeft: 8 }}>{NAME[type]}</span>
                      </div>
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>

            {
              this.props.form.getFieldValue('typeCode') === 'issue_epic' && (
                <FormItem label="Epic名称" style={{ width: 520 }}>
                  {getFieldDecorator('epicName', {
                    rules: [{ required: true, message: 'Epic名称为必输项' }],
                  })(
                    <Input label="Epic名称" maxLength={44} />,
                  )}
                </FormItem>
              )
            }
          </Form>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(TransformSubIssue));
