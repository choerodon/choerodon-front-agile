import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import {
  Select, Form, Input, Button, Modal, Icon, Tooltip, InputNumber,
} from 'choerodon-ui';
import { UploadButton } from '../CommonComponent';
import { handleFileUpload, beforeTextUpload } from '../../common/utils';
import {
  createIssue, loadLabels, loadPriorities, loadVersions, loadSprints, loadComponents, loadEpics,
} from '../../api/NewIssueApi';
import { getUsers } from '../../api/CommonApi';
import { COLOR } from '../../common/Constant';
import WYSIWYGEditor from '../WYSIWYGEditor';
import FullEditor from '../FullEditor';
import UserHead from '../UserHead';
import TypeTag from '../TypeTag';
import './CreateIssue.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
let sign = false;

const storyPointList = ['0.5', '1', '2', '3', '4', '5', '8', '13'];

class CreateIssue extends Component {
  debounceFilterIssues = _.debounce((input) => {
    this.setState({ selectLoading: true });
    getUsers(input).then((res) => {
      this.setState({
        originUsers: res.content.filter(u => u.enabled),
        selectLoading: false,
      });
    });
  }, 500);

  constructor(props) {
    super(props);
    this.state = {
      delta: '',
      edit: false,
      createLoading: false,
      fileList: [],
      selectLoading: true,

      originLabels: [],
      originComponents: [],
      originEpics: [],
      originPriorities: [],
      originFixVersions: [],
      originSprints: [],
      originUsers: [],
      originIssueTypes: [],

      defaultPriority: false,

      newIssueTypeCode: '',
      storyPoints: '',
      estimatedTime: '',
    };
  }

  componentDidMount() {
    this.loadPriorities();
    this.loadIssueTypes();
  }

  onFilterChange(input) {
    if (!sign) {
      this.setState({
        selectLoading: true,
      });
      getUsers(input).then((res) => {
        this.setState({
          originUsers: res.content.filter(u => u.enabled),
          selectLoading: false,
        });
      });
      sign = true;
    } else {
      this.debounceFilterIssues(input);
    }
  }

  setFileList = (data) => {
    this.setState({ fileList: data });
  };

