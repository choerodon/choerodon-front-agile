import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import { Select, Form, Input, DatePicker, Button, Modal, Tabs, Tooltip, Progress, Dropdown, Menu, Spin, Icon } from 'choerodon-ui';

import { STATUS, COLOR, TYPE, ICON, TYPE_NAME } from '../../common/Constant';
import './EditIssueNarrow.scss';
import '../../containers/main.scss';
import { UploadButtonNow, NumericInput, ReadAndEdit, IssueDescription } from '../CommonComponent';
import {
  delta2Html,
  escape,
  handleFileUpload,
  text2Delta,
  beforeTextUpload,
} from '../../common/utils';
import { loadSubtask, updateWorklog, deleteWorklog, createIssue, loadLabels, loadIssue, loadWorklogs, updateIssue, loadPriorities, loadComponents, loadVersions, loadEpics, createCommit, deleteCommit, updateCommit, loadUsers, deleteIssue, updateIssueType, loadSprints } from '../../api/NewIssueApi';
import { getCurrentOrg, getSelf, getUsers } from '../../api/CommonApi';
import WYSIWYGEditor from '../WYSIWYGEditor';
import FullEditor from '../FullEditor';
import DailyLog from '../DailyLog';
import CreateSubTask from '../CreateSubTask';
import { SERVICES_URL } from '../../common/Constant';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const TabPane = Tabs.TabPane;
const { TextArea } = Input;
const FormItem = Form.Item;
const confirm = Modal.confirm;
let sign = true;

