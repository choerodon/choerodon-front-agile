import React, { Component } from 'react';
import { stores, axios, Page, Header, Content } from 'choerodon-front-boot';
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
      couldUpdate: false,
    };
  }

  componentDidMount() {
    window.console.warn('project setting home');
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

  handleCheckSameName = (rule, value, callback) => {
    if (!value) {
      this.setState({
        couldUpdate: false,
      });
      callback('项目code不能为空');
    } else if (value === this.state.origin.projectCode) {
      this.setState({
        couldUpdate: false,
      });
      callback();
    } else {
      axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/project_info/check?projectName=${value}`)
        .then((res) => {
          if (res) {
            this.setState({
              couldUpdate: false,
            });
            callback('存在同名code，请选择其他项目code');
          } else {
            this.setState({
              couldUpdate: true,
            });
            callback();
          }
        });
    }
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
              origin: res,
              loading: false,
              couldUpdate: false,
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
      <Page>
        <Header title="项目设置">
          <Button funcTyp="flat" onClick={() => this.getProjectCode()}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="项目设置"
          description="可配置的项目编码。"
          link="#"
        >
          <div style={{ marginTop: 8 }}>
            <Form layout="vertical">
              <FormItem label="项目Code" style={{ width: 512 }}>
                {getFieldDecorator('code', {
                  rules: [{
                    validator: this.handleCheckSameName,
                  }],
                })(
                  <Input
                    label="项目Code"
                    maxLength={5}
                  />,
                )}
              </FormItem>
            </Form>
            <div style={{ padding: '12px 0', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Button
                type="primary"
                funcType="raised"
                disabled={!this.state.couldUpdate}
                loading={this.state.loading}
                onClick={() => this.handleUpdateProjectCode()}
              >
            保存
              </Button>
              <Button
                funcType="raised"
                disabled={this.state.origin.projectCode === this.props.form.getFieldValue('code')}
                style={{ marginLeft: 12 }}
                onClick={() => this.getProjectCode()}
              >
            取消
              </Button>
            </div>
          </div>
        </Content>
      </Page>
      
    );
  }
}
export default Form.create({})(withRouter(ProjectSetting));
