import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Form, Input, Button, Modal, Icon, Tooltip } from 'choerodon-ui';

import './CreateIssue.scss';
import '../../containers/main.scss';
import { UploadButton, NumericInput } from '../CommonComponent';
import { handleFileUpload, beforeTextUpload } from '../../common/utils';
import { loadIssue, loadLabels, loadPriorities, loadVersions, createSubIssue } from '../../api/NewIssueApi';
import { getUsers } from '../../api/CommonApi';
import { COLOR } from '../../common/Constant';
import WYSIWYGEditor from '../WYSIWYGEditor';
import FullEditor from '../FullEditor';
import UserHead from '../UserHead';
import TypeTag from '../TypeTag';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
let sign = false;

class CreateSubIssue extends Component {
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

      origin: {},
    };
  }

  componentDidMount() {
    loadIssue(this.props.issueId).then((res) => {
      this.setState({
        sprint: {
          sprintId: res.activeSprint ? res.activeSprint.sprintId || undefined : undefined,
          sprintName: res.activeSprint ? res.activeSprint.sprintName || '' : undefined,
        },
      });
    });
    this.loadPriorities();
    this.getProjectSetting();
  }

  getProjectSetting() {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`)
      .then((res) => {
        this.setState({
          origin: res,
        });
      });
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

  setFileList = (data) => {
    this.setState({ fileList: data });
  }

  loadPriorities() {
    loadPriorities().then((res) => {
      this.setState({
        originPriorities: res.lookupValues,
      });
    });
  }

  handleFullEdit = (delta) => {
    this.setState({
      delta,
      edit: false,
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

  handleCreateIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const exitLabels = this.state.originLabels;
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
        const exitFixVersions = this.state.originFixVersions;
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
          summary: values.summary,
          priorityCode: values.priorityCode,
          assigneeId: values.assigneedId,
          projectId: AppState.currentMenuType.id,
          parentIssueId: this.props.issueId,
          labelIssueRelDTOList,
          sprintId: this.state.sprint.sprintId || 0,
          versionIssueRelDTOList: fixVersionIssueRelDTOList,
        };
        this.setState({ createLoading: true });
        const deltaOps = this.state.delta;
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
    const fileList = this.state.fileList;
    const callback = (newFileList) => {
      this.setState({ fileList: newFileList });
    };
    createSubIssue(this.props.issueId, data)
      .then((res) => {
        if (fileList.length > 0) {
          const config = {
            issueType: res.statusId,
            issueId: res.issueId,
            fileName: fileList[0].name,
            projectId: AppState.currentMenuType.id,
          };
          if (fileList.some(one => !one.url)) {
            handleFileUpload(this.state.fileList, callback, config);
          }
        }
        this.props.onOk(res);
      })
      .catch((error) => {
      });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk } = this.props;
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
        confirmLoading={this.state.createLoading}
      >
        <div className="c7n-region-agile">
          <h2 className="c7n-space-first">在项目“{AppState.currentMenuType.name}”中创建子任务</h2>
          <p>
            请在下面输入子任务的详细信息，创建问题的子任务。子任务会与父级问题的冲刺、史诗保持一致，并且子任务的状态会受父级问题的限制。
          </p>
          <Form layout="vertical">
            <FormItem label="问题类型" style={{ width: 520 }}>
              {getFieldDecorator('typeCode', {
                initialValue: 'sub_task',
                rules: [{ required: true }],
              })(
                <Select
                  label="问题类型"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {['sub_task'].map(type => (
                    <Option key={type} value={type}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: 2 }}>
                        <TypeTag
                          type={{
                            typeCode: type,
                          }}
                        />
                        <span style={{ marginLeft: 8 }}>子任务</span>
                      </div>
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>

            <FormItem label="概要" style={{ width: 520 }}>
              {getFieldDecorator('summary', {
                rules: [{ required: true, message: '概要为必输项'}],
              })(
                <Input label="概要" maxLength={44} />,
              )}
            </FormItem>

            <FormItem label="优先级" style={{ width: 520 }}>
              {getFieldDecorator('priorityCode', {
                rules: [{ required: true, message: '优先级为必选项' }],
                initialValue: this.state.origin.defaultPriorityCode,
              })(
                <Select
                  label="优先级"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
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

            <div>
              <div style={{ display: 'flex', marginBottom: 13, alignItems: 'center' }}>
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
            <Tooltip title={'可自行选择经办人，如不选择，会应用模块的默认经办人逻辑和项目的默认经办人策略'}>
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


            <FormItem label="冲刺" style={{ width: 520 }}>
              {getFieldDecorator('sprintId', {
                initialValue: this.state.sprint.sprintName,
                rules: [{}],
              })(
                <Input label="冲刺" disabled />,
              )}
            </FormItem>

            <FormItem label="修复版本" style={{ width: 520 }}>
              {getFieldDecorator('fixVersionIssueRel', {
                rules: [{ transform: value => (value ? value.toString() : value) }],
              })(
                <Select
                  label="修复版本"
                  mode="tags"
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
                  {this.state.originFixVersions.map(version =>
                    <Option key={version.name} value={version.name}>{version.name}</Option>,
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
                  {this.state.originLabels.map(label =>
                    <Option key={label.labelName} value={label.labelName}>{label.labelName}</Option>,
                  )}
                </Select>,
              )}
            </FormItem>
          </Form>
          
          <div className="sign-upload" style={{ marginTop: 38 }}>
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
export default Form.create({})(withRouter(CreateSubIssue));
