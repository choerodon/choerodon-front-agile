import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Form, Input, Button, Modal, Spin, Icon } from 'choerodon-ui';

import './CreateIssue.scss';
import '../../containers/main.scss';
import { UploadButton, NumericInput } from '../CommonComponent';
import {
  delta2Html,
  escape,
  handleFileUpload,
  text2Delta,
  beforeTextUpload,
} from '../../common/utils';
import { loadIssue, createIssue, loadLabels, loadStatus, loadPriorities, loadVersions, loadSprints, loadComponents, loadEpics, createSubIssue } from '../../api/NewIssueApi';
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
const TYPE = {
  sub_task: '#4d90fe',
};
const ICON = {
  sub_task: 'assignment',
};
const NAME = {
  sub_task: '子任务',
};
class CreateSprint extends Component {
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
      originVersions: [],
      originComponents: [],
      originEpics: [],
      originStatus: [],
      originpriorities: [],
      originInfluenceVersions: [],
      originFixVersions: [],
      originSprints: [],
      originUsers: [],

      storyPoints: '',
      storyPointsUnit: 'h',
      time: '',
      timeUnit: 'h',
    };
  }

  componentDidMount() {
    loadIssue(this.props.issueId).then((res) => {
      this.setState({
        sprint: {
          sprintId: res.sprintId,
          sprintName: res.sprintName || '',
        },
      });
    });
  }

  setFileList = (data) => {
    this.setState({ fileList: data });
  }

  handleFullEdit = (delta) => {
    this.setState({
      delta,
      edit: false,
    });
  }

  handleChangeStoryPoints = (e) => {
    this.setState({ storyPoints: e });
  }

  handleChangeStoryPointsUnit = (value) => {
    this.setState({ storyPointsUnit: value });
  }

  handleChangeTime = (e) => {
    this.setState({ time: e });
  }

  handleChangeTimeUnit = (value) => {
    this.setState({ timeUnit: value });
  }

  transformTime(pro, unit) {
    const TIME = {
      h: 1,
      d: 8,
      w: 40,
    };
    if (!this.state[pro]) {
      return 0;
    } else {
      return this.state[pro] * TIME[this.state[unit]];
    }
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
          assigneeId: values.assigneedId ? JSON.parse(values.assigneedId).id || 0 : 0,
          projectId: AppState.currentMenuType.id,
          parentIssueId: this.props.issueId,
          versionIssueRelDTOList: fixVersionIssueRelDTOList,
          labelIssueRelDTOList,
          remainingTime: this.transformTime('time', 'timeUnit'),
          sprintId: this.state.sprint.sprintId || 0,
        };
        this.setState({ createLoading: true });
        const deltaOps = this.state.delta;
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
        className="choerodon-modal-createSprint"
        title="创建子任务"
        visible={visible || false}
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <div className="c7n-region">
          <h2 className="c7n-space-first">在项目“{AppState.currentMenuType.name}”中创建子任务</h2>
          <p>
            请在下面输入子任务的详细信息，创建问题的子任务。子任务会与父级问题的冲刺、史诗保持一致，并且子任务的状态会受父级问题的限制。
            {/* <a href="http://c7n.saas.hand-china.com/docs/devops/develop/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
              了解详情
              </span>
              <Icon type="open_in_new" />
            </a> */}
          </p>
          <Form layout="vertical">
            <FormItem label="问题类型" style={{ width: '512px' }}>
              {getFieldDecorator('typeCode', {
                initialValue: 'sub_task',
                rules: [
                  {
                    required: true,
                  },
                ],
              })(
                <Select
                  label="问题类型"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {['sub_task'].map(type => (
                    <Option key={`${type}`} value={`${type}`}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                        <TypeTag
                          type={{
                            typeCode: type,
                          }}
                        />
                        <span style={{ marginLeft: 8 }}>{NAME[type]}</span>
                      </div>
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>

            <FormItem label="概要" style={{ width: '512px' }}>
              {getFieldDecorator('summary', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message: '概要为必输项',
                  },
                ],
              })(
                <Input label="概要" maxLength={44} />,
              )}
            </FormItem>

            <FormItem label="经办人" style={{ width: '512px' }}>
              {getFieldDecorator('assigneedId', {
                rules: [
                  {
                  },
                ],
              })(
                <Select
                  label="经办人"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  loading={this.state.selectLoading}
                  filter
                  allowClear
                  onFilterChange={(input) => {
                    this.setState({
                      selectLoading: true,
                    });
                    getUsers(input).then((res) => {
                      this.setState({
                        originUsers: res.content,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originUsers.map(user =>
                    (<Option key={JSON.stringify(user)} value={JSON.stringify(user)}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
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

            <div>
              <div style={{ display: 'flex', marginBottom: '13px', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold' }}>描述</div>
                <div style={{ marginLeft: '80px' }}>
                  <Button className="leftBtn" funcTyp="flat" onClick={() => this.setState({ edit: true })} style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon type="zoom_out_map" style={{ color: '#3f51b5', fontSize: '18px', marginRight: '12px' }} />
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

            <FormItem label="优先级" style={{ width: '512px' }}>
              {getFieldDecorator('priorityCode', {
                rules: [
                  {
                    required: true,
                    message: '优先级为必选项',
                  },
                ],
              })(
                <Select
                  label="优先级"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  loading={this.state.selectLoading}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    loadPriorities().then((res) => {
                      this.setState({
                        originpriorities: res.lookupValues,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.transformPriorityCode(this.state.originpriorities).map(type =>
                    (<Option key={`${type.valueCode}`} value={`${type.valueCode}`}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                        <div
                          style={{ color: COLOR[type.valueCode].color, width: '20px', height: '20px', textAlign: 'center', lineHeight: '20px', borderRadius: '50%', marginRight: '8px' }}
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

            <FormItem label="冲刺" style={{ width: '512px' }}>
              {getFieldDecorator('sprintId', {
                initialValue: this.state.sprint.sprintName,
                rules: [
                  {
                  },
                ],
              })(
                <Input label="冲刺" disabled />,
              )}
            </FormItem>

            <FormItem label="修复版本" style={{ width: '512px' }}>
              {getFieldDecorator('fixVersionIssueRel', {
                rules: [
                  {
                    transform: value => (value ? value.toString() : value),
                  },
                ],
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
                    loadVersions().then((res) => {
                      this.setState({
                        originFixVersions: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originFixVersions.map(label =>
                    (<Option
                      key={label.name}
                      value={label.name}
                    >
                      {label.name}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>

            <FormItem label="标签" style={{ width: '512px' }}>
              {getFieldDecorator('issueLink', {
                rules: [
                  {
                    transform: value => (value ? value.toString() : value),
                  },
                ],
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
                  {this.state.originLabels.map(component =>
                    (<Option
                      key={component.labelName}
                      value={component.labelName}
                    >
                      {component.labelName}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>

            <div style={{ marginBottom: '24px' }}>
              <NumericInput
                label="预计剩余时间"
                style={{ lineHeight: '22px', marginBottom: 0, width: 100 }}
                value={this.state.time}
                onChange={this.handleChangeTime.bind(this)}
              />
              <Select
                style={{ width: 100, marginLeft: 18 }}
                value={this.state.timeUnit}
                onChange={this.handleChangeTimeUnit.bind(this)}
              >
                {['h', 'd', 'w'].map(type => (
                  <Option key={`${type}`} value={`${type}`}>
                    {type}
                  </Option>),
                )}
              </Select>
            </div>
          </Form>
          
          <div className="sign-upload" style={{ marginTop: '38px' }}>
            <div style={{ display: 'flex', marginBottom: '13px', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>附件</div>
            </div>
            <div style={{ marginTop: '-38px' }}>
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
export default Form.create({})(withRouter(CreateSprint));
