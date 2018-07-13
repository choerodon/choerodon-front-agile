import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Form, Input, Button, Modal, Icon, Tooltip, Radio } from 'choerodon-ui';

import './ExecuteTest.scss';
import { UploadButton, NumericInput } from '../../../../../components/CommonComponent';
import { handleFileUpload, beforeTextUpload } from '../../../../../common/utils';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class CreateTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLoading: false,
      fileList: [],
    };
  }

  componentDidMount() {
  }

  setFileList = (data) => {
    this.setState({ fileList: data });
  }

  handleCreateIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ createLoading: true });
        const obj = {};
        this.handleSave(obj);
      }
    });
  };

  handleSave = (data) => {
    const fileList = this.state.fileList;
    const callback = (newFileList) => {
      this.setState({ fileList: newFileList });
    };
    // createSubIssue(this.props.issueId, data)
    //   .then((res) => {
    //     if (fileList.length > 0) {
    //       const config = {
    //         issueType: res.statusId,
    //         issueId: res.issueId,
    //         fileName: fileList[0].name,
    //         projectId: AppState.currentMenuType.id,
    //       };
    //       if (fileList.some(one => !one.url)) {
    //         handleFileUpload(this.state.fileList, callback, config);
    //       }
    //     }
    //     this.props.onOk(res);
    //   })
    //   .catch((error) => {
    //   });
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
                <RadioGroup onChange={this.onChangeStrategy}>
                  <Radio style={radioStyle} value={'temp'}>执行临时</Radio>
                  <Radio style={radioStyle} value={'add'}>添加到现有测试循环和执行</Radio>
                </RadioGroup>,
              )}
            </FormItem>
            <FormItem label="版本">
              {getFieldDecorator('version', {
                rules: [{ required: true, message: '测试步骤为必输项' }],
              })(
                <Select label="版本">
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem label="测试循环">
              {getFieldDecorator('circle', {
                rules: [{ required: true, message: '测试数据为必输项' }],
              })(
                <Select label="测试循环">
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem label="被指定人" style={{ marginBottom: 0 }}>
              {getFieldDecorator('assigneed', {
                rules: [{ required: true, message: '默认经办人策略为必选项' }],
                initialValue: this.state.strategy || 'undistributed',
              })(
                <RadioGroup label="被指定人" onChange={this.onChangeStrategy}>
                  <Radio style={radioStyle} value={'mine'}>我</Radio>
                  <Radio style={radioStyle} value={'other'}>其他人</Radio>
                </RadioGroup>,
              )}
            </FormItem>
            <FormItem label="其他人">
              {getFieldDecorator('other', {
                rules: [{ required: true, message: '预期结果为必输项' }],
              })(
                <Select label="其他人">
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
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
