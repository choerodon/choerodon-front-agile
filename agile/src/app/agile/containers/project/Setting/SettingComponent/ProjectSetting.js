import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import { Select, Form, Input, Button, Modal, Spin, Icon } from 'choerodon-ui';

const { AppState } = stores;
const { Option } = Select;
const FormItem = Form.Item;

class ProjectSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      origin: {},
      loading: false,
    };
  }

  componentDidMount() {
    this.getProjectCode();
  }

  getProjectCode() {
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/project_info`)
      .then((res) => {
        this.setState({
          origin: res,
        });
        this.props.form.setFieldsValue({
          code: res.projectCode,
        });
      });
  }

  handleUpdateProjectCode = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const projectInfoDTO = {
          ...this.state.origin,
          projectCode: values.code,
        };
        this.setState({
          loading: true,
        });
        axios.put(`/agile/v1/project/${AppState.currentMenuType.id}/project_info`, projectInfoDTO)
          .then((res) => {
            this.setState({
              loading: false,
            });
          })
          .catch((error) => {
            this.setState({
              loading: false,
            });
            this.getProjectCode();
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk } = this.props;

    return (
      <div style={{ marginTop: 8 }}>
        <Form layout="vertical">
          <FormItem label="项目Code" style={{ width: 512 }}>
            {getFieldDecorator('code', {
              rules: [{
                required: true,
                message: '项目Code必填且不为空',
              }],
            })(
              <Input
                label="项目Code"
                maxLength={30}
              />,
            )}
          </FormItem>
        </Form>
        <div style={{ padding: '12px 0', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button
            type="primary"
            funcType="raised"
            loading={this.state.loading}
            onClick={() => this.handleUpdateProjectCode()}
          >
            保存
          </Button>
          <Button
            funcType="raised"
            style={{ marginLeft: 12 }}
            onClick={() => this.getProjectCode()}
          >
            取消
          </Button>
        </div>
      </div>
    );
  }
}
export default Form.create({})(withRouter(ProjectSetting));
