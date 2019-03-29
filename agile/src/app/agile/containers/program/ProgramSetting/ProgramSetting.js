import React, { Component } from 'react';
import {
  stores, axios, Page, Header, Content, Permission,
} from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import {
  Form, Input, Button, Icon, 
} from 'choerodon-ui';

const { AppState } = stores;
const FormItem = Form.Item;

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
    const { form } = this.props;
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`)
      .then((res) => {
        this.setState({
          origin: res,
          shortName: res.projectCode,
        });
        form.setFieldsValue({
          shortName: res.projectCode,
        });
      });
  }

  handleUpdateProgramSetting = () => {
    const { form } = this.props;
    const { origin } = this.state;
    form.validateFields((err, values, modify) => {
      if (!err && modify) {
        const projectInfoDTO = {
          ...origin,
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
          .catch(() => {
            this.setState({
              loading: false,
            });
            Choerodon.prompt('修改失败');
          });
      }
    });
  };

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { shortName, loading } = this.state;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
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
          description="根据项目需求，你可以修改项目编码。"
          link="http://v0-10.choerodon.io/zh/docs/user-guide/agile/setup/project-setting/"
        >
          <div style={{ marginTop: 8 }}>
            <Form layout="vertical">
              <FormItem label="项目编码" style={{ width: 512 }}>
                {getFieldDecorator('shortName', {
                  rules: [{ required: true, message: '项目编码必填' }],
                  initialValue: shortName,
                })(
                  <Input
                    label="项目编码"
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
                  loading={loading}
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
