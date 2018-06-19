import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Modal, Form, Input, DatePicker, Icon } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import moment from 'moment';
import ReleaseStore from '../../../../../stores/project/release/ReleaseStore';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const { TextArea } = Input;
const { AppState } = stores;

@observer
class CreateVersion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      startDate: null,
      endDate: null,
    };
  }
  handleCreateVersion(e) {
    this.setState({
      loading: true,
    });
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        const data = {
          description: value.description,
          name: value.name,
          projectId: AppState.currentMenuType.id,
          startDate: value.startDate ? `${moment(value.startDate).format('YYYY-MM-DD')} 00:00:00` : null,
          releaseDate: value.endDate ? `${moment(value.endDate).format('YYYY-MM-DD')} 00:00:00` : null,
        };
        ReleaseStore.axiosAddRelease(data).then((res) => {
          this.setState({
            loading: false,
          });
          this.props.form.resetFields();
          this.props.onCancel();
          this.props.refresh();
        }).catch((error) => {
          this.setState({
            loading: false,
          });
          this.props.onCancel();
          window.console.log(error);
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
        title="创建版本"
        visible={this.props.visible}
        okText="新建"
        cancelText="取消"
        onCancel={() => {
          this.props.form.resetFields();
          this.props.onCancel();
        }}
        confirmLoading={this.state.loading}
        onOk={this.handleCreateVersion.bind(this)}
      >
        <Content
          style={{
            padding: 0,
          }}
          title={`创建项目“${AppState.currentMenuType.name}”的版本`}
          description="请在下面输入版本的名称、描述、开始和结束日期，创建新的软件版本。"
        >
          <Form style={{ width: 512 }}>
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: '版本名称不能为空',
                }],
              })(
                <Input maxLength={30} label="版本名称" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('description', {})(
                <TextArea autoSize label="版本描述" maxLength={30} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('startDate', {})(
                <DatePicker
                  style={{ width: '100%' }} 
                  label="开始日期"
                  onChange={(date) => {
                    this.setState({
                      startDate: date,
                    });
                  }}
                  disabledDate={this.state.endDate ? current => current > moment(this.state.endDate) : ''}
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
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(CreateVersion);