class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectLoading: true,
      saveLoading: false,
      rollup: false,
      edit: false,
      addCommit: false,
      addCommitDes: '',
      dailyLogShow: false,
      createLoading: false,
      createSubTaskShow: false,
      editDesShow: false,
      origin: {},
      loading: true,
      nav: 'detail',
      editDes: undefined,
      editCommentId: undefined,
      editComment: undefined,
      editLogId: undefined,
      editLog: undefined,
      currentRae: undefined,

      issueId: undefined,
      assigneeId: undefined,
      assigneeName: '',
      epicId: undefined,
      estimateTime: undefined,
      remainingTime: undefined,
      epicName: '',
      issueNum: undefined,
      typeCode: 'story',
      parentIssueId: undefined,
      priorityCode: undefined,
      reporterId: undefined,
      sprintId: undefined,
      sprintName: '',
      statusId: undefined,
      statusCode: undefined,
      storyPoints: undefined,
      creationDate: undefined,
      lastUpdateDate: undefined,
      statusName: '',
      priorityName: '',
      reporterName: '',
      summary: '',
      description: '',
      versionIssueRelDTOList: [],
      componentIssueRelDTOList: [],

      worklogs: [],
      fileList: [],
      issueCommentDTOList: [],
      issueLinkDTOList: [],
      labelIssueRelDTOList: [],
      subIssueDTOList: [],
      fixVersions: [],
      influenceVersions: [],

      originpriorities: [],
      originComponents: [],
      originVersions: [],
      originLabels: [],
      originEpics: [],
      originUsers: [],
      originSprints: [],
      originFixVersions: [],
      originInfluenceVersions: [],
    };
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    loadIssue(this.props.issueId).then((res) => {
      this.setAnIssueToState(res);
    });
    loadWorklogs(this.props.issueId).then((res) => {
      this.setState({
        worklogs: res,
      });
    });
    document.getElementById('scroll-area').addEventListener('scroll', (e) => {
      if (sign) {
        const currentNav = this.getCurrentNav(e);
        if (this.state.nav !== currentNav && currentNav) {
          this.setState({
            nav: currentNav,
          });
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.issueId !== this.props.issueId) {
      loadIssue(nextProps.issueId).then((res) => {
        this.setAnIssueToState(res);
      });
      loadWorklogs(nextProps.issueId).then((res) => {
        this.setState({
          worklogs: res,
        });
      });
    }
  }

  onChangeFileList = (arr) => {
    if (arr.length > 0) {
      const config = {
        issueType: this.state.origin.typeCode,
        issueId: this.state.origin.issueId,
        fileName: arr[0].name || 'name',
        projectId: AppState.currentMenuType.id,
      };
      if (arr.some(one => !one.url)) {
        handleFileUpload(arr, this.addFileToFileList, config);
      }
    }
  }

  getCurrentNav(e) {
    let eles;
    if (this.state.typeCode !== 'sub_task') {
      eles = ['detail', 'des', 'attachment', 'commit', 'log', 'sub_task'];
    } else {
      eles = ['detail', 'des', 'attachment', 'commit', 'log'];
    }
    return _.find(eles, i => this.isInLook(document.getElementById(i)));
  }

  setAnIssueToState = (issue = this.state.origin) => {
    const { 
      assigneeId,
      assigneeName,
      componentIssueRelDTOList,
      creationDate,
      description,
      epicId,
      epicName,
      estimateTime,
      // issueAttachmentDTOList,
      issueCommentDTOList,
      issueId,
      issueLinkDTOList,
      issueNum,
      labelIssueRelDTOList,
      lastUpdateDate,
      objectVersionNumber,
      parentIssueId,
      parentIssueNum,
      priorityCode,
      priorityName,
      projectId,
      remainingTime,
      reporterId,
      reporterName,
      sprintId,
      sprintName,
      statusId,
      statusCode,
      statusName,
      storyPoints,
      summary,
      typeCode,
      versionIssueRelDTOList,
      subIssueDTOList,
    } = issue;
    const fileList = _.map(issue.issueAttachmentDTOList, issueAttachment => ({
      uid: issueAttachment.attachmentId,
      name: issueAttachment.fileName,
      url: issueAttachment.url,
    }));
    const fixVersions = _.filter(versionIssueRelDTOList, { relationType: 'fix' }) || [];
    const influenceVersions = _.filter(versionIssueRelDTOList, { relationType: 'influence' }) || [];
    this.setState({
      origin: issue,
      assigneeId,
      assigneeName,
      componentIssueRelDTOList,
      creationDate,
      editDes: description,
      description,
      epicId,
      epicName,
      estimateTime,
      fileList,
      // issueAttachmentDTOList,
      issueCommentDTOList,
      issueId,
      issueLinkDTOList,
      issueNum,
      labelIssueRelDTOList,
      lastUpdateDate,
      objectVersionNumber,
      parentIssueId,
      parentIssueNum,
      priorityCode,
      priorityName,
      projectId,
      remainingTime,
      reporterId,
      reporterName,
      sprintId,
      sprintName,
      statusId,
      statusCode,
      statusName,
      storyPoints,
      summary,
      typeCode,
      versionIssueRelDTOList,
      subIssueDTOList,
      fixVersions,
      influenceVersions,
    });
  }

  setFileList = (data) => {
    this.setState({ fileList: data });
  }

  isInLook(ele) {
    const a = ele.offsetTop;
    const target = document.getElementById('scroll-area');
    return a >= target.scrollTop && a < (target.scrollTop + target.offsetHeight);
  }

  addFileToFileList = (data) => {
    // const originFileList = _.slice(this.state.fileList);
    // this.setState({
    //   fileList: _.concat(originFileList, data),
    // });
    loadIssue(this.state.origin.issueId).then((res) => {
      this.setAnIssueToState(res);
    });
    loadWorklogs(this.state.origin.issueId).then((res) => {
      this.setState({
        worklogs: res,
      });
    });
  }

  handleFullEdit = (delta) => {
    this.setState({
      delta,
      edit: false,
    });
  }

  handleTypeChange = (value) => {
    this.setState({ type: value });
  }

  handleTitleChange = (e) => {
    this.setState({ summary: e.target.value });
  }

  handleEpicNameChange = (e) => {
    this.setState({ epicName: e.target.value });
  }

  resetSummary(value) {
    this.setState({ summary: value });
  }

  resetEpicName(value) {
    this.setState({ epicName: value });
  }

  resetPriorityCode(value) {
    this.setState({ priorityCode: value });
  }

  resetEpicId(value) {
    this.setState({ epicId: value });
  }

  resetSprintId(value) {
    this.setState({ sprintId: value });
  }

  resetComponentIssueRelDTOList(value) {
    this.setState({ componentIssueRelDTOList: value });
  }

  resetVersionIssueRelDTOList(value) {
    this.setState({ versionIssueRelDTOList: value });
  }

  resetInfluenceVersions(value) {
    this.setState({ influenceVersions: value });
  }

  resetFixVersions(value) {
    this.setState({ fixVersions: value });
  }

  resetlabelIssueRelDTOList(value) {
    this.setState({ labelIssueRelDTOList: value });
  }

  getWorkloads = () => {
    const worklogs = this.state.worklogs.slice();
    const workTimeArr = _.reduce(worklogs, (sum, v) => sum + (v.workTime || 0), 0);
    return workTimeArr;
  }

  refresh = () => {
    loadIssue(this.state.origin.issueId).then((res) => {
      this.setAnIssueToState(res);
    });
    loadWorklogs(this.state.origin.issueId).then((res) => {
      this.setState({
        worklogs: res,
      });
    });
  }

  updateIssue = (pro) => {
    const obj = {
      issueId: this.state.issueId,
      objectVersionNumber: this.state.origin.objectVersionNumber,
    };
    if ((pro === 'description' && this.state[pro]) || (pro === 'editDes' && this.state[pro])) {
      beforeTextUpload(this.state[pro], obj, updateIssue, 'description');
    } else {
      obj[pro] = this.state[pro] || 0;
      updateIssue(obj)
        .then((res) => {
          this.setAnIssueToState(res);
          if (this.props.onUpdate) {
            this.props.onUpdate();
          }
        });
    }
  }

  updateIssueSelect = (originPros, pros) => {
    const obj = {
      issueId: this.state.issueId,
      objectVersionNumber: this.state.origin.objectVersionNumber,
    };
    const origin = this.state[originPros];
    let target;
    let transPros;
    if (originPros === 'originLabels') {
      if (!this.state[pros].length) {
        transPros = [];
      } else if (typeof this.state[pros][0] !== 'string') {
        transPros = this.transToArr(this.state[pros], 'labelName', 'array');
      } else {
        transPros = this.state[pros];
      }
    } else if (!this.state[pros].length) {
      transPros = [];
    } else if (typeof this.state[pros][0] !== 'string') {
      transPros = this.transToArr(this.state[pros], 'name', 'array');
    } else {
      transPros = this.state[pros];
    }
    const out = _.map(transPros, (pro) => {
      if (origin.length && origin[0].name) {
        target = _.find(origin, { name: pro });
      } else {
        target = _.find(origin, { labelName: pro });
      }
      // const target = _.find(origin, { name: pro });
      if (target) {
        return target;
      } else if (originPros === 'originLabels') {
        return ({
          labelName: pro,
          // created: true,
          projectId: AppState.currentMenuType.id,
        });
      } else {
        return ({
          name: pro,
          // created: true,
          projectId: AppState.currentMenuType.id,
        });
      }
    });
    obj[pros] = out;
    updateIssue(obj)
      .then((res) => {
        this.setAnIssueToState(res);
        if (this.props.onUpdate) {
          this.props.onUpdate();
        }
      });
  }

  updateVersionSelect = (originPros, pros) => {
    const obj = {
      issueId: this.state.issueId,
      objectVersionNumber: this.state.origin.objectVersionNumber,
    };
    const origin = this.state[originPros];
    let target;
    let transPros;
    if (!this.state[pros].length) {
      transPros = [];
    } else if (typeof this.state[pros][0] !== 'string') {
      transPros = this.transToArr(this.state[pros], 'name', 'array');
    } else {
      transPros = this.state[pros];
    }
    const out = _.map(transPros, (pro) => {
      if (origin.length && origin[0].name) {
        target = _.find(origin, { name: pro });
      }
      if (target) {
        return ({
          ...target,
          relationType: pros === 'fixVersions' ? 'fix' : 'influence',
        });
      } else {
        return ({
          name: pro,
          relationType: pros === 'fixVersions' ? 'fix' : 'influence',
          projectId: AppState.currentMenuType.id,
        });
      }
    });
    obj.versionIssueRelDTOList = out.concat(this.state[pros === 'fixVersions' ? 'influenceVersions' : 'fixVersions']);
    updateIssue(obj)
      .then((res) => {
        this.setAnIssueToState(res);
        if (this.props.onUpdate) {
          this.props.onUpdate();
        }
      });
  }

  handleStoryPointsChange = (e) => {
    this.setState({ storyPoints: e });
  }

  handleRemainingTimeChange = (e) => {
    this.setState({ remainingTime: e });
  }

  resetStoryPoints(value) {
    this.setState({ storyPoints: value });
  }

  resetRemainingTime(value) {
    this.setState({ remainingTime: value });
  }

  resetAssigneeId(value) {
    this.setState({ assigneeId: value });
  }

  handleCreateIssue = () => {
    this.setState({ createLoading: true });
    const exitLabels = this.state.originLabels;
    const labelIssueRelDTOList = _.map(this.state.labels, (label) => {
      const target = _.find(exitLabels, { labelName: label });
      if (target) {
        return target;
      } else {
        return ({
          labelName: label,
          // created: true,
          projectId: AppState.currentMenuType.id,
        });
      }
    });
    const extra = {
      priorityCode: this.state.priorityCode,
      reporterId: 1001,
      statusCode: this.state.statusCode,
      summary: this.state.title,
      typeCode: this.state.type,
      workTime: this.state.workTime !== '' ? this.state.workTime : undefined,
      storyPoint: this.state.storyPoint !== '' ? this.state.storyPoint : undefined,
      labelIssueRelDTOList,
      parentIssueId: 0,
    };
    const deltaOps = this.state.delta;
    if (deltaOps) {
      beforeTextUpload(deltaOps, extra, this.handleSave);
    } else {
      extra.description = '';
      this.handleSave(extra);
    }
  };

  handleDeleteCommit(commentId) {
    deleteCommit(commentId)
      .then((res) => {
        const originComments = _.slice(this.state.issueCommentDTOList);
        _.remove(originComments, i => i.commentId === commentId);
        this.setState({
          issueCommentDTOList: originComments,
        });
      });
  }

  handleDeleteLog(logId) {
    deleteWorklog(logId)
      .then((res) => {
        const originLogs = _.slice(this.state.worklogs);
        _.remove(originLogs, i => i.logId === logId);
        this.setState({
          worklogs: originLogs,
        });
      });
  }

  handleCreateCommit() {
    const extra = {
      issueId: this.state.origin.issueId,
    };
    const addCommitDes = this.state.addCommitDes;
    if (addCommitDes) {
      beforeTextUpload(addCommitDes, extra, this.createCommit, 'commentText');
    } else {
      extra.commentText = '';
      this.createCommit(extra);
    }
  }

  handleUpdateCommit(comment) {
    const extra = {
      commentId: comment.commentId,
      objectVersionNumber: comment.objectVersionNumber,
    };
    const updateCommitDes = this.state.editComment;
    if (updateCommitDes) {
      beforeTextUpload(updateCommitDes, extra, this.updateCommit, 'commentText');
    } else {
      extra.commentText = '';
      this.updateCommit(extra);
    }
  }

  handleUpdateLog(log) {
    const extra = {
      logId: log.logId,
      objectVersionNumber: log.objectVersionNumber,
    };
    const updateLogDes = this.state.editLog;
    if (updateLogDes) {
      beforeTextUpload(updateLogDes, extra, this.updateLog, 'description');
    } else {
      extra.description = '';
      this.updateLog(extra);
    }
  }

  createCommit = (commit) => {
    createCommit(commit).then((res) => {
      const currentCommit = this.state.issueCommentDTOList.slice();
      currentCommit.push(res);
      this.setState({
        issueCommentDTOList: currentCommit,
        addCommit: false,
        addCommitDes: '',
      });
    });
  }

  updateCommit = (commit) => {
    updateCommit(commit).then((res) => {
      const originComments = _.slice(this.state.issueCommentDTOList);
      const index = _.findIndex(originComments, { commentId: commit.commentId });
      originComments[index] = res;
      // const currentCommit = this.state.issueCommentDTOList.slice();
      // currentCommit.push(res);
      this.setState({
        issueCommentDTOList: originComments,
        editCommentId: undefined,
        editComment: undefined,
      });
    });
  }

  updateLog = (log) => {
    updateWorklog(log.logId, log).then((res) => {
      const originLogs = _.slice(this.state.worklogs);
      const index = _.findIndex(originLogs, { logId: log.logId });
      originLogs[index] = res;
      // const currentCommit = this.state.issueCommentDTOList.slice();
      // currentCommit.push(res);
      this.setState({
        worklogs: originLogs,
        editLog: undefined,
        editLogId: undefined,
      });
    });
  }

  handleSave = (data) => {
    const fileList = this.state.fileList;
    const callback = (newFileList) => {
      this.setState({ fileList: newFileList });
    };
    createIssue(data)
      .then((res) => {
        if (fileList.length > 0) {
          const config = {
            issueType: res.statusCode,
            issueId: res.issueId,
            fileName: fileList[0].name,
            projectId: AppState.currentMenuType.id,
          };
          if (fileList.some(one => !one.url)) {
            handleFileUpload(this.state.fileList, callback, config);
          }
        }
        this.props.onOk();
      })
      .catch((error) => {
      });
  };

  transToArr(arr, pro, type = 'string') {
    if (!arr.length) {
      return type === 'string' ? '无' : [];
    } else if (typeof arr[0] === 'object') {
      return type === 'string' ? _.map(arr, pro).join() : _.map(arr, pro);
    } else {
      return type === 'string' ? arr.join() : arr;
    }
  }

  handleCreateSubIssue(subIssue) {
    const subIssues = this.state.subIssueDTOList;
    subIssues.push(subIssue);
    this.setState({
      subIssueDTOList: subIssues,
      createSubTaskShow: false,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }

  handleClickMenu(e) {
    if (e.key === '0') {
      this.setState({
        dailyLogShow: true,
      });
    } else if (e.key === '1') {
      // delete
      this.handleDeleteIssue(this.props.issueId);
      // deleteIssue(this.props.issueId)
      //   .then((res) => {
      //     this.props.onDeleteIssue();
      //   });
    } else if (e.key === '2') {
      this.setState({
        createSubTaskShow: true,
      });
    }
  }

  handleChangeType({ key }) {
    const issueupdateTypeDTO = {
      epicName: key === 'issue_epic' ? this.state.summary : undefined,
      issueId: this.state.origin.issueId,
      objectVersionNumber: this.state.origin.objectVersionNumber,
      typeCode: key,
    };
    updateIssueType(issueupdateTypeDTO)
      .then((res) => {
        loadIssue(this.props.issueId).then((response) => {
          this.setAnIssueToState(response);
          this.props.onUpdate();
        });
      });
    // this.setState({
    //   selectIssueType: key,
    // });
  }

  changeRae(currentRae) {
    this.setState({
      currentRae,
    });
  }

  handleDeleteIssue = (issueId) => {
    const that = this;
    confirm({
      width: 560,
      title: `删除问题${this.state.issueNum}`,
      content: <div style={{ marginBottom: 32 }}>
        <p style={{ marginBottom: 10 }}>请确认您要删除这个问题。</p>
        <p style={{ marginBottom: 10 }}>这个问题将会被彻底删除。包括所有附件和评论。</p>
        <p>如果您完成了这个问题，通常是已解决或者已关闭，而不是删除。</p>
      </div>,
      onOk() {
        return deleteIssue(issueId)
          .then((res) => {
            that.props.onDeleteIssue();
          });
      },
      onCancel() {},
      okText: '删除',
      okType: 'danger',
    });
  }

  scrollToAnchor = (anchorName) => {
    if (anchorName) {
      const anchorElement = document.getElementById(anchorName);
      if (anchorElement) {
        sign = false;
        anchorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          // inline: "nearest",
        });
        setTimeout(() => {
          sign = true;
        }, 2000);
      }
    }
  }

  renderCommits() {
    const delta = text2Delta(this.state.addCommitDes);
    const deltaEdit = text2Delta(this.state.editComment);

    return (
      <div>
        {
          this.state.addCommit && (
            <div className="line-start mt-10">
              <WYSIWYGEditor
                bottomBar
                value={delta}
                style={{ height: 200, width: '100%' }}
                onChange={(value) => {
                  this.setState({ addCommitDes: value });
                }}
                handleDelete={() => {
                  this.setState({
                    addCommit: false,
                    addCommitDes: '',
                  });
                }}
                handleSave={() => this.handleCreateCommit()}
              />
            </div>
          )
        }
        {
          this.state.issueCommentDTOList.map(commit => (
            <div className="c7n-commit">
              <div className="line-justify">
                <div className="c7n-title-commit">
                  <div className="c7n-avatar-commit">{commit.userName.slice(0, 1)}</div>
                  <span className="c7n-user-commit">{commit.userId}{commit.userName}</span>
                  <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>添加了评论</span>
                </div>
                <div className="c7n-action">
                  <Icon
                    role="none"
                    type="mode_edit mlr-3 pointer"
                    onClick={() => {
                      this.setState({
                        editCommentId: commit.commentId,
                        editComment: commit.commentText,
                      });
                    }}
                  />
                  <Icon
                    role="none"
                    type="delete_forever mlr-3 pointer"
                    onClick={() => this.handleDeleteCommit(commit.commentId)}
                  />
                </div>
              </div>
              <div className="line-start" style={{ color: 'rgba(0, 0, 0, 0.65)', marginTop: '10px', marginBottom: '10px' }}>
                - {commit.lastUpdateDate}
              </div>
              <div className="c7n-conent-commit">
                {
                  commit.commentId === this.state.editCommentId ? (
                    <WYSIWYGEditor
                      bottomBar
                      // toolbarHeight={66}
                      value={deltaEdit}
                      style={{ height: 200, width: '100%' }}
                      onChange={(value) => {
                        this.setState({ editComment: value });
                      }}
                      handleDelete={() => {
                        this.setState({
                          editCommentId: undefined,
                          editComment: undefined,
                        });
                      }}
                      handleSave={this.handleUpdateCommit.bind(this, commit)}
                    />
                  ) : (
                    <IssueDescription data={delta2Html(commit.commentText)} />
                  )
                }
              </div>
            </div>
          ))
        }
      </div>
    );
  }

  renderLogs() {
    const deltaEdit = text2Delta(this.state.editLog);
    return (
      <div>
        {
          this.state.worklogs.map(worklog => (
            <div className="c7n-commit">
              <div className="line-justify">
                <div className="c7n-title-commit">
                  <div className="c7n-avatar-commit">{worklog.userName.slice(0, 1)}</div>
                  <span className="c7n-user-commit">{worklog.userId}{worklog.userName}</span>
                  <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>记录了工作日志</span>
                </div>
                <div className="c7n-action">
                  <Icon
                    role="none"
                    type="mode_edit mlr-3 pointer"
                    onClick={() => {
                      this.setState({
                        editLogId: worklog.logId,
                        editLog: worklog.description,
                      });
                    }}
                  />
                  <Icon
                    role="none"
                    type="delete_forever mlr-3 pointer"
                    onClick={() => this.handleDeleteLog(worklog.logId)}
                  />
                </div>
              </div>
              <div className="line-start" style={{ color: 'rgba(0, 0, 0, 0.65)', marginTop: '10px', marginBottom: '10px' }}>
                - {worklog.lastUpdateDate}
              </div>
              <div className="line-start" style={{ color: 'rgba(0, 0, 0, 0.65)', marginTop: '10px', marginBottom: '10px' }}>
                <span style={{ width: 70 }}>耗费时间:</span>
                <span style={{ color: '#000', fontWeight: '500' }}>{`${worklog.workTime}h` || '无'}</span>
              </div>
              <div className="c7n-conent-commit" style={{ display: 'flex' }}>
                <span style={{ width: 70, flexShrink: 0, color: 'rgba(0, 0, 0, 0.65)' }}>备注:</span>
                <span style={{ flex: 1 }}>
                  {
                    worklog.logId !== this.state.editLogId ? (
                      <IssueDescription data={delta2Html(worklog.description)} />
                    ) : null
                  }
                </span>
              </div>
              {
                worklog.logId === this.state.editLogId ? (
                  <WYSIWYGEditor
                    bottomBar
                    // toolbarHeight={66}
                    value={deltaEdit}
                    style={{ height: 200, width: '100%' }}
                    onChange={(value) => {
                      this.setState({ editLog: value });
                    }}
                    handleDelete={() => {
                      this.setState({
                        editLogId: undefined,
                        editLog: undefined,
                      });
                    }}
                    handleSave={this.handleUpdateLog.bind(this, worklog)}
                  />
                ) : null
              }
            </div>
          ))
        }
      </div>
    );
  }

  renderRelatedIssues() {
    return (
      <div className="c7n-tasks">
        {
          this.state.subIssueDTOList.length ? 
            this.state.subIssueDTOList.map((subIssue, i) => this.renderSub(subIssue, i)) : (
              <div style={{ width: '100%', height: 350 }} />
            )
        }
      </div>
    );
  }

  renderSub(issue, i) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 10px',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          borderTop: !i ? '1px solid rgba(0, 0, 0, 0.12)' : '',
        }}
      >
        <Tooltip title={`任务类型： ${TYPE_NAME.sub_task}`}>
          <div
            className="c7n-sign"
            style={{
              backgroundColor: TYPE.sub_task,
              // display: 'inline-block',
              width: 20,
              height: 20,
              borderRadius: '50%',
              marginRight: '11px',
              textAlign: 'center',
              color: '#fff',
              flexShrink: 0,
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              style={{ fontSize: '14px' }}
              type={ICON.sub_task}
            />
          </div>
        </Tooltip>
        <Tooltip title={`子任务编号概要： ${issue.issueNum} ${issue.summary}`}>
          <div style={{ marginRight: '8px', flex: 1, overflow: 'hidden' }}>
            <p
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0 }}
              role="none"
              onClick={() => {
                // if (this.props.changeIssueId) {
                //  this.props.changeIssueId(issue.issueId);
                // } else {
                loadIssue(issue.issueId).then((res) => {
                  this.setAnIssueToState(res);
                });
                loadWorklogs(issue.issueId).then((res) => {
                  this.setState({
                    worklogs: res,
                  });
                });
                // }
              }}
            >
              {`${issue.issueNum} ${issue.summary}`}
            </p>
          </div>
        </Tooltip>
        <div style={{ width: '34px', marginRight: '15px', overflow: 'hidden' }}>
          <Tooltip title={`优先级： ${issue.priorityName}`}>
            <div
              className="c7n-level"
              style={{
                backgroundColor: COLOR[issue.priorityCode].bgColor,
                color: COLOR[issue.priorityCode].color,
                borderRadius: '2px',
                padding: '0 8px',
                display: 'inline-block',
              }}
            >
              { issue.priorityName }
            </div>
          </Tooltip>
        </div>
        {/* <div style={{ width: '18px', marginRight: '15px' }}>
          <Tooltip title={`任务负责人： ${issue.assigneeName}`}>
            <div className="c7n-avatar">{issue.assigneeName ? issue.assigneeName.slice(0, 1) : ''}</div>
          </Tooltip>
        </div> */}
        <div style={{ width: '48px', marginRight: '15px', display: 'flex', justifyContent: 'flex-end' }}>
          <div
            className="c7n-status"
            style={{
              background: issue.statusColor || STATUS[issue.statusCode],
              color: '#fff',
              padding: '0 4px',
              borderRadius: '2px',
            }}
          >
            { issue.statusName }
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
          }}
        >
          <Icon
            role="none"
            type="delete_forever mlr-3"
            onClick={() => {
              deleteIssue(issue.issueId).then((res) => {
                const originSubIssues = _.slice(this.state.subIssueDTOList);
                _.remove(originSubIssues, i => i.issueId === issue.issueId);
                this.setState({
                  subIssueDTOList: originSubIssues,
                });
              });
            }}
          />
        </div>
      </div>
    );
  }

  renderDes() {
    let delta;
    if (!this.state.description || this.state.editDesShow) {
      delta = text2Delta(this.state.editDes);
      return (
        <div className="line-start mt-10">
          <WYSIWYGEditor
            bottomBar
            value={delta}
            style={{ height: 200, width: '100%' }}
            onChange={(value) => {
              this.setState({ editDes: value });
            }}
            handleDelete={() => {
              this.setState({
                editDesShow: false,
                editDes: this.state.description,
              });
            }}
            handleSave={() => {
              this.setState({
                editDesShow: false,
                description: this.state.editDes,
              });
              this.updateIssue('editDes');
            }}
          />
        </div>
      );
    } else {
      delta = delta2Html(this.state.description);
      return (
        <div className="c7n-content-wrapper">
          <div
            className="line-start mt-10 c7n-description"
            role="none"
            onClick={() => {
              this.setState({
                editDesShow: true,
                editDes: this.state.description,
              });
            }}
          >
            <IssueDescription data={delta} />
          </div>
        </div>
      );
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk } = this.props;
    const getMenu = () => (
      <Menu onClick={this.handleClickMenu.bind(this)}>
        <Menu.Item key="0">
          登记工作日志
        </Menu.Item>
        <Menu.Item key="1">
          删除
        </Menu.Item>
        {
          this.state.typeCode !== 'sub_task' && (
            <Menu.Item key="2">
              创建子任务
            </Menu.Item>
          )
        }
      </Menu>
    );
    const callback = (value) => {
      this.setState({
        description: value,
        edit: false,
      }, () => {
        this.updateIssue('description');
      });
    };
    const callbackUpload = (newFileList) => {
      this.setState({ fileList: newFileList });
    };
    const typeList = (
      <Menu
        style={{
          background: '#fff',
          boxShadow: '0 5px 5px -3px rgba(0, 0, 0, 0.20), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)',
          borderRadius: '2px',
          // marginTop: 50,
        }}
        onClick={this.handleChangeType.bind(this)}
      >
        {
          _.remove(['story', 'task', 'bug', 'issue_epic'], n => n !== this.state.typeCode).map(type => (
            <Menu.Item key={type}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    backgroundColor: TYPE[type],
                    marginRight: 8,
                    display: 'inline-flex',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    textAlign: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    style={{ fontSize: '14px' }}
                    type={ICON[type]}
                  />
                </div>
                <span>
                  {TYPE_NAME[type]}
                </span>
              </div>
            </Menu.Item>
          ))
        }
      </Menu>
    );
    return (
      <div className="choerodon-modal-editIssue">
        <div className="c7n-nav">
          <div>
            <Dropdown overlay={typeList} trigger={['click']} disabled={this.state.typeCode === 'sub_task'}>
              <div style={{ height: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  className="radius"
                  style={{ background: TYPE[this.state.typeCode], color: '#fff', width: '20px', height: '20px', textAlign: 'center', lineHeight: '16px', fontSize: '14px', borderRadius: '50%' }}
                >
                  <Icon
                    style={{ fontSize: '14px' }}
                    type={ICON[this.state.typeCode]}
                  />
                </div>
                <Icon
                  type="arrow_drop_down"
                  style={{ fontSize: 16 }}
                />
              </div>
            </Dropdown>
          </div>
          <ul className="c7n-nav-ul">
            <Tooltip placement="right" title="详情">
              <li id="DETAILS-nav" className={`c7n-li ${this.state.nav === 'detail' ? 'c7n-li-active' : ''}`}>
                <a
                  role="none"
                  onClick={() => {
                    this.setState({
                      nav: 'detail',
                    });
                    this.scrollToAnchor('detail');
                  }}
                >
                  <Icon type="error_outline c7n-icon-li" />
                </a>
              </li>
            </Tooltip>
            <Tooltip placement="right" title="描述">
              <li id="DESCRIPTION-nav" className={`c7n-li ${this.state.nav === 'des' ? 'c7n-li-active' : ''}`}>
                <a
                  role="none"
                  onClick={() => {
                    this.setState({
                      nav: 'des',
                    });
                    this.scrollToAnchor('des');
                  }}
                >
                  <Icon type="subject c7n-icon-li" />
                </a>
              </li>
            </Tooltip>
            <Tooltip placement="right" title="附件">
              <li id="COMMENT-nav" className={`c7n-li ${this.state.nav === 'attachment' ? 'c7n-li-active' : ''}`}>
                <a
                  role="none"
                  onClick={() => {
                    this.setState({
                      nav: 'attachment',
                    });
                    this.scrollToAnchor('attachment');
                  }}
                >
                  <Icon type="attach_file c7n-icon-li" />
                </a>
              </li>
            </Tooltip>
            <Tooltip placement="right" title="评论">
              <li id="ATTACHMENT-nav" className={`c7n-li ${this.state.nav === 'commit' ? 'c7n-li-active' : ''}`}>
                <a
                  role="none"
                  onClick={() => {
                    this.setState({
                      nav: 'commit',
                    });
                    this.scrollToAnchor('commit');
                  }}
                >
                  <Icon type="sms_outline c7n-icon-li" />
                </a>
              </li>
            </Tooltip>
            <Tooltip placement="right" title="工作日志">
              <li id="LOG-nav" className={`c7n-li ${this.state.nav === 'log' ? 'c7n-li-active' : ''}`}>
                <a
                  role="none"
                  onClick={() => {
                    this.setState({
                      nav: 'log',
                    });
                    this.scrollToAnchor('log');
                  }}
                >
                  <Icon type="content_paste c7n-icon-li" />
                </a>
              </li>
            </Tooltip>
            {
              this.state.typeCode !== 'sub_task' && (
                <Tooltip placement="right" title="子任务">
                  <li id="SUB_TASKS-nav" className={`c7n-li ${this.state.nav === 'sub_task' ? 'c7n-li-active' : ''}`}>
                    <a
                      role="none"
                      onClick={() => {
                        this.setState({
                          nav: 'sub_task',
                        });
                        this.scrollToAnchor('sub_task');
                      }}
                    >
                      <Icon type="filter_none c7n-icon-li" />
                    </a>
                  </li>
                </Tooltip>
              )
            }
          </ul>
        </div>
        <div className="c7n-content">
          <div className="c7n-content-top">
            <div className="c7n-header-editIssue">
              <div className="c7n-content-editIssue" style={{ overflowY: 'hidden' }}>
                <div
                  className="line-justify"
                  style={{
                    height: '28px',
                    alignItems: 'center',
                    marginTop: '10px',
                    marginBottom: '3px',
                  }}
                >
                  <div style={{ fontSize: 16, lineHeight: '28px', fontWeight: 500 }}>
                    {
                      this.state.typeCode === 'sub_task' ? (
                        <span>
                          <span
                            role="none"
                            style={{ color: 'rgb(63, 81, 181)', cursor: 'pointer' }}
                            onClick={() => {
                              loadIssue(this.state.parentIssueId).then((res) => {
                                this.setAnIssueToState(res);
                              });
                              loadWorklogs(this.props.issueId).then((res) => {
                                this.setState({
                                  worklogs: res,
                                });
                              });
                            }}
                          >
                            {this.state.parentIssueNum}
                          </span>
                          <span style={{ paddingLeft: 10, paddingRight: 10 }}>/</span>
                        </span>
                      ) : null
                    }
                    <span>{this.state.issueNum}</span>
                  </div>
                  
                  
                  <div
                    style={{ cursor: 'pointer', fontSize: '13px', lineHeight: '20px', display: 'flex', alignItems: 'center' }}
                    role="none"
                    onClick={() => this.props.onCancel()}
                  >
                    <Icon type="last_page" style={{ fontSize: '18px', fontWeight: '500' }} />
                    <span>隐藏详情</span>
                  </div>
                </div>
                <div className="line-justify" style={{ marginBottom: 5, alignItems: 'flex-start' }}>
                  {/* <div style={{ fontSize: 13, lineHeight: '20px', fontWeight: 600 }}>
                    {this.state.org.name} - {AppState.currentMenuType.name}
                  </div> */}
                  <ReadAndEdit
                    callback={this.changeRae.bind(this)}
                    thisType="summary"
                    line
                    current={this.state.currentRae}
                    handleEnter
                    origin={this.state.summary}
                    onInit={() => this.setAnIssueToState()}
                    onOk={this.updateIssue.bind(this, 'summary')}
                    onCancel={this.resetSummary.bind(this)}
                    readModeContent={<div className="c7n-summary">
                      {this.state.summary}
                    </div>}
                  >
                    {/* <Input
                      // maxLength="30"
                      style={{ width: 250 }}
                      defaultValue={this.state.summary}
                      size="small"
                      autoFocus
                      onChange={this.handleTitleChange.bind(this)}
                    /> */}
                    <TextArea
                      // style={{ width: 290 }}
                      maxLength={44}
                      value={this.state.summary}
                      size="small"
                      autoFocus
                      onChange={this.handleTitleChange.bind(this)}
                      // autosize
                      onPressEnter={() => {
                        this.updateIssue('summary');
                        this.setState({
                          currentRae: undefined,
                        });
                      }}
                    />
                  </ReadAndEdit>
                  <div style={{ flexShrink: 0, color: 'rgba(0, 0, 0, 0.65)' }}>
                    <Dropdown overlay={getMenu()} trigger={['click']}>
                      <Button icon="more_vert" />
                    </Dropdown>
                  </div>
                </div>
                {
                  this.state.typeCode === 'issue_epic' ? (
                    <div className="line-justify" style={{ marginBottom: 5, alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0 }}>名称：</span>
                      <ReadAndEdit
                        callback={this.changeRae.bind(this)}
                        thisType="epicName"
                        current={this.state.currentRae}
                        handleEnter
                        line
                        origin={this.state.epicName}
                        onInit={() => this.setAnIssueToState()}
                        onOk={this.updateIssue.bind(this, 'epicName')}
                        onCancel={this.resetEpicName.bind(this)}
                        readModeContent={<div className="c7n-summary">
                          {this.state.epicName}
                        </div>}
                      >
                        <TextArea
                          maxLength={44}
                          value={this.state.epicName}
                          size="small"
                          autoFocus
                          onChange={this.handleEpicNameChange.bind(this)}
                          onPressEnter={() => {
                            this.updateIssue('epicName');
                            this.setState({
                              currentRae: undefined,
                            });
                          }}
                        />
                      </ReadAndEdit>
                    </div>
                  ) : null
                }
                <div className="line-start">
                  {
                    this.state.issueId && this.state.typeCode === 'story' ? (
                      <div style={{ display: 'flex', marginRight: 25 }}>
                        <span>故事点：</span>
                        <div>
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="storyPoints"
                            current={this.state.currentRae}
                            handleEnter
                            origin={this.state.storyPoints}
                            onInit={() => this.setAnIssueToState(this.state.origin)}
                            onOk={this.updateIssue.bind(this, 'storyPoints')}
                            onCancel={this.resetStoryPoints.bind(this)}
                            readModeContent={<span>
                              {this.state.storyPoints ? `${this.state.storyPoints} 点` : '无'}
                            </span>}
                          >
                            {/* <Input
                              defaultValue={this.state.storyPoints}
                              size="small"
                              autoFocus
                              onChange={this.handleStoryPointsChange.bind(this)}
                            /> */}
                            <NumericInput
                              maxLength="3"
                              value={this.state.storyPoints}
                              // size="large"
                              autoFocus
                              onChange={this.handleStoryPointsChange.bind(this)}
                              onPressEnter={() => {
                                this.updateIssue('storyPoints');
                                this.setState({
                                  currentRae: undefined,
                                });
                              }}
                            />
                          </ReadAndEdit>
                        </div>
                      </div>
                    ) : null
                  }
                  {
                    this.state.issueId && this.state.typeCode !== 'issue_epic' ? (
                      <div style={{ display: 'flex' }}>
                        <span>剩余时间：</span>
                        <div>
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="remainingTime"
                            current={this.state.currentRae}
                            handleEnter
                            origin={this.state.remainingTime}
                            onInit={() => this.setAnIssueToState(this.state.origin)}
                            onOk={this.updateIssue.bind(this, 'remainingTime')}
                            onCancel={this.resetRemainingTime.bind(this)}
                            readModeContent={<span>
                              {this.state.remainingTime ? `${this.state.remainingTime} 小时` : '无'}
                            </span>}
                          >
                            <NumericInput
                              maxLength="3"
                              value={this.state.remainingTime}
                              // size="large"
                              autoFocus
                              onChange={this.handleRemainingTimeChange.bind(this)}
                              onPressEnter={() => {
                                this.updateIssue('remainingTime');
                                this.setState({
                                  currentRae: undefined,
                                });
                              }}
                            />
                          </ReadAndEdit>
                        </div>
                      </div>
                    ) : null
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="c7n-content-bottom" id="scroll-area">
            <section className="c7n-body-editIssue">
              <div className="c7n-content-editIssue">
                <div className="c7n-details">
                  <div id="detail">
                    <div className="c7n-title-wrapper" style={{ marginTop: 0 }}>
                      <div className="c7n-title-left">
                        <Icon type="error_outline c7n-icon-title" />
                        <span>详情</span>
                      </div>
                      <div style={{ flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px' }} />
                    </div>
                    <div className="c7n-content-wrapper">
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            状态：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          {
                            this.state.statusId ? (
                              <div
                                style={{
                                  background: this.state.origin.statusColor || STATUS[this.state.statusCode],
                                  color: '#fff',
                                  borderRadius: '2px',
                                  padding: '0 8px',
                                  display: 'inline-block',
                                  margin: '2px auto 2px 0',
                                }}
                              >
                                { this.state.statusName }
                              </div>
                            ) : '无'
                          }
                        </div>
                      </div>
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            优先级：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="priorityCode"
                            current={this.state.currentRae}
                            origin={this.state.priorityCode}
                            onOk={this.updateIssue.bind(this, 'priorityCode')}
                            onCancel={this.resetPriorityCode.bind(this)}
                            onInit={() => {
                              this.setAnIssueToState();
                              loadPriorities().then((res) => {
                                this.setState({
                                  originpriorities: res.lookupValues,
                                });
                              });
                            }}
                            readModeContent={<div>
                              {
                                this.state.priorityCode ? (
                                  <div
                                    className="c7n-level"
                                    style={{
                                      backgroundColor: COLOR[this.state.priorityCode].bgColor,
                                      color: COLOR[this.state.priorityCode].color,
                                      borderRadius: '2px',
                                      padding: '0 8px',
                                      display: 'inline-block',
                                    }}
                                  >
                                    { this.state.priorityName }
                                  </div>
                                ) : '无'
                              }
                            </div>}
                          >
                            <Select
                              value={this.state.priorityCode}
                              style={{ width: '150px' }}
                              loading={this.state.selectLoading}
                              autoFocus
                              getPopupContainer={triggerNode => triggerNode.parentNode}
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
                              onChange={(value) => {
                                const priority = _.find(this.state.originpriorities,
                                  { valueCode: value });
                                this.setState({
                                  priorityCode: value,
                                  priorityName: priority.name,
                                });
                              }}
                            >
                              {
                                this.state.originpriorities.map(type => (
                                  <Option key={type.valueCode} value={type.valueCode}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                                      <div
                                        className="c7n-level"
                                        style={{
                                          backgroundColor: COLOR[type.valueCode].bgColor,
                                          color: COLOR[type.valueCode].color,
                                          borderRadius: '2px',
                                          padding: '0 8px',
                                          display: 'inline-block',
                                        }}
                                      >
                                        { type.name }
                                      </div>
                                    </div>
                                  </Option>
                                ),
                                )
                              }
                            </Select>
                          </ReadAndEdit>
                        </div>
                      </div>
                      {
                        this.state.typeCode !== 'sub_task' ? (
                          <div className="line-start mt-10">
                            <div className="c7n-property-wrapper">
                              <span className="c7n-property">
                                模块：
                              </span>
                            </div>
                            <div className="c7n-value-wrapper">
                              <ReadAndEdit
                                callback={this.changeRae.bind(this)}
                                thisType="componentIssueRelDTOList"
                                current={this.state.currentRae}
                                origin={this.state.componentIssueRelDTOList}
                                onInit={() => this.setAnIssueToState(this.state.origin)}
                                onOk={this.updateIssueSelect.bind(this, 'originComponents', 'componentIssueRelDTOList')}
                                onCancel={this.resetComponentIssueRelDTOList.bind(this)}
                                readModeContent={<div style={{ color: '#3f51b5' }}>
                                  {this.transToArr(this.state.componentIssueRelDTOList, 'name')}
                                </div>}
                              >
                                <Select
                                  value={this.transToArr(this.state.componentIssueRelDTOList, 'name', 'array')}
                                  loading={this.state.selectLoading}
                                  mode="tags"
                                  autoFocus
                                  getPopupContainer={triggerNode => triggerNode.parentNode}
                                  tokenSeparators={[',']}
                                  style={{ width: '200px', marginTop: 0, paddingTop: 0 }}
                                  onFocus={() => {
                                    this.setState({
                                      selectLoading: true,
                                    });
                                    loadComponents().then((res) => {
                                      this.setState({
                                        originComponents: res,
                                        selectLoading: false,
                                      });
                                    });
                                  }}
                                  onChange={value => this.setState({ componentIssueRelDTOList: value })}
                                >
                                  {this.state.originComponents.map(component =>
                                    (<Option
                                      key={component.name}
                                      value={component.name}
                                    >
                                      {component.name}
                                    </Option>),
                                  )}
                                </Select>
                              </ReadAndEdit>
                            </div>
                          </div>
                        ) : null
                      }
                      
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            标签：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="labelIssueRelDTOList"
                            current={this.state.currentRae}
                            origin={this.state.labelIssueRelDTOList}
                            onInit={() => this.setAnIssueToState(this.state.origin)}
                            onOk={this.updateIssueSelect.bind(this, 'originLabels', 'labelIssueRelDTOList')}
                            onCancel={this.resetlabelIssueRelDTOList.bind(this)}
                            readModeContent={<div>
                              {
                                this.state.labelIssueRelDTOList.length > 0 ? (
                                  <div style={{ display: 'flex' }}>
                                    {
                                      this.transToArr(this.state.labelIssueRelDTOList, 'labelName', 'array').map(label => (
                                        <div 
                                          style={{
                                            color: '#000',
                                            borderRadius: '100px',
                                            fontSize: '13px',
                                            lineHeight: '24px',
                                            padding: '2px 12px',
                                            background: 'rgba(0, 0, 0, 0.08)',
                                            marginRight: '8px',
                                          }}
                                        >
                                          {label}
                                        </div>
                                      ))
                                    }
                                  </div>
                                ) : '无'
                              }
                            </div>}
                          >
                            <Select
                              value={this.transToArr(this.state.labelIssueRelDTOList, 'labelName', 'array')}
                              mode="tags"
                              autoFocus
                              loading={this.state.selectLoading}
                              tokenSeparators={[',']}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              style={{ width: '200px', marginTop: 0, paddingTop: 0 }}
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
                              onChange={value => this.setState({ labelIssueRelDTOList: value })}
                            >
                              {this.state.originLabels.map(label =>
                                (<Option
                                  key={label.labelName}
                                  value={label.labelName}
                                >
                                  {label.labelName}
                                </Option>),
                              )}
                            </Select>
                          </ReadAndEdit>
                        </div>
                      </div>
                      {
                        this.state.typeCode !== 'sub_task' ? (
                          <div className="line-start mt-10">
                            <div className="c7n-property-wrapper">
                              <span className="c7n-property">
                                影响的版本：
                              </span>
                            </div>
                            <div className="c7n-value-wrapper">
                              <ReadAndEdit
                                callback={this.changeRae.bind(this)}
                                thisType="influenceVersions"
                                current={this.state.currentRae}
                                origin={this.state.influenceVersions}
                                onInit={() => this.setAnIssueToState(this.state.origin)}
                                onOk={this.updateVersionSelect.bind(this, 'originVersions', 'influenceVersions')}
                                onCancel={this.resetInfluenceVersions.bind(this)}
                                readModeContent={<div style={{ color: '#3f51b5' }}>
                                  {this.transToArr(this.state.influenceVersions, 'name')}
                                </div>}
                              >
                                <Select
                                  value={this.transToArr(this.state.influenceVersions, 'name', 'array')}
                                  mode="tags"
                                  autoFocus
                                  loading={this.state.selectLoading}
                                  getPopupContainer={triggerNode => triggerNode.parentNode}
                                  tokenSeparators={[',']}
                                  style={{ width: '200px', marginTop: 0, paddingTop: 0 }}
                                  onFocus={() => {
                                    this.setState({
                                      selectLoading: true,
                                    });
                                    loadVersions().then((res) => {
                                      this.setState({
                                        originVersions: res,
                                        selectLoading: false,
                                      });
                                    });
                                  }}
                                  onChange={value => this.setState({ influenceVersions: value })}
                                >
                                  {this.state.originVersions.map(version =>
                                    (<Option
                                      key={version.name}
                                      value={version.name}
                                    >
                                      {version.name}
                                    </Option>),
                                  )}
                                </Select>
                              </ReadAndEdit>
                            </div>
                          </div>
                        ) : null
                      }
                      
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            修复的版本：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="fixVersions"
                            current={this.state.currentRae}
                            origin={this.state.fixVersions}
                            onInit={() => this.setAnIssueToState(this.state.origin)}
                            onOk={this.updateVersionSelect.bind(this, 'originVersions', 'fixVersions')}
                            onCancel={this.resetFixVersions.bind(this)}
                            readModeContent={<div style={{ color: '#3f51b5' }}>
                              {this.transToArr(this.state.fixVersions, 'name')}
                            </div>}
                          >
                            <Select
                              value={this.transToArr(this.state.fixVersions, 'name', 'array')}
                              mode="tags"
                              autoFocus
                              loading={this.state.selectLoading}
                              tokenSeparators={[',']}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              style={{ width: '200px', marginTop: 0, paddingTop: 0 }}
                              onFocus={() => {
                                this.setState({
                                  selectLoading: true,
                                });
                                loadVersions().then((res) => {
                                  this.setState({
                                    originVersions: res,
                                    selectLoading: false,
                                  });
                                });
                              }}
                              onChange={value => this.setState({ fixVersions: value })}
                            >
                              {this.state.originVersions.map(version =>
                                (<Option
                                  key={version.name}
                                  value={version.name}
                                >
                                  {version.name}
                                </Option>),
                              )}
                            </Select>
                          </ReadAndEdit>
                        </div>
                      </div>
                      {
                        this.state.typeCode !== 'issue_epic' && this.state.typeCode !== 'sub_task' ? (
                          <div className="line-start mt-10">
                            <div className="c7n-property-wrapper">
                              <span className="c7n-property">
                                史诗：
                              </span>
                            </div>
                            <div className="c7n-value-wrapper">
                              <ReadAndEdit
                                callback={this.changeRae.bind(this)}
                                thisType="epicId"
                                current={this.state.currentRae}
                                origin={this.state.epicId}
                                onOk={this.updateIssue.bind(this, 'epicId')}
                                onCancel={this.resetEpicId.bind(this)}
                                onInit={() => {
                                  this.setAnIssueToState(this.state.origin);
                                  loadEpics().then((res) => {
                                    this.setState({
                                      originEpics: res,
                                    });
                                  });
                                }}
                                readModeContent={<div>
                                  {
                                    this.state.epicId ? (
                                      <div 
                                        style={{
                                          color: '#4d90fe',
                                          border: '1px solid #4d90fe',
                                          borderRadius: '2px',
                                          fontSize: '13px',
                                          lineHeight: '20px',
                                          padding: '0 8px',
                                          display: 'inline-block',
                                        }}
                                      >
                                        {this.state.epicName}
                                      </div>
                                    ) : '无'
                                  }
                                </div>}
                              >
                                <Select
                                  value={this.state.epicId || undefined}
                                  getPopupContainer={triggerNode => triggerNode.parentNode}
                                  style={{ width: '150px' }}
                                  autoFocus
                                  allowClear
                                  loading={this.state.selectLoading}
                                  onFocus={() => {
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
                                  onChange={(value) => {
                                    const epic = _.find(this.state.originEpics,
                                      { issueId: value * 1 });
                                    this.setState({
                                      epicId: value,
                                      // epicName: epic.epicName,
                                    });
                                  }}
                                >
                                  {this.state.originEpics.map(epic =>
                                    <Option key={`${epic.issueId}`} value={epic.issueId}>{epic.epicName}</Option>,
                                  )}
                                </Select>
                              </ReadAndEdit>
                              
                            </div>
                          </div>
                        ) : null
                      }
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            冲刺：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          {
                            this.state.typeCode !== 'sub_task' ? (
                              <ReadAndEdit
                                callback={this.changeRae.bind(this)}
                                thisType="sprintId"
                                current={this.state.currentRae}
                                origin={this.state.sprintId}
                                onOk={this.updateIssue.bind(this, 'sprintId')}
                                onCancel={this.resetSprintId.bind(this)}
                                onInit={() => {
                                  this.setAnIssueToState(this.state.origin);
                                  loadSprints().then((res) => {
                                    this.setState({
                                      originSprints: res,
                                    });
                                  });
                                }}
                                readModeContent={<div>
                                  {
                                    this.state.sprintId ? (
                                      <div 
                                        style={{
                                          color: '#4d90fe',
                                          border: '1px solid #4d90fe',
                                          borderRadius: '2px',
                                          fontSize: '13px',
                                          lineHeight: '20px',
                                          padding: '0 8px',
                                          display: 'inline-block',
                                        }}
                                      >
                                        {this.state.sprintName}
                                      </div>
                                    ) : '无'
                                  }
                                </div>}
                              >
                                <Select
                                  value={this.state.sprintId || undefined}
                                  getPopupContainer={triggerNode => triggerNode.parentNode}
                                  style={{ width: '150px' }}
                                  autoFocus
                                  allowClear
                                  loading={this.state.selectLoading}
                                  onFocus={() => {
                                    this.setState({
                                      selectLoading: true,
                                    });
                                    loadSprints().then((res) => {
                                      this.setState({
                                        originSprints: res,
                                        selectLoading: false,
                                      });
                                    });
                                  }}
                                  onChange={(value) => {
                                    const sprint = _.find(this.state.originSprints,
                                      { sprintId: value * 1 });
                                    this.setState({
                                      sprintId: value,
                                      // sprintName: sprint.sprintName,
                                    });
                                  }}
                                >
                                  {this.state.originSprints.map(sprint =>
                                    <Option key={`${sprint.sprintId}`} value={sprint.sprintId}>{sprint.sprintName}</Option>,
                                  )}
                                </Select>
                              </ReadAndEdit>
                            ) : (
                              <div>
                                {
                                  this.state.sprintId ? (
                                    <div 
                                      style={{
                                        color: '#4d90fe',
                                        border: '1px solid #4d90fe',
                                        borderRadius: '2px',
                                        fontSize: '13px',
                                        lineHeight: '20px',
                                        padding: '0 8px',
                                        display: 'inline-block',
                                      }}
                                    >
                                      {this.state.sprintName}
                                    </div>
                                  ) : '无'
                                }
                              </div>
                            )
                          }
                        </div>
                      </div>
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            时间跟踪：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Progress
                            style={{ width: 100 }}
                            percent={
                              this.getWorkloads() !== 0 ?
                                (this.getWorkloads() * 100) / (this.getWorkloads() + (this.state.origin.remainingTime || 0))
                                : 0
                            }
                            size="small"
                            status="success"
                          />
                          <span>
                            {this.getWorkloads()}h/{this.getWorkloads() + (this.state.origin.remainingTime || 0)}h
                          </span>
                          <span
                            role="none"
                            style={{
                              marginLeft: '8px',
                              color: '#3f51b5',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              this.setState({
                                dailyLogShow: true,
                              });
                            }}
                          >
                            登记工作
                          </span>
                        </div>
                      </div>
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-subtitle">
                            人员
                          </span>
                        </div>
                      </div>
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            报告人：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          {
                            this.state.reporterId ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  margin: '2px auto 2px 0',
                                }}
                              >
                                <span
                                  className="c7n-avatar"
                                >
                                  {this.state.reporterName.slice(0, 1)}
                                </span>
                                <span>
                                  {`${this.state.reporterName}`}
                                </span>
                              </div>
                            ) : '无'
                          }
                        </div>
                      </div>
                      <div className="line-start mt-10 assignee">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            经办人：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="assigneeId"
                            current={this.state.currentRae}
                            origin={this.state.assigneeId}
                            onOk={this.updateIssue.bind(this, 'assigneeId')}
                            onCancel={this.resetAssigneeId.bind(this)}
                            onInit={() => {
                              this.setAnIssueToState(this.state.origin);
                              getUsers().then((res) => {
                                this.setState({
                                  originUsers: res.content,
                                });
                              });
                            }}
                            readModeContent={<div>
                              {
                                this.state.assigneeId ? (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <span
                                      className="c7n-avatar"
                                    >
                                      {this.state.assigneeName ? this.state.assigneeName.slice(0, 1) : ''}
                                    </span>
                                    <span>
                                      {`${this.state.assigneeName}`}
                                    </span>
                                  </div>
                                ) : '无'
                              }
                            </div>}
                          >
                            <Select
                              value={this.state.assigneeId || undefined}
                              style={{ width: '150px' }}
                              loading={this.state.selectLoading}
                              allowClear
                              autoFocus
                              filter
                              filterOption={(input, option) =>
                                option.props.children.props.children[1].props.children.toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              onFocus={() => {
                                this.setState({
                                  selectLoading: true,
                                });
                                getUsers().then((res) => {
                                  this.setState({
                                    originUsers: res.content,
                                    selectLoading: false,
                                  });
                                });
                              }}
                              onChange={(value) => {
                                const user = _.find(this.state.originUsers,
                                  { id: value * 1 });
                                this.setState({
                                  assigneeId: value,
                                  // assigneeName: user ? `${user.loginName} ${user.realName}` : '',
                                });
                              }}
                            >
                              {this.state.originUsers.map(user =>
                                (<Option key={user.id} value={user.id}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                                    <div
                                      style={{ background: '#c5cbe8', color: '#6473c3', width: '20px', height: '20px', textAlign: 'center', lineHeight: '20px', borderRadius: '50%', marginRight: '8px' }}
                                    >
                                      {user.loginName ? user.loginName.slice(0, 1) : ''}
                                    </div>
                                    <span>{`${user.loginName} ${user.realName}`}</span>
                                  </div>
                                </Option>),
                              )}
                            </Select>
                          </ReadAndEdit>
                          <span
                            role="none"
                            style={{
                              // marginLeft: '50px',
                              color: '#3f51b5',
                              cursor: 'pointer',
                              marginTop: '-5px',
                              display: 'inline-block',
                            }}
                            onClick={() => {
                              getSelf().then((res) => {
                                if (res.id !== this.state.assigneeId) {
                                  this.setState({
                                    assigneeId: res.id,
                                    assigneeName: `${res.loginName}-${res.realName}`,
                                  }, () => {
                                    this.updateIssue('assigneeId');
                                  });
                                }
                              });
                            }}
                          >
                            指派给我
                          </span>
                        </div>
                      </div>

                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-subtitle">
                            日期
                          </span>
                        </div>
                      </div>
                      
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            创建时间：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          {this.state.creationDate || '无'}
                        </div>
                      </div>
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            更新时间：
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          {this.state.lastUpdateDate || '无'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="des">
                    <div className="c7n-title-wrapper">
                      <div className="c7n-title-left">
                        <Icon type="subject c7n-icon-title" />
                        <span>描述</span>
                      </div>
                      <div style={{ flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px' }} />
                      <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
                        <Button className="leftBtn" funcTyp="flat" onClick={() => this.setState({ edit: true })}>
                          <Icon type="zoom_out_map icon" style={{ marginRight: 2 }} />
                          <span>全屏编辑</span>
                        </Button>
                      </div>
                    </div>
                    {this.renderDes()}
                  </div>
                  
                </div>

                <div id="attachment">
                  <div className="c7n-title-wrapper">
                    <div className="c7n-title-left">
                      <Icon type="attach_file c7n-icon-title" />
                      <span>附件</span>
                    </div>
                    <div style={{ flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px', marginRight: '130px' }} />
                  </div>
                  <div className="c7n-content-wrapper" style={{ marginTop: '-47px' }}>
                    <UploadButtonNow
                      onRemove={this.setFileList}
                      onBeforeUpload={this.setFileList}
                      updateNow={this.onChangeFileList}
                      fileList={this.state.fileList}
                    />
                  </div>
                </div>

                <div id="commit">
                  <div className="c7n-title-wrapper">
                    <div className="c7n-title-left">
                      <Icon type="sms_outline c7n-icon-title" />
                      <span>评论</span>
                    </div>
                    <div style={{ flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px' }} />
                    <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
                      <Button className="leftBtn" funcTyp="flat" onClick={() => this.setState({ addCommit: true })}>
                        <Icon type="playlist_add icon" />
                        <span>添加评论</span>
                      </Button>
                    </div>
                  </div>
                  {this.renderCommits()}
                </div>

                <div id="log">
                  <div className="c7n-title-wrapper">
                    <div className="c7n-title-left">
                      <Icon type="content_paste c7n-icon-title" />
                      <span>工作日志</span>
                    </div>
                    <div style={{ flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px' }} />
                    <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
                      <Button className="leftBtn" funcTyp="flat" onClick={() => this.setState({ dailyLogShow: true })}>
                        <Icon type="playlist_add icon" />
                        <span>登记工作</span>
                      </Button>
                    </div>
                  </div>
                  {this.renderLogs()}
                </div>
                
                {
                  this.state.origin.typeCode !== 'sub_task' && (
                    <div id="sub_task">
                      <div className="c7n-title-wrapper">
                        <div className="c7n-title-left">
                          <Icon type="filter_none c7n-icon-title" />
                          <span>子任务</span>
                        </div>
                        <div style={{ flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px' }} />
                        <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
                          <Button className="leftBtn" funcTyp="flat" onClick={() => this.setState({ createSubTaskShow: true })}>
                            <Icon type="playlist_add icon" />
                            <span>创建子任务</span>
                          </Button>
                        </div>
                      </div>
                      {this.renderRelatedIssues()}
                    </div>
                  )
                }
              </div>
            </section>
          </div>
        </div>
        
        
        {
          this.state.edit ? (
            <FullEditor
              initValue={text2Delta(this.state.editDes)}
              visible={this.state.edit}
              onCancel={() => this.setState({ edit: false })}
              onOk={callback}
            />
          ) : null
        }
        {
          this.state.dailyLogShow ? (
            <DailyLog
              issueId={this.state.issueId}
              issueNum={this.state.issueNum}
              visible={this.state.dailyLogShow}
              onCancel={() => this.setState({ dailyLogShow: false })}
              onOk={() => {
                loadWorklogs(this.state.issueId).then((res) => {
                  this.setState({
                    worklogs: res,
                  });
                });
                loadIssue(this.state.issueId).then((res) => {
                  this.setAnIssueToState(res);
                });
                this.setState({ dailyLogShow: false });
              }}
            />
          ) : null
        }
        {
          this.state.createSubTaskShow ? (
            <CreateSubTask
              issueId={this.state.origin.issueId}
              visible={this.state.createSubTaskShow}
              onCancel={() => this.setState({ createSubTaskShow: false })}
              onOk={this.handleCreateSubIssue.bind(this)}
            />
          ) : null
        }
      </div>
    );
  }
}
export default Form.create({})(withRouter(CreateSprint));
