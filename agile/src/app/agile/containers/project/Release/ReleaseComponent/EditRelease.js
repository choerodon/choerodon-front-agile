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
class EditRelease extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      loading: false,
    };
  }
  componentWillMount() {
    this.setState({
      startDate: ReleaseStore.getVersionDetail.startDate ? moment(ReleaseStore.getVersionDetail.startDate, 'YYYY-MM-DD HH:mm:ss') : null,
      endDate: ReleaseStore.getVersionDetail.releaseDate ? moment(ReleaseStore.getVersionDetail.releaseDate, 'YYYY-MM-DD HH:mm:ss') : null,
    });
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
          objectVersionNumber: this.props.data.objectVersionNumber,
          projectId: AppState.currentMenuType.id,
          startDate: values.startDate ? `${moment(values.startDate).format('YYYY-MM-DD')} 00:00:00` : null,
          releaseDate: values.endDate ? `${moment(values.endDate).format('YYYY-MM-DD')} 00:00:00` : null,
          versionId: ReleaseStore.getVersionDetail.versionId,
        };
        ReleaseStore.axiosUpdateVersion(
          ReleaseStore.getVersionDetail.versionId, data).then((res) => {
          this.setState({
            loading: false,
          });
          this.props.onCancel();
          this.props.refresh();
        }).catch((error) => {
          this.setState({
            loading: false,
          });
        });
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const data = JSON.parse(JSON.stringify(ReleaseStore.getVersionDetail));
    this.state.startDate = ReleaseStore.getVersionDetail.startDate ? moment(ReleaseStore.getVersionDetail.startDate, 'YYYY-MM-DD HH:mm:ss') : null;
    return (
      <Sidebar
        title="修改发布计划"
        visible={this.props.visible}
        onCancel={this.props.onCancel.bind(this)}
        destroyOnClose
        okText="确定"
        cancelText="取消"
        onOk={this.handleOk.bind(this)}
        confirmLoading={this.state.loading}
      >
        {
          this.props.visible ? (
            <Content
              style={{
                padding: 0,
                width: 512,
              }}
              title={`在项目“${AppState.currentMenuType.name}”中修改发布计划`}
              description="请在下面输入应用模板编码、名称、描述，创建默认最简模板。您也可以通过复制于现有模板，以便节省部分共同操作，提升效率。"
            >
              <Form>
                <FormItem>
                  {getFieldDecorator('name', {
                    initialValue: data.name ? data.name : null,
                    rules: [{
                      required: true,
                      message: '版本名称必须',
                    }],
                  })(
                    <Input label="版本名称" maxLength={30} />,
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('startDate', {
                    initialValue: data.startDate ? moment(data.startDate, 'YYYY-MM-DD HH-mm-ss') : null,
                  })(
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
                  {getFieldDecorator('endDate', {
                    initialValue: data.releaseDate ? moment(data.releaseDate, 'YYYY-MM-DD HH-mm-ss') : null,
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      label="结束日期"
                      disabledDate={this.state.startDate ? current => current < moment(this.state.startDate) : ''}
                      onChange={(date) => {
                        this.setState({
                          endDate: date,
                        });
                      }}
                    />,
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('description', {
                    initialValue: data.description ? data.description : null,
                  })(
                    <TextArea label="版本描述" autoSize maxLength={30} />,
                  )}
                </FormItem>
              </Form>
            </Content>
          ) : ''
        }
      </Sidebar>
    );
  }
}

export default Form.create()(EditRelease);
