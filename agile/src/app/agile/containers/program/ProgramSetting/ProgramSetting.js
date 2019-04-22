import React, { Component } from 'react';
import {
  stores, axios, Page, Header, Content, Permission,
} from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import {
  Form, Input, Button, Icon, Tabs, Table,
} from 'choerodon-ui';
import moment from 'moment';

const { AppState } = stores;
const FormItem = Form.Item;
const { TabPane } = Tabs;

class ProgramSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      shortName: undefined,
      origin: undefined,
      currentTab: '1',
      proData: [],
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
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/program_info/team`)
      .then((res) => {
        this.setState({
          proData: res,
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

  handleTabChange = (currentTab) => {
    this.setState({
      currentTab,
    });
  };

  getColumns = () => [{
    title: '团队项目名称',
    dataIndex: 'projName',
    key: 'projName',
  }, {
    title: '人数',
    dataIndex: 'userCount',
    key: 'userCount',
  }, {
    title: '加入时间',
    dataIndex: 'startDate',
    key: 'startDate',
    render: startDate => <span>{moment(startDate).format('YYYY-MM-DD')}</span>,
  }];

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const {
      shortName, loading, currentTab, proData,
    } = this.state;
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
        <Content>
          <Tabs defaultActiveKey="1" activeKey={currentTab} onChange={this.handleTabChange}>
            <TabPane tab="项目编码" key="1">
              根据项目需求，你可以修改项目编码。
              <div style={{ marginTop: 20 }}>
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
            </TabPane>
            <TabPane tab="ART设置" key="2">
              列表显示项目群关联的团队项目信息。
              <div style={{ width: 520, marginTop: 20 }}>
                <Table
                  columns={this.getColumns()}
                  dataSource={proData}
                  filterBar={false}
                  pagination={false}
                />
              </div>
            </TabPane>
          </Tabs>
        </Content>
      </Page>
    );
  }
}
export default Form.create({})(withRouter(ProgramSetting));
