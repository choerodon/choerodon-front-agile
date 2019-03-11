import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import {
  Select, Form, Input, Button, Modal, Icon, InputNumber,
} from 'choerodon-ui';
import { UploadButton } from '../CommonComponent';
import { handleFileUpload, beforeTextUpload } from '../../common/utils';
import {
  loadIssue, loadLabels, loadPriorities, loadVersions, createSubIssue,
} from '../../api/NewIssueApi';
import { getUsers } from '../../api/CommonApi';
import WYSIWYGEditor from '../WYSIWYGEditor';
import FullEditor from '../FullEditor';
import UserHead from '../UserHead';
import './CreateSubTask.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
let sign = false;
let hasPermission = false;

const storyPointList = ['0.5', '1', '2', '3', '4', '5', '8', '13'];

class CreateSubIssue extends Component {
  debounceFilterIssues = _.debounce((input) => {
    this.setState({ selectLoading: true });
    getUsers(input).then((res) => {
      this.setState({
        originUsers: res.content,
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
      sprint: {},
      selectLoading: true,
      originLabels: [],
      originPriorities: [],
      originFixVersions: [],
      originUsers: [],
      defaultPriorityId: false,
      estimatedTime: '',
    };
  }

  componentDidMount() {
    const { issueId } = this.props;
    loadIssue(issueId).then((res) => {
      this.setState({
        sprint: {
          sprintId: res.activeSprint ? res.activeSprint.sprintId || undefined : undefined,
          sprintName: res.activeSprint ? res.activeSprint.sprintName || '' : undefined,
        },
      });
    });
    this.loadPriority();
    this.loadPermission();
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

  setFileList = (data) => {
    this.setState({ fileList: data });
  };

  loadPriority = () => {
    loadPriorities().then((res) => {
      const defaultPriorities = res.filter(p => p.default);
      this.setState({
        originPriorities: res,
        defaultPriorityId: defaultPriorities.length ? defaultPriorities[0].id : '',
      });
    });
  };

  loadPermission = () => {
    axios.post('/iam/v1/permissions/checkPermission', [{
      code: 'agile-service.project-info.updateProjectInfo',
      organizationId: AppState.currentMenuType.organizationId,
      projectId: AppState.currentMenuType.id,
      resourceType: 'project',
    }]).then((permission) => {
      hasPermission = permission.length && permission[0].approve;
    });
  };

  handleCreateIssue = () => {
    const { sprint, delta, estimatedTime } = this.state;
    const {
      store, form, issueId,
    } = this.props;
    const { originLabels, originFixVersions } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        const subIssueType = store.getIssueTypes && store.getIssueTypes.find(t => t.typeCode === 'sub_task');
        const exitLabels = originLabels;
        const labelIssueRelDTOList = _.map(values.issueLink, (label) => {
          const target = _.find(exitLabels, { labelName: label.substr(0, 10) });
          if (target) {
            return target;
          } else {
            return ({
              labelName: label.substr(0, 10),
              projectId: AppState.currentMenuType.id,
            });
          }
        });
        const exitFixVersions = originFixVersions;
        const fixVersionIssueRelDTOList = _.map(values.fixVersionIssueRel
          && values.fixVersionIssueRel.filter(v => v && v.trim()), (version) => {
          const target = _.find(exitFixVersions, { name: version.trim() });
          if (target) {
            return {
              ...target,
              relationType: 'fix',
            };
          } else {
            return ({
              name: version.trim(),
              relationType: 'fix',
              projectId: AppState.currentMenuType.id,
            });
          }
        });
        const extra = {
          summary: values.summary,
          priorityId: values.priorityId,
          priorityCode: `priority-${values.priorityId}`,
          assigneeId: values.assigneedId,
          projectId: AppState.currentMenuType.id,
          parentIssueId: issueId,
          labelIssueRelDTOList,
          sprintId: sprint.sprintId || 0,
          versionIssueRelDTOList: fixVersionIssueRelDTOList,
          issueTypeId: subIssueType && subIssueType.id,
          remainingTime: estimatedTime,
          // estimatedTime: values.estimatedTime,
        };
        this.setState({ createLoading: true });
        const deltaOps = delta;
        if (deltaOps) {
          beforeTextUpload(deltaOps, extra, this.handleSave);
        } else {
          extra.description = '';
          this.handleSave(extra);
        }
      }
    });
  };

  handleSave = (data) => {
    const { fileList } = this.state;
    const { issueId, onOk } = this.props;
    const callback = (newFileList) => {
      this.setState({ fileList: newFileList });
    };
    createSubIssue(issueId, data)
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
      .catch((error) => {
      });
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
        estimatedTime: String(value).slice(0, 3), // 限制最长三位
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

  // 分派给我
  assigneeMe = () => {
    const {
      id, imageUrl, loginName, realName,
    } = AppState.userInfo;
    const { originUsers } = this.state;
    const { form } = this.props;
    const newUsers = originUsers.filter(user => user.id !== id);
    this.setState({
      originUsers: [
        ...newUsers,
        {
          id,
          imageUrl,
          loginName,
          realName,
          enabled: true,
        },
      ],
    }, () => {
      form.setFieldsValue({
        assigneedId: id,
      });
    });
  };

  render() {
    const {
      visible, onCancel, form, parentSummary,
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      defaultPriorityId,
      originPriorities,
      createLoading,
      estimatedTime,
    } = this.state;
    const callback = (value) => {
      this.setState({
        delta: value,
        edit: false,
      });
    };

    return (
      <Sidebar
        className="c7n-createSubIssue"
        title="创建子任务"
        visible={visible || false}
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={createLoading}
      >
        <div>
          <h2>
            {'在项目“'}
            {AppState.currentMenuType.name}
            {' ”中创建子任务'}
          </h2>
          <p style={{ width: 520, marginBottom: 24 }}>
            {' 请在下面输入子任务的详细信息，创建问题的子任务。子任务会与父级问题的冲刺、史诗保持一致，并且子任务的状态会受父级问题的限制。'}
          </p>
          <div style={{ width: 520, paddingBottom: 8, marginBottom: 12 }}>
            <Input label="父任务概要" value={parentSummary} disabled />
          </div>
          <Form layout="vertical">
            <FormItem label="子任务概要" style={{ width: 520 }}>
              {getFieldDecorator('summary', {
                rules: [{ required: true, message: '子任务概要为必输项' }],
              })(
                <Input label="子任务概要" maxLength={44} />,
              )}
            </FormItem>

            <FormItem label="优先级" style={{ width: 520 }}>
              {getFieldDecorator('priorityId', {
                rules: [{ required: true, message: '优先级为必选项' }],
                initialValue: defaultPriorityId,
              })(
                <Select
                  label="优先级"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {originPriorities.filter(p => p.enable).map(priority => (
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
                !this.state.edit && (
                  <div className="clear-p-mw">
                    <WYSIWYGEditor
                      value={this.state.delta}
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
                  style={{ marginTop: 0, paddingTop: 0, width: 520 }}
                  onChange={value => this.handleChangeEstimatedTime(value)}
                >
                  {storyPointList.map(sp => (
                    <Option key={sp.toString()} value={sp}>
                      {sp}
                    </Option>
                  ))}
                </Select>
              </div>
             
            }

            <FormItem label="经办人" style={{ width: 520, display: 'inline-block' }}>
              {getFieldDecorator('assigneedId', {})(
                <Select
                  label="经办人"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  loading={this.state.selectLoading}
                  filter
                  filterOption={false}
                  allowClear
                  onFilterChange={this.onFilterChange.bind(this)}
                >
                  {this.state.originUsers.filter(u => u.enabled).map(user => (
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
            <span
              onClick={this.assigneeMe}
              role="none"
              style={{
                display: 'inline-block',
                color: 'rgba(63, 81, 181)',
                marginLeft: 10,
                marginTop: 20,
                cursor: 'pointer',
              }}
            >
              {'分派给我'}
            </span>

            <FormItem label="冲刺" style={{ width: 520 }}>
              {getFieldDecorator('sprintId', {
                initialValue: this.state.sprint.sprintName,
                rules: [{}],
              })(
                <Input label="冲刺" disabled />,
              )}
            </FormItem>

            <FormItem label="版本" style={{ width: 520 }}>
              {getFieldDecorator('fixVersionIssueRel', {
                rules: [{ transform: value => (value ? value.toString() : value) }],
                normalize: value => (value ? value.map(s => s.toString().substr(0, 10)) : value), 
              })(
                <Select
                  label="版本"
                  mode={hasPermission ? 'tags' : 'multiple'}
                  loading={this.state.selectLoading}
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
                  {this.state.originFixVersions.map(version => <Option key={version.name} value={version.name}>{version.name}</Option>)}
                </Select>,
              )}
            </FormItem> 

            <FormItem label="标签" style={{ width: 520 }}>
              {getFieldDecorator('issueLink', {
                rules: [{ transform: value => (value ? value.toString() : value) }],
                normalize: value => (value ? value.map(s => s.toString().substr(0, 10)) : value), 
              })(
                <Select
                  label="标签"
                  mode="tags"
                  loading={this.state.selectLoading}
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
                  {this.state.originLabels.map(label => (
                    <Option key={label.labelName} value={label.labelName}>
                      {label.labelName}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          </Form>
          
          <div className="sign-upload" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', marginBottom: 13, alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>附件</div>
            </div>
            <div style={{ marginTop: -38 }}>
              <UploadButton
                onRemove={this.setFileList}
                onBeforeUpload={this.setFileList}
                fileList={this.state.fileList}
              />
            </div>
          </div>
        </div>
        {
          this.state.edit ? (
            <FullEditor
              initValue={this.state.delta}
              visible={this.state.edit}
              onCancel={() => this.setState({ edit: false })}
              onOk={callback}
            />
          ) : null
        }
      </Sidebar>
    );
  }
}
export default Form.create({})(CreateSubIssue);
