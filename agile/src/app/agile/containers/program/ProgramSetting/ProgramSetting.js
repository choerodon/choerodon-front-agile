import React, { Component } from 'react';
import {
  stores, axios, Page, Header, Content, Permission,
} from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {
  Form, Input, Button, Icon, Select, Radio,
} from 'choerodon-ui';

const { AppState } = stores;
const { Option } = Select;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const sign = false;

class ProgramSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      shortName: undefined,
      origin: undefined,
    };
  }

  componentDidMount() {
    this.getProgramSetting();
  }

  getProgramSetting() {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`)
      .then((res) => {
        this.setState({
          origin: res,
          shortName: res.projectCode,
        });
        this.props.form.setFieldsValue({
          shortName: res.projectCode,
        });
      });
  }

  handleUpdateProgramSetting = () => {
    this.props.form.validateFields((err, values, modify) => {
      if (!err && modify) {
        const projectInfoDTO = {
          ...this.state.origin,
          projectCode: values.shortName,
        };
        this.setState({
          loading: true,
        });
        axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`, projectInfoDTO)
          .then((res) => {
            if (res.failed) {
              Choerodon.prompt(res.message);
            } else {
              this.setState({
                origin: res,
                loading: false,
                shortName: res.projectCode,
              });
              Choerodon.prompt('修改成功');
            }
          })
          .catch((error) => {
            this.setState({
              loading: false,
            });
            Choerodon.prompt('修改失败');
          });
      }
    });
  };

  render() {
    const { getFieldDecorator, isModifiedFields, getFieldValue } = this.props.form;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <Page
        service={[
          'agile-service.project-info.updateProjectInfo',
        ]}
      >
        <Header title="项目设置">
          <Button funcType="flat" onClick={() => this.getProgramSetting()}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="项目设置"
          description="根据项目需求，你可以修改项目简称。"
          link="http://v0-10.choerodon.io/zh/docs/user-guide/agile/setup/project-setting/"
        >
          <div style={{ marginTop: 8 }}>
            <Form layout="vertical">
              <FormItem label="项目简称" style={{ width: 512 }}>
                {getFieldDecorator('shortName', {
                  rules: [{ required: true, message: '项目简称必填' }],
                  initialValue: this.state.shortName,
                })(
                  <Input
                    label="项目简称"
                    maxLength={5}
                  />,
                )}
              </FormItem>
            </Form>
            <div style={{ padding: '12px 0', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.project-info.updateProjectInfo']}>
                <Button
                  type="primary"
                  funcType="raised"
                  loading={this.state.loading}
                  onClick={() => this.handleUpdateProgramSetting()}
                >
                  {'保存'}
                </Button>
              </Permission>
              <Button
                funcType="raised"
                style={{ marginLeft: 12 }}
                onClick={() => this.getProgramSetting()}
              >
                {'取消'}
              </Button>
            </div>
          </div>
        </Content>
      </Page>
    );
  }
}
export default Form.create({})(withRouter(ProgramSetting));
