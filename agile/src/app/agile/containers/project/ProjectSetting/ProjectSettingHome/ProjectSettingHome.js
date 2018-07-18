import React, { Component } from 'react';
import { stores, axios, Page, Header, Content, Permission } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Form, Input, Button, Icon, Select, Radio } from 'choerodon-ui';
import { COLOR } from '../../../../common/Constant';
import { loadPriorities } from '../../../../api/NewIssueApi';
import { getUsers, getUser } from '../../../../api/CommonApi';
import UserHead from '../../../../components/UserHead';

const { AppState } = stores;
const { Option } = Select;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
let sign = false;

class ProjectSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      origin: {},
      loading: false,
      couldUpdate: false,
      originPriorities: [],
      originUsers: [],

      code: undefined,
      priorityCode: undefined,
      strategy: undefined,
      assignee: undefined,
    };
  }

  componentDidMount() {
    this.loadPriorities();
    this.getProjectSetting();
  }

  onChangeStrategy = (e) => {
    const strategy = e.target.value;
    if (strategy !== 'assignee') {
      this.props.form.setFieldsValue({
        assignee: undefined,
      }); 
    }
  }

  getProjectSetting() {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`)
      .then((res) => {
        this.setState({
          origin: res,
          code: res.projectCode,
          priorityCode: res.defaultPriorityCode,
          strategy: res.defaultAssigneeType,
        });
        this.props.form.setFieldsValue({
          code: res.projectCode,
          priorityCode: res.defaultPriorityCode,
          strategy: res.defaultAssigneeType,
        });
        if (res.defaultAssigneeId) {
          this.loadUser(res.defaultAssigneeId);
        } else {
          this.setState({
            assignee: undefined,
          });
          this.props.form.setFieldsValue({
            assignee: undefined,
          });
        }
      });
  }

  loadPriorities() {
    loadPriorities().then((res) => {
      this.setState({
        originPriorities: res.lookupValues,
      });
    });
  }

  loadUser(assigneeId) {
    getUser(assigneeId).then((res) => {
      this.setState({
        assignee: assigneeId,
        originUsers: [res.content[0]],
      });
      this.props.form.setFieldsValue({
        assignee: assigneeId,
      });
    });
  }

  transformPriorityCode(originpriorityCode) {
    if (!originpriorityCode.length) {
      return [];
    } else {
      const arr = [];
      arr[0] = _.find(originpriorityCode, { valueCode: 'high' });
      arr[1] = _.find(originpriorityCode, { valueCode: 'medium' });
      arr[2] = _.find(originpriorityCode, { valueCode: 'low' });
      return arr;
    }
  }

  onFilterChange(input) {
    if (!sign) {
      this.setState({
        selectLoading: true,
      });
      getUsers(input).then((res) => {
        this.setState({
          originUsers: res.content,
          selectLoading: false,
        });
      });
      sign = true;
    } else {
      this.debounceFilterIssues(input);
    }
  }

  debounceFilterIssues = _.debounce((input) => {
    this.setState({
      selectLoading: true,
    });
    getUsers(input).then((res) => {
      this.setState({
        originUsers: res.content,
        selectLoading: false,
      });
    });
  }, 500);

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
      // axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info/check?projectName=${value}`)
      //   .then((res) => {
      //     if (res) {
      //       this.setState({
      //         couldUpdate: false,
      //       });
      //       callback('存在同名code，请选择其他项目code');
      //     } else {
      //       this.setState({
      //         couldUpdate: true,
      //       });
      //       callback();
      //     }
      //   });
      this.setState({
        couldUpdate: true,
      });
      callback();
    }
  }

  handleUpdateProjectSetting = () => {
    this.props.form.validateFields((err, values, modify) => {
      if (!err && modify) {
        window.console.log(values);
        const projectInfoDTO = {
          ...this.state.origin,
          projectCode: values.code,
          defaultPriorityCode: values.priorityCode,
          defaultAssigneeType: values.strategy,
          defaultAssigneeId: values.assignee || 0,
        };
        this.setState({
          loading: true,
        });
        axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`, projectInfoDTO)
          .then((res) => {
            this.setState({
              origin: res,
              loading: false,
              couldUpdate: false,
              code: res.projectCode,
              priorityCode: res.defaultPriorityCode,
              strategy: res.defaultAssigneeType,
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
          <Button funcTyp="flat" onClick={() => this.getProjectSetting()}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="项目设置"
          description="根据项目需求，可以分拆为多个模块，每个模块可以进行负责人划分，配置后可以将项目中的问题归类到对应的模块中。例如“后端任务”，“基础架构”等等。"
          link="http://v0-7.choerodon.io/zh/docs/user-guide/agile/setup/project-setting/"
        >
          <div style={{ marginTop: 8 }}>
            <Form layout="vertical">
              <FormItem label="项目Code" style={{ width: 512 }}>
                {getFieldDecorator('code', {
                  rules: [{ required: true, message: '项目Code必填' }],
                  initialValue: this.state.code,
                })(
                  <Input
                    label="项目Code"
                    maxLength={5}
                  />,
                )}
              </FormItem>
              <FormItem label="默认优先级" style={{ width: 512 }}>
                {getFieldDecorator('priorityCode', {
                  rules: [{ required: true, message: '优先级为必选项' }],
                  initialValue: this.state.priorityCode,
                })(
                  <Select
                    label="默认优先级"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    loading={this.state.selectLoading}
                  >
                    {this.transformPriorityCode(this.state.originPriorities).map(type =>
                      (<Option key={type.valueCode} value={type.valueCode}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', padding: 2 }}>
                          <div
                            style={{ color: COLOR[type.valueCode].color, width: 20, height: 20, textAlign: 'center', lineHeight: '20px', borderRadius: '50%', marginRight: 8 }}
                          >
                            <Icon
                              type="flag"
                              style={{ fontSize: '13px' }}
                            />
                          </div>
                          <span>{type.name}</span>
                        </div>
                      </Option>),
                    )}
                  </Select>,
                )}
              </FormItem>
              <FormItem label="默认经办人策略" style={{ width: 512 }}>
                {getFieldDecorator('strategy', {
                  rules: [{ required: true, message: '默认经办人策略为必选项' }],
                  initialValue: this.state.strategy || 'undistributed',
                })(
                  <RadioGroup label="默认经办人策略" onChange={this.onChangeStrategy}>
                    <Radio style={radioStyle} value={'undistributed'}>无</Radio>
                    <Radio style={radioStyle} value={'current_user'}>默认创建人</Radio>
                    <Radio style={radioStyle} value={'default_assignee'}>指定经办人</Radio>
                  </RadioGroup>,
                )}
              </FormItem>
              <FormItem label="默认经办人" style={{ width: 512 }}>
                {getFieldDecorator('assignee', {
                  rules: [{ required: this.props.form.getFieldValue('strategy') === 'default_assignee', message: '默认经办人必选' }],
                  initialValue: this.state.assignee || undefined,
                })(
                  <Select
                    label="默认经办人"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    loading={this.state.selectLoading}
                    disabled={this.props.form.getFieldValue('strategy') !== 'default_assignee'}
                    filter
                    filterOption={false}
                    allowClear
                    onFilterChange={this.onFilterChange.bind(this)}
                  >
                    {this.state.originUsers.map(user =>
                      (<Option key={user.id} value={user.id}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', padding: 2 }}>
                          <UserHead
                            user={{
                              id: user.id,
                              loginName: user.loginName,
                              realName: user.realName,
                              avatar: user.imageUrl,
                            }}
                          />
                        </div>
                      </Option>),
                    )}
                  </Select>,
                )}
              </FormItem>
            </Form>
            <div style={{ padding: '12px 0', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.project-info.updateProjectInfo']}>
                <Button
                  type="primary"
                  funcType="raised"
                  loading={this.state.loading}
                  onClick={() => this.handleUpdateProjectSetting()}
                >
                  保存
                </Button>
              </Permission>
              <Button
                funcType="raised"
                style={{ marginLeft: 12 }}
                onClick={() => this.getProjectSetting()}
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
