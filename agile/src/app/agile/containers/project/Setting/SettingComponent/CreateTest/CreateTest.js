import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Form, Input, Button, Modal, Icon, Tooltip } from 'choerodon-ui';

import './CreateTest.scss';
import { UploadButton, NumericInput } from '../../../../../components/CommonComponent';
import { handleFileUpload, beforeTextUpload } from '../../../../../common/utils';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;

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

    return (
      <Sidebar
        className="c7n-createSubIssue"
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
              {getFieldDecorator('step', {
                rules: [{ required: true, message: '测试步骤为必输项' }],
              })(
                <Input label="测试步骤" maxLength={30} />,
              )}
            </FormItem>
            <FormItem label="测试数据">
              {getFieldDecorator('data', {
                rules: [{ required: true, message: '测试数据为必输项' }],
              })(
                <Input label="测试数据" maxLength={30} />,
              )}
            </FormItem>
            <FormItem label="预期结果">
              {getFieldDecorator('result', {
                rules: [{ required: true, message: '预期结果为必输项' }],
              })(
                <Input label="预期结果" maxLength={30} />,
              )}
            </FormItem>
          </Form>
          
          <div className="sign-upload" style={{ marginTop: 38 }}>
            <div style={{ display: 'flex', marginBottom: 13, alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>分步附件</div>
            </div>
            <UploadButton
              funcType="raised"
              onRemove={this.setFileList}
              onBeforeUpload={this.setFileList}
              fileList={this.state.fileList}
            />
          </div>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(CreateTest));