  handleCreateIssue = () => {
    const { form, store } = this.props;
    const {
      originComponents,
      originLabels,
      originFixVersions,
      delta,
      storyPoints,
      estimatedTime,
    } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        const issueTypes = store.getIssueTypes;
        const { typeCode } = issueTypes.find(t => t.id === values.typeId);
        const exitComponents = originComponents;
        const componentIssueRelDTOList = _.map(values.componentIssueRel, (component) => {
          const target = _.find(exitComponents, { name: component });
          if (target) {
            return target;
          } else {
            return ({
              name: component,
              projectId: AppState.currentMenuType.id,
            });
          }
        });
        const exitLabels = originLabels;
        const labelIssueRelDTOList = _.map(values.issueLink, (label) => {
          const target = _.find(exitLabels, { labelName: label });
          if (target) {
            return target;
          } else {
            return ({
              labelName: label,
              projectId: AppState.currentMenuType.id,
            });
          }
        });
        const exitFixVersions = originFixVersions;
        const fixVersionIssueRelDTOList = _.map(values.fixVersionIssueRel, (version) => {
          const target = _.find(exitFixVersions, { name: version });
          if (target) {
            return {
              ...target,
              relationType: 'fix',
            };
          } else {
            return ({
              name: version,
              relationType: 'fix',
              projectId: AppState.currentMenuType.id,
            });
          }
        });
        const extra = {
          issueTypeId: values.typeId,
          typeCode,
          summary: values.summary,
          priorityId: values.priorityId,
          priorityCode: `priority-${values.priorityId}`,
          sprintId: values.sprintId || 0,
          epicId: values.epicId || 0,
          epicName: values.epicName,
          parentIssueId: 0,
          assigneeId: values.assigneedId,
          labelIssueRelDTOList,
          versionIssueRelDTOList: fixVersionIssueRelDTOList,
          componentIssueRelDTOList,
          storyPoints,

          remainingTime: estimatedTime,
        };
        this.setState({ createLoading: true });
        const deltaOps = delta;
        if (deltaOps) {
          beforeTextUpload(deltaOps, extra, this.handleSave);
        } else {
          extra.description = '';
          this.handleSave(extra);
        }
        // this.props.onOk(extra);
      }
    });
  };

  handleSave = (data) => {
    const { fileList } = this.state;
    const { onOk } = this.props;
    const callback = (newFileList) => {
      this.setState({ fileList: newFileList });
    };
    createIssue(data)
      .then((res) => {
        if (fileList.length > 0) {
          const config = {
            issueType: res.statusId,
            issueId: res.issueId,
            fileName: fileList[0].name,
            projectId: AppState.currentMenuType.id,
          };
          if (fileList.some(one => !one.url)) {
            handleFileUpload(fileList, callback, config);
          }
        }
        onOk(res);
      })
      .catch(() => {
        onOk();
      });
  };

  loadPriorities = () => {
    loadPriorities().then((res) => {
      const defaultPriorities = res.filter(p => p.default);
      this.setState({
        originPriorities: res,
        defaultPriority: defaultPriorities.length ? defaultPriorities[0] : '',
      });
    });
  };

  loadIssueTypes = () => {
    axios.get(`/issue/v1/projects/${AppState.currentMenuType.projectId}/schemes/query_issue_types_with_sm_id?apply_type=agile`)
      .then((res) => {
        this.setState({
          originIssueTypes: res,
        });
      });
  };

  handleChangeStoryPoint = (value) => {
    const { storyPoints } = this.state;
    // 只允许输入整数，选择时可选0.5
    if (value === '0.5') {
      this.setState({
        storyPoints: '0.5',
      });
    } else if (/^(0|[1-9][0-9]*)(\[0-9]*)?$/.test(value) || value === '') {
      this.setState({
        storyPoints: String(value),
      });
    } else if (value.toString().charAt(value.length - 1) === '.') {
      this.setState({
        storyPoints: value.slice(0, -1),
      });
    } else {
      this.setState({
        storyPoints,
      });
    }
  };

  handleChangeEstimatedTime = (value) => {
    const { estimatedTime } = this.state;
    // 只允许输入整数，选择时可选0.5
    if (value === '0.5') {
      this.setState({
        estimatedTime: '0.5',
      });
    } else if (/^(0|[1-9][0-9]*)(\[0-9]*)?$/.test(value) || value === '') {
      this.setState({
        estimatedTime: String(value),
      });
    } else if (value.toString().charAt(value.length - 1) === '.') {
      this.setState({
        estimatedTime: value.slice(0, -1),
      });
    } else {
      this.setState({
        estimatedTime,
      });
    }
  };

  render() {
    const {
      visible,
      onCancel,
      store,
      form,
    } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const {
      originPriorities, defaultPriority, createLoading, storyPoints, estimatedTime,
      edit, delta, originUsers, selectLoading,
      originEpics, originSprints, originFixVersions, originComponents, originIssueTypes,
      originLabels, fileList, newIssueTypeCode,
    } = this.state;
    const callback = (value) => {
      this.setState({
        delta: value,
        edit: false,
      });
    };
    const issueTypes = store.getIssueTypes;
    return (
      <Sidebar
        className="c7n-createIssue"
        title="创建问题"
        visible={visible || false}
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={createLoading}
      >
        <Content
          title={`在项目“${AppState.currentMenuType.name}”中创建问题`}
          description="请在下面输入问题的详细信息，包含详细描述、人员信息、版本信息、进度预估、优先级等等。您可以通过丰富的任务描述帮助相关人员更快更全面的理解任务，同时更好的把控问题进度。"
          link="http://v0-10.choerodon.io/zh/docs/user-guide/agile/issue/create-issue/"
        >
          <div>
            <Form layout="vertical">
              <FormItem label="问题类型" style={{ width: 520 }}>
                {getFieldDecorator('typeId', {
                  rules: [{ required: true, message: '问题类型为必输项' }],
                })(
                  <Select
                    label="问题类型"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    onChange={((value) => {
                      this.setState({
                        newIssueTypeCode: originIssueTypes.find(item => item.id === value).typeCode,
                      });
                    })}
                  >
                    {issueTypes.filter(t => t.typeCode !== 'sub_task').map(type => (
                      <Option key={type.id} value={type.id}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                          <TypeTag
                            data={type}
                            showName
                          />
                        </div>
                      </Option>))}
                  </Select>,
                )}
              </FormItem>
              { newIssueTypeCode === 'issue_epic' && (
              <FormItem label="史诗名称" style={{ width: 520 }}>
                {getFieldDecorator('epicName', {
                  rules: [{ required: true, message: '史诗名称为必输项' }, {
                    validator: this.checkEpicNameRepeat,
                  }],
                })(
                  <Input label="史诗名称" maxLength={10} />,
                )}
              </FormItem>
              )}
              <FormItem label="概要" style={{ width: 520 }}>
                {getFieldDecorator('summary', {
                  rules: [{ required: true, message: '概要为必输项' }],
                })(
                  <Input label="概要" maxLength={44} />,
                )}
              </FormItem>

              <FormItem label="优先级" style={{ width: 520 }}>
                {getFieldDecorator('priorityId', {
                  rules: [{ required: true, message: '优先级为必选项' }],
                  initialValue: defaultPriority ? defaultPriority.id : '',
                })(
                  <Select
                    label="优先级"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    {originPriorities.map(priority => (
                      <Option key={priority.id} value={priority.id}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', padding: 2 }}>
                          <span>{priority.name}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>

              <div style={{ width: 520 }}>
                <div style={{ display: 'flex', marginBottom: 3, alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold' }}>描述</div>
                  <div style={{ marginLeft: 80 }}>
                    <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ edit: true })} style={{ display: 'flex', alignItems: 'center' }}>
                      <Icon type="zoom_out_map" style={{ color: '#3f51b5', fontSize: '18px', marginRight: 12 }} />
                      <span style={{ color: '#3f51b5' }}>全屏编辑</span>
                    </Button>
                  </div>
                </div>
                {
                !edit && (
                  <div className="clear-p-mw">
                    <WYSIWYGEditor
                      value={delta}
                      style={{ height: 200, width: '100%' }}
                      onChange={(value) => {
                        this.setState({ delta: value });
                      }}
                    />
                  </div>
                )
              }
              </div>

              {
                // 创建的问题类型为故事时，才显示故事点
                newIssueTypeCode === 'story' && (
                <div style={{ width: 520, paddingBottom: 8, marginBottom: 12 }}>
                  <Select
                    label="故事点"
                    value={storyPoints && storyPoints.toString()}
                    mode="combobox"
                    ref={(e) => {
                      this.componentRef = e;
                    }}
                    onPopupFocus={(e) => {
                      this.componentRef.rcSelect.focus();
                    }}
                    tokenSeparators={[',']}
                    style={{ marginTop: 0, paddingTop: 0 }}
                    onChange={value => this.handleChangeStoryPoint(value)}
                  >
                    {storyPointList.map(sp => (
                      <Option key={sp.toString()} value={sp}>
                        {sp}
                      </Option>
                    ))}
                  </Select>
                </div>
                )
              }

              {
                newIssueTypeCode !== 'issue_epic' && (
                  <div style={{ width: 520, paddingBottom: 8, marginBottom: 12 }}>
                    <Select
                      label="预估时间"
                      value={estimatedTime && estimatedTime.toString()}
                      mode="combobox"
                      ref={(e) => {
                        this.componentRef = e;
                      }}
                      onPopupFocus={(e) => {
                        this.componentRef.rcSelect.focus();
                      }}
                      tokenSeparators={[',']}
                      style={{ marginTop: 0, paddingTop: 0 }}
                      onChange={value => this.handleChangeEstimatedTime(value)}
                    >
                      {storyPointList.map(sp => (
                        <Option key={sp.toString()} value={sp}>
                          {sp}
                        </Option>
                      ))}
                    </Select>
                  </div>
               
                )
              }
              <FormItem label="经办人" style={{ width: 520, display: 'inline-block' }}>
                {getFieldDecorator('assigneedId', {})(
                  <Select
                    label="经办人"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    loading={selectLoading}
                    filter
                    filterOption={false}
                    allowClear
                    onFilterChange={this.onFilterChange.bind(this)}
                  >
                    {originUsers.map(user => (
                      <Option key={user.id} value={user.id}>
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
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
              <Tooltip title="可自行选择经办人，如不选择，会应用模块的默认经办人逻辑和项目的默认经办人策略">
                <Icon
                  type="error"
                  style={{
                    fontSize: '16px',
                    color: 'rgba(0,0,0,0.54)',
                    marginLeft: 15,
                    marginTop: 20,
                  }}
                />
              </Tooltip>

              {
              newIssueTypeCode !== 'issue_epic' && (
                <FormItem label="史诗" style={{ width: 520 }}>
                  {getFieldDecorator('epicId', {})(
                    <Select
                      label="史诗"
                      allowClear
                      filter
                      filterOption={
                        (input, option) => option.props.children && option.props.children.toLowerCase().indexOf(
                          input.toLowerCase(),
                        ) >= 0
                      }
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      loading={selectLoading}
                      onFilterChange={() => {
                        this.setState({
                          selectLoading: true,
                        });
                        loadEpics().then((res) => {
                          this.setState({
                            originEpics: res,
                            selectLoading: false,
                          });
                        });
                      }}
                    >
                      {originEpics.map(
                        epic => (
                          <Option
                            key={epic.issueId}
                            value={epic.issueId}
                          >
                            {epic.epicName}
                          </Option>
                        ),
                      )}
                    </Select>,
                  )}
                </FormItem>
              )
            }

              <FormItem label="冲刺" style={{ width: 520 }}>
                {getFieldDecorator('sprintId', {})(
                  <Select
                    label="冲刺"
                    allowClear
                    filter
                    filterOption={
                      (input, option) => option.props.children && option.props.children.toLowerCase().indexOf(
                        input.toLowerCase(),
                      ) >= 0
                    }
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    loading={selectLoading}
                    onFilterChange={() => {
                      this.setState({
                        selectLoading: true,
                      });
                      loadSprints(['sprint_planning', 'started']).then((res) => {
                        this.setState({
                          originSprints: res,
                          selectLoading: false,
                        });
                      });
                    }}
                  >
                    {originSprints.map(sprint => (
                      <Option key={sprint.sprintId} value={sprint.sprintId}>
                        {sprint.sprintName}
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>

              <FormItem label="修复版本" style={{ width: 520 }}>
                {getFieldDecorator('fixVersionIssueRel', {
                  rules: [{ transform: value => (value ? value.toString() : value) }],
                })(
                  <Select
                    label="修复版本"
                    mode="tags"
                    loading={selectLoading}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    tokenSeparators={[',']}
                    onFocus={() => {
                      this.setState({
                        selectLoading: true,
                      });
                      loadVersions(['version_planning', 'released']).then((res) => {
                        this.setState({
                          originFixVersions: res,
                          selectLoading: false,
                        });
                      });
                    }}
                  >
                    {
                      originFixVersions.map(
                        version => (
                          <Option
                            key={version.name}
                            value={version.name}
                          >
                            {version.name}
                          </Option>
                        ),
                      )}
                  </Select>,
                )}
              </FormItem>

              <FormItem label="模块" style={{ width: 520 }}>
                {getFieldDecorator('componentIssueRel', {
                  rules: [{ transform: value => (value ? value.toString() : value) }],
                })(
                  <Select
                    label="模块"
                    mode="tags"
                    loading={selectLoading}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    tokenSeparators={[',']}
                    onFocus={() => {
                      this.setState({
                        selectLoading: true,
                      });
                      loadComponents().then((res) => {
                        this.setState({
                          originComponents: res.content,
                          selectLoading: false,
                        });
                      });
                    }}
                  >
                    {
                      originComponents.map(
                        component => (
                          <Option
                            key={component.name}
                            value={component.name}
                          >
                            {component.name}
                          </Option>
                        ),
                      )}
                  </Select>,
                )}
              </FormItem>

              <FormItem label="标签" style={{ width: 520 }}>
                {getFieldDecorator('issueLink', {
                  rules: [{ transform: value => (value ? value.toString() : value) }],
                })(
                  <Select
                    label="标签"
                    mode="tags"
                    loading={selectLoading}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    tokenSeparators={[',']}
                    onFocus={() => {
                      this.setState({
                        selectLoading: true,
                      });
                      loadLabels().then((res) => {
                        this.setState({
                          originLabels: res,
                          selectLoading: false,
                        });
                      });
                    }}
                  >
                    {originLabels.map(label => (
                      <Option key={label.labelName} value={label.labelName}>
                        {label.labelName}
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </Form>

            <div className="sign-upload" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', marginBottom: '13px', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold' }}>附件</div>
              </div>
              <div style={{ marginTop: -38 }}>
                <UploadButton
                  onRemove={this.setFileList}
                  onBeforeUpload={this.setFileList}
                  fileList={fileList}
                />
              </div>
            </div>
          </div>
          {
          edit ? (
            <FullEditor
              initValue={delta}
              visible={edit}
              onCancel={() => this.setState({ edit: false })}
              onOk={callback}
            />
          ) : null
        }

        </Content>

      </Sidebar>
    );
  }
}
export default Form.create({})(CreateIssue);
