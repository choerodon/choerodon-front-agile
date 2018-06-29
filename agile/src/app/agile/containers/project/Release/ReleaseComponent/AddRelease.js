import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Modal, Form, Input, DatePicker } from 'choerodon-ui';
import moment from 'moment';
import { Content, stores } from 'choerodon-front-boot';
import ReleaseStore from '../../../../stores/project/release/ReleaseStore';

const { Sidebar } = Modal;
const { TextArea } = Input;
const FormItem = Form.Item;
const { AppState } = stores;

@observer
class AddRelease extends Component {
  constructor(props) {
    super(props);
    this.state = {
      endDate: null,
      startDate: null,
      loading: false,
    };
  }
  handleOk(e) {
    this.setState({
      loading: true,
    });
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {
          description: values.description,
          name: values.name,
          projectId: AppState.currentMenuType.id,
          startDate: values.startDate ? `${moment(values.startDate).format('YYYY-MM-DD')} 00:00:00` : null,
          releaseDate: values.endDate ? `${moment(values.endDate).format('YYYY-MM-DD')} 00:00:00` : null,
        };
        ReleaseStore.axiosAddRelease(data).then((res) => {
          this.props.onCancel();
          this.props.refresh();
          this.setState({
            loading: false,
          });
        }).catch((error) => {
          this.setState({
            loading: false,
          });
          window.console.error(error);
        });
      } else {
        this.setState({
          loading: false,
        });
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        title="创建发布计划"
        visible={this.props.visible}
        onCancel={this.props.onCancel.bind(this)}
        onOk={this.handleOk.bind(this)}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.loading}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title={`在项目"${AppState.currentMenuType.name}"中创建发布计划`}
          description="请在下面输入版本的名称、描述、开始和结束日期，创建新的软件版本。"
          // link="#"
        >
          <Form>
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: '版本名称必须',
                }],
              })(
                <Input label="版本名称" maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('startDate', {})(
                <DatePicker
                  style={{ width: '100%' }} 
                  label="开始日期"
                  disabledDate={this.state.endDate ? current => current > moment(this.state.endDate) : ''}
                  onChange={(date) => {
                    this.setState({
                      startDate: date,
                    });
                  }}
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('endDate', {})(
                <DatePicker 
                  style={{ width: '100%' }} 
                  label="结束日期"
                  onChange={(date) => {
                    this.setState({
                      endDate: date,
                    });
                  }}
                  disabledDate={this.state.startDate ? current => current < moment(this.state.startDate) : ''}
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('description', {})(
                <TextArea label="版本描述" autoSize maxLength={30} />,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(AddRelease);
