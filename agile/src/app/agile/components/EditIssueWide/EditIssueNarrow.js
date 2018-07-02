import React, { Component } from 'react';
import { stores, axios, Permission } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Input, DatePicker, Button, Modal, Tabs, Tooltip, Progress, Dropdown, Menu, Spin, Icon } from 'choerodon-ui';
import { STATUS, COLOR, TYPE, ICON, TYPE_NAME } from '../../common/Constant';
import './EditIssueNarrow.scss';
import '../../containers/main.scss';
import { UploadButtonNow, NumericInput, ReadAndEdit, IssueDescription } from '../CommonComponent';
import { delta2Html, handleFileUpload, text2Delta, beforeTextUpload, formatDate, returnBeforeTextUpload } from '../../common/utils';
import { loadDatalogs, loadLinkIssues, loadSubtask, updateWorklog, deleteWorklog, createIssue, loadLabels, loadIssue, loadWorklogs, updateIssue, loadPriorities, loadComponents, loadVersions, loadEpics, createCommit, deleteCommit, updateCommit, loadUsers, deleteIssue, updateIssueType, loadSprints, loadStatus } from '../../api/NewIssueApi';
import { getSelf, getUsers, getUser } from '../../api/CommonApi';
import WYSIWYGEditor from '../WYSIWYGEditor';
import FullEditor from '../FullEditor';
import DailyLog from '../DailyLog';
import CreateSubTask from '../CreateSubTask';
import CreateLinkTask from '../CreateLinkTask';
import UserHead from '../UserHead';
import Comment from '../EditIssueNarrow/Component/Comment';
import Log from '../EditIssueNarrow/Component/Log';
import DataLogs from '../EditIssueNarrow/Component/DataLogs';
import DataLog from '../EditIssueNarrow/Component/DataLog';
import IssueList from '../EditIssueNarrow/Component/IssueList';
import LinkList from '../EditIssueNarrow/Component/LinkList';

const { AppState } = stores;
const { Option } = Select;
const { TextArea } = Input;
const confirm = Modal.confirm;
let sign = true;
let flag;
const STATUS_ICON = {
  done: {
    icon: 'check_circle',
    color: '#1bb06e',
    bgColor: '',
  },
  todo: {
    icon: 'watch_later',
    color: '#4a93fc',
    bgColor: '',
  },
  doing: {
    icon: 'timelapse',
    color: '#ffae02',
    bgColor: '',
  },
};

class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag: undefined,
      selectLoading: true,
      saveLoading: false,
      rollup: false,
      edit: false,
      addCommit: false,
      addCommitDes: '',
      dailyLogShow: false,
      createLoading: false,
      createSubTaskShow: false,
      createLinkTaskShow: false,
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
      assigneeImageUrl: undefined,
      epicId: undefined,
      estimateTime: undefined,
      remainingTime: undefined,
      epicName: '',
      issueNum: undefined,
      typeCode: 'story',
      parentIssueId: undefined,
      priorityCode: undefined,
      reporterId: undefined,
      reporterImageUrl: undefined,
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
      activeSprint: {},
      closeSprint: [],

      worklogs: [],
      datalogs: [],
      fileList: [],
      issueCommentDTOList: [],
      issueLinkDTOList: [],
      labelIssueRelDTOList: [],
      subIssueDTOList: [],
      linkIssues: [],
      fixVersions: [],
      influenceVersions: [],

      originStatus: [],
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
    this.reloadIssue(this.props.issueId);
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
      this.reloadIssue(nextProps.issueId);
    }
  }

  /**
   * Attachment
   */
  onChangeFileList = (arr) => {
    if (arr.length > 0 && arr.some(one => !one.url)) {
      const config = {
        issueType: this.state.origin.typeCode,
        issueId: this.state.origin.issueId,
        fileName: arr[0].name || 'AG_ATTACHMENT',
        projectId: AppState.currentMenuType.id,
      };
      handleFileUpload(arr, this.addFileToFileList, config);
    }
  }

  /**
   * Attachment
   */
  addFileToFileList = (data) => {
    this.reloadIssue();
  }

  /**
   * Attachment
   */
  setFileList = (data) => {
    this.setState({ fileList: data });
  }
  
  setAnIssueToState = (issue = this.state.origin) => {
    const {
      activeSprint,
      assigneeId,
      assigneeName,
      assigneeImageUrl,
      closeSprint,
      componentIssueRelDTOList,
      creationDate,
      description,
      epicId,
      epicName,
      estimateTime,
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
      reporterImageUrl,
      sprintId,
      sprintName,
      statusId,
      statusCode,
      statusName,
      statusColor,
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
      activeSprint: activeSprint || {},
      assigneeId,
      assigneeName,
      assigneeImageUrl,
      closeSprint,
      componentIssueRelDTOList,
      creationDate,
      editDes: description,
      description,
      epicId,
      epicName,
      estimateTime,
      fileList,
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
      reporterImageUrl,
      sprintId,
      sprintName,
      statusId,
      statusCode,
      statusName,
      statusColor,
      storyPoints,
      summary,
      typeCode,
      versionIssueRelDTOList,
      subIssueDTOList,
      fixVersions,
      influenceVersions,
    });
  }

  getCurrentNav(e) {
    let eles;
    if (this.state.typeCode !== 'sub_task') {
      eles = ['detail', 'des', 'attachment', 'commit', 'log', 'data_log', 'sub_task', 'link_task' ];
    } else {
      eles = ['detail', 'des', 'attachment', 'commit', 'log', 'data_log'];
    }
    return _.find(eles, i => this.isInLook(document.getElementById(i)));
  }

  isInLook(ele) {
    const a = ele.offsetTop;
    const target = document.getElementById('scroll-area');
    return a >= target.scrollTop && a < (target.scrollTop + target.offsetHeight);
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

  handleTitleChange = (e) => {
    this.setState({ summary: e.target.value });
  }

  handleEpicNameChange = (e) => {
    this.setState({ epicName: e.target.value });
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

  resetReporterId(value) {
    this.setState({ reporterId: value });
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

  resetStatusId(value) {
    this.setState({ statusId: value });
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
    const worklogs = this.state.worklogs;
    if (!Array.isArray(worklogs)) {
      return 0;
    }
    const workTimeArr = _.reduce(worklogs, (sum, v) => sum + (v.workTime || 0), 0);
    return workTimeArr;
  }

  reloadIssue(issueId = this.state.origin.issueId) {
    this.setState({
      addCommit: false,
      addCommitDes: '',
      editDesShow: undefined,
      editDes: undefined,
      editCommentId: undefined,
      editComment: undefined,
      editLogId: undefined,
      editLog: undefined,
    }, () => {
      loadIssue(issueId).then((res) => {
        this.setAnIssueToState(res);
      });
      loadWorklogs(issueId).then((res) => {
        this.setState({
          worklogs: res,
        });
      });
      loadLinkIssues(issueId).then((res) => {
        this.setState({
          linkIssues: res,
        });
      });
      loadDatalogs(issueId).then((res) => {
        this.setState({
          datalogs: res,
        });
      });
      this.setState({
        editDesShow: false,
      });
    });
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
    if ((pro === 'description') || (pro === 'editDes')) {
      if (this.state[pro]) {
        returnBeforeTextUpload(this.state[pro], obj, updateIssue, 'description')
          .then((res) => {
            this.reloadIssue(this.state.origin.issueId);
          });
      }
    } else if (pro === 'assigneeId' || pro === 'reporterId') {
      obj[pro] = this.state[pro] ? JSON.parse(this.state[pro]).id || 0 : 0;
      updateIssue(obj)
        .then((res) => {
          this.reloadIssue();
          if (this.props.onUpdate) {
            this.props.onUpdate();
          }
        });
    } else {
      obj[pro] = this.state[pro] || 0;
      updateIssue(obj)
        .then((res) => {
          this.reloadIssue();
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
        this.reloadIssue();
        if (this.props.onUpdate) {
          this.props.onUpdate();
        }
      });
  }

  updateVersionSelect = (originPros, pros) => {
    const obj = {
      issueId: this.state.issueId,
      objectVersionNumber: this.state.origin.objectVersionNumber,
      versionType: pros === 'fixVersions' ? 'fix' : 'influence',
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
    obj.versionIssueRelDTOList = out;
    // obj.versionIssueRelDTOList = out.concat(this.state[pros === 'fixVersions' ? 'influenceVersions' : 'fixVersions']);
    updateIssue(obj)
      .then((res) => {
        this.reloadIssue();
        if (this.props.onUpdate) {
          this.props.onUpdate();
        }
      });
  }

  /**
   * Comment
   */
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

  /**
   * Comment
   */
  createCommit = (commit) => {
    createCommit(commit).then((res) => {
      this.reloadIssue();
      this.setState({
        addCommit: false,
        addCommitDes: '',
      });
    });
  }

  transToArr(arr, pro, type = 'string') {
    if (!arr.length) {
      return type === 'string' ? '无' : [];
    } else if (typeof arr[0] === 'object') {
      return type === 'string' ? _.map(arr, pro).join() : _.map(arr, pro);
    } else {
      return type === 'string' ? arr.join() : arr;
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

  handleCreateSubIssue(subIssue) {
    this.reloadIssue();
    this.setState({
      createSubTaskShow: false,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }

  handleCreateLinkIssue() {
    this.reloadIssue();
    this.setState({
      createLinkTaskShow: false,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }


  handleClickMenu(e) {
    if (e.key === '0') {
      this.setState({ dailyLogShow: true });
    } else if (e.key === 'item_1') {
      this.handleDeleteIssue(this.state.origin.issueId);
    } else if (e.key === '2') {
      this.setState({ createSubTaskShow: true });
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
          this.reloadIssue(this.state.origin.issueId);
          this.props.onUpdate();
        });
      });
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

  /**
   * Comment
   */
  renderCommits() {
    const delta = text2Delta(this.state.addCommitDes);
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
          this.state.issueCommentDTOList.map(comment => (
            <Comment
              comment={comment}
              onDeleteComment={() => this.reloadIssue()}
              onUpdateComment={() => this.reloadIssue()}
            />
          ))
        }
      </div>
    );
  }

  /**
   * Log
   */
  renderLogs() {
    return (
      <div>
        {
          this.state.worklogs.map(worklog => (
            <Log
              worklog={worklog}
              onDeleteLog={() => this.reloadIssue()}
              onUpdateLog={() => this.reloadIssue()}
            />
          ))
        }
      </div>
    );
  }

  /**
   * DataLog
   */
  renderDataLogs() {
    return (
      <DataLogs
        datalogs={this.state.datalogs}
      />
    );
    // return (
    //   <div>
    //     {
    //       this.state.datalogs.map((datalog, i) => (
    //         <DataLog
    //           i={i}
    //           datalog={datalog}
    //           origin={this.state.datalogs}
    //         />
    //       ))
    //     }
    //   </div>
    // );
  }

  /**
   * SubIssue
   */
  renderSubIssues() {
    return (
      <div className="c7n-tasks">
        {
          this.state.subIssueDTOList.map((subIssue, i) => this.renderIssueList(subIssue, i))
        }
      </div>
    );
  }

  renderLinkIssues() {
    const group = _.groupBy(this.state.linkIssues, 'ward');
    return (
      <div className="c7n-tasks">
        {
          _.map(group, (v, k) => (
            <div>
              <div style={{ margin: '7px auto' }}>{k}</div>
              {
                _.map(v, (linkIssue, i) => this.renderLinkList(linkIssue, i))
              }
            </div>
          ))
        }
      </div>
    );
  }

  /**
   * IssueList
   * @param {*} issue 
   * @param {*} i 
   */
  renderIssueList(issue, i) {
    return (
      <IssueList
        issue={{
          ...issue,
          typeCode: issue.typeCode || 'sub_task',
        }}
        i={i}
        onOpen={(issueId, linkedIssueId) => {
          this.reloadIssue(issue.issueId);
        }}
        onRefresh={() => {
          this.reloadIssue(this.state.origin.issueId);
        }}
      />
    );
  }

  renderLinkList(link, i) {
    return (
      <LinkList
        issue={{
          ...link,
          typeCode: link.typeCode,
        }}
        i={i}
        onOpen={(issueId, linkedIssueId) => {
          this.reloadIssue(issueId === this.state.origin.issueId ? linkedIssueId : issueId);
        }}
        onRefresh={() => {
          this.reloadIssue(this.state.origin.issueId);
        }}
      />
      
    );
  }

  /**
   * Des
   */
  renderDes() {
    let delta;
    if (this.state.editDesShow === undefined) {
      return null;
    }
    if (!this.state.description || this.state.editDesShow) {
      delta = text2Delta(this.state.editDes);
      return (
        <div className="line-start mt-10">
          <WYSIWYGEditor
            bottomBar
            value={text2Delta(this.state.editDes)}
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
                description: this.state.editDes || '',
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
                // editDesShow: true,
                // editDes: this.state.description,
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
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    const { initValue, visible, onCancel, onOk } = this.props;
    const getMenu = () => (
      <Menu onClick={this.handleClickMenu.bind(this)}>
        <Menu.Item key="0">
          登记工作日志
        </Menu.Item>
        <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.issue.deleteIssue']}>
          <Menu.Item key="1">
            删除
          </Menu.Item>
        </Permission>
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
              <div style={{ height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(0,0,0,0.26)' }}>
                <div
                  className="radius"
                  style={{ background: TYPE[this.state.typeCode], color: '#fff', width: '20px', height: '20px', textAlign: 'center', fontSize: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                <Icon
                  type="error_outline c7n-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'detail' });
                    this.scrollToAnchor('detail');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="描述">
              <li id="DESCRIPTION-nav" className={`c7n-li ${this.state.nav === 'des' ? 'c7n-li-active' : ''}`}>
                <Icon
                  type="subject c7n-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'des' });
                    this.scrollToAnchor('des');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="附件">
              <li id="COMMENT-nav" className={`c7n-li ${this.state.nav === 'attachment' ? 'c7n-li-active' : ''}`}>
                <Icon
                  type="attach_file c7n-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'attachment' });
                    this.scrollToAnchor('attachment');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="评论">
              <li id="ATTACHMENT-nav" className={`c7n-li ${this.state.nav === 'commit' ? 'c7n-li-active' : ''}`}>
                <Icon
                  type="sms_outline c7n-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'commit' });
                    this.scrollToAnchor('commit');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="工作日志">
              <li id="LOG-nav" className={`c7n-li ${this.state.nav === 'log' ? 'c7n-li-active' : ''}`}>
                <Icon
                  type="work_log c7n-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'log' });
                    this.scrollToAnchor('log');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="活动日志">
              <li id="DATA_LOG-nav" className={`c7n-li ${this.state.nav === 'data_log' ? 'c7n-li-active' : ''}`}>
                <Icon
                  type="insert_invitation c7n-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'data_log' });
                    this.scrollToAnchor('data_log');
                  }}
                />
              </li>
            </Tooltip>
            {
              this.state.typeCode !== 'sub_task' && (
                <Tooltip placement="right" title="子任务">
                  <li id="SUB_TASKS-nav" className={`c7n-li ${this.state.nav === 'sub_task' ? 'c7n-li-active' : ''}`}>
                    <Icon
                      type="filter_none c7n-icon-li"
                      role="none"
                      onClick={() => {
                        this.setState({ nav: 'sub_task' });
                        this.scrollToAnchor('sub_task');
                      }}
                    />
                  </li>
                </Tooltip>
              )
            }
            {
              this.state.typeCode !== 'sub_task' && (
                <Tooltip placement="right" title="相关任务">
                  <li id="LINK_TASKS-nav" className={`c7n-li ${this.state.nav === 'link_task' ? 'c7n-li-active' : ''}`}>
                    <Icon
                      type="link c7n-icon-li"
                      role="none"
                      onClick={() => {
                        this.setState({ nav: 'link_task' });
                        this.scrollToAnchor('link_task');
                      }}
                    />
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
                    alignItems: 'center',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    marginLeft: '-20px',
                    marginRight: '-20px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.26)',
                    height: 44,
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
                              this.reloadIssue(this.state.parentIssueId);
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
                <div className="line-justify" style={{ marginBottom: 5, alignItems: 'center', marginTop: 10 }}>
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
                  <div style={{ display: 'flex', flex: 1 }}>
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        // background: 'rgba(255, 177, 0, 0.2)',
                        marginRight: 12,
                        flexShrink: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Icon
                        type={STATUS_ICON[this.state.statusCode] ? STATUS_ICON[this.state.statusCode].icon : 'timelapse'}
                        style={{
                          fontSize: '33px',
                          color: this.state.statusColor || '#ffae02',
                        }}
                      />
                    </span>
                    <div>
                      <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.54)', marginBottom: 4 }}>
                        状态
                      </div>
                      <div>
                        <ReadAndEdit
                          callback={this.changeRae.bind(this)}
                          thisType="statusId"
                          current={this.state.currentRae}
                          origin={this.state.statusId}
                          onOk={this.updateIssue.bind(this, 'statusId')}
                          onCancel={this.resetStatusId.bind(this)}
                          onInit={() => {
                            this.setAnIssueToState();
                            loadStatus().then((res) => {
                              this.setState({
                                originStatus: res,
                              });
                            });
                          }}
                          readModeContent={<div>
                            {
                              this.state.statusId ? (
                                <div
                                  style={{
                                    color: this.state.statusColor,
                                    fontSize: '16px',
                                    lineHeight: '18px',
                                  }}
                                >
                                  { this.state.statusName }
                                </div>
                              ) : '无'
                            }
                          </div>}
                        >
                          <Select
                            value={this.state.originStatus.length ? this.state.statusId : this.state.statusName}
                            style={{ width: 150 }}
                            loading={this.state.selectLoading}
                            autoFocus
                            // getPopupContainer={triggerNode => triggerNode.parentNode}
                            onFocus={() => {
                              this.setState({
                                selectLoading: true,
                              });
                              loadStatus().then((res) => {
                                this.setState({
                                  originStatus: res,
                                  selectLoading: false,
                                });
                              });
                            }}
                            onChange={(value) => {
                              this.setState({
                                statusId: value,
                              });
                            }}
                          >
                            {
                              this.state.originStatus.map(status => (
                                <Option key={status.id} value={status.id}>
                                  { status.name }
                                </Option>
                              ),
                              )
                            }
                          </Select>
                        </ReadAndEdit>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flex: 1 }}>
                    <span
                      style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(77, 144, 254, 0.2)', marginRight: 12, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Icon type="flag" style={{ fontSize: '24px', color: '#3575df' }} />
                    </span>
                    <div>
                      <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.54)', marginBottom: 4 }}>
                        优先级
                      </div>
                      <div>
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
                                    // backgroundColor: COLOR[this.state.priorityCode].bgColor,
                                    color: COLOR[this.state.priorityCode].color,
                                    // borderRadius: '2px',
                                    // padding: '0 8px',
                                    // display: 'inline-block',
                                    fontSize: '16px',
                                    lineHeight: '18px',
                                  }}
                                >
                                  { this.state.priorityName }
                                </div>
                              ) : '无'
                            }
                          </div>}
                        >
                          <Select
                            value={this.state.originpriorities.length ? this.state.priorityCode : this.state.priorityName}
                            style={{ width: '150px' }}
                            loading={this.state.selectLoading}
                            autoFocus
                            // getPopupContainer={triggerNode => triggerNode.parentNode}
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
                              this.transformPriorityCode(this.state.originpriorities).map(type => (
                                <Option key={type.valueCode} value={type.valueCode}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                                    <div
                                      className="c7n-level"
                                      style={{
                                        // backgroundColor: COLOR[type.valueCode].bgColor,
                                        color: COLOR[type.valueCode].color,
                                        // borderRadius: '2px',
                                        // padding: '0 8px',
                                        // display: 'inline-block',
                                        fontSize: '16px',
                                        lineHeight: '18px',
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
                  </div>
                  <div style={{ display: 'flex', flex: 1.2 }}>
                    <span
                      style={{ width: 30, height: 30, borderRadius: '50%', background: '#d8d8d8', marginRight: 12, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Icon type="directions_run" style={{ fontSize: '24px' }} />
                    </span>
                    <div>
                      <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.54)', marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                        <span>冲刺</span>
                        <Tooltip title={this.state.closeSprint.length ? `已完成冲刺：${_.map(this.state.closeSprint, 'sprintName').join(',')}` : '无已完成冲刺'}>
                          <Icon
                            type="error"
                            style={{
                              fontSize: '13px',
                              color: 'rgba(0,0,0,0.54)',
                              marginLeft: 5,
                            }}
                          />
                        </Tooltip>
                      </div>
                      <div>
                        {
                          this.state.typeCode !== 'sub_task' ? (
                            <ReadAndEdit
                              callback={this.changeRae.bind(this)}
                              thisType="sprintId"
                              current={this.state.currentRae}
                              origin={this.state.activeSprint.sprintId}
                              onOk={this.updateIssue.bind(this, 'sprintId')}
                              onCancel={this.resetSprintId.bind(this)}
                              onInit={() => {
                                this.setAnIssueToState(this.state.origin);
                                loadSprints(['sprint_planning', 'started']).then((res) => {
                                  this.setState({
                                    originSprints: res,
                                    sprintId: this.state.activeSprint.sprintId,
                                  });
                                });
                              }}
                              readModeContent={<div>
                                {
                                  !this.state.closeSprint.length && !this.state.activeSprint.sprintId ? '无' : (
                                    <div>
                                      <div 
                                        style={{
                                          fontSize: '12px',
                                          lineHeight: '18px',
                                        }}
                                      >
                                        {this.state.activeSprint.sprintId ? this.state.activeSprint.sprintName : '无活跃冲刺'}
                                      </div>
                                    </div>
                                  )
                                }
                              </div>}
                            >
                              <Select
                                label="活跃冲刺"
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
                                  loadSprints(['sprint_planning', 'started']).then((res) => {
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
                                this.state.activeSprint.sprintId ? (
                                  <div 
                                    style={{
                                      // color: '#4d90fe',
                                      // border: '1px solid #4d90fe',
                                      // borderRadius: '2px',
                                      fontSize: '16px',
                                      lineHeight: '18px',
                                      // padding: '0 8px',
                                      // display: 'inline-block',
                                    }}
                                  >
                                    {this.state.activeSprint.sprintName}
                                  </div>
                                ) : '无'
                              }
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>
                  
                  {
                    this.state.issueId && this.state.typeCode === 'story' ? (
                      <div style={{ display: 'flex', flex: 1 }}>
                        <span
                          style={{ width: 30, height: 30, borderRadius: '50%', background: '#d8d8d8', marginRight: 12, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <Icon type="date_range" style={{ fontSize: '24px' }} />
                        </span>
                        <div>
                          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.54)', marginBottom: 4 }}>
                        故事点
                          </div>
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
                              <NumericInput
                                maxLength="3"
                                value={this.state.storyPoints}
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
                      </div>
                    ) : null
                  }
                  {
                    this.state.issueId && this.state.typeCode !== 'issue_epic' ? (
                      <div style={{ display: 'flex', flex: 1 }}>
                        <span
                          style={{ width: 30, height: 30, borderRadius: '50%', background: '#d8d8d8', marginRight: 12, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <Icon type="event_note" style={{ fontSize: '24px' }} />
                        </span>
                        <div>
                          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.54)', marginBottom: 4 }}>
                            预估时间
                          </div>
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
                    <div className="c7n-content-wrapper" style={{ display: 'flex' }}>
                      <div style={{ flex: 1, width: '50%' }}>
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
                                    <p style={{ color: '#3f51b5', wordBreak: 'break-word', marginBottom: 0 }}>
                                      {this.transToArr(this.state.componentIssueRelDTOList, 'name')}
                                    </p>
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
                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
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
                                              marginBottom: 3,
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
                                  readModeContent={<div>
                                    <p style={{ color: '#3f51b5', wordBreak: 'break-word', marginBottom: 0 }}>
                                      {this.transToArr(this.state.influenceVersions, 'name')}
                                    </p>
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
                                <p style={{ color: '#3f51b5', wordBreak: 'break-word', marginBottom: 0 }}>
                                  {this.transToArr(this.state.fixVersions, 'name')}
                                </p>
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
                                    value={this.state.originEpics.length ? this.state.epicId || undefined : this.state.epicName || undefined}
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
                      </div>
                      {/* --- */}
                      <div style={{ flex: 1, width: '50%' }}>
                        <div className="line-start mt-10">
                          <div className="c7n-property-wrapper">
                            <span className="c7n-subtitle">
                              人员
                            </span>
                          </div>
                        </div>
                        <div className="line-start mt-10 assignee">
                          <div className="c7n-property-wrapper">
                            <span className="c7n-property">报告人：</span>
                          </div>
                          <div className="c7n-value-wrapper" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <ReadAndEdit
                              style={{ marginBottom: 5 }}
                              callback={this.changeRae.bind(this)}
                              thisType="reporterId"
                              current={this.state.currentRae}
                              origin={this.state.reporterId}
                              onOk={this.updateIssue.bind(this, 'reporterId')}
                              onCancel={this.resetReporterId.bind(this)}
                              onInit={() => {
                                this.setAnIssueToState(this.state.origin);
                                if (this.state.reporterId) {
                                  this.setState({
                                    flag: 'loading',
                                  });
                                  getUser(this.state.reporterId).then((res) => {
                                    this.setState({
                                      reporterId: JSON.stringify(res.content[0]),
                                      originUsers: [res.content[0]],
                                      flag: 'finish',
                                    });
                                  });
                                } else {
                                  this.setState({
                                    reporterId: undefined,
                                    originUsers: [],
                                  });
                                }
                              }}
                              readModeContent={<div>
                                {
                                  this.state.reporterId ? (
                                    <UserHead
                                      user={{
                                        id: this.state.reporterId,
                                        loginName: '',
                                        realName: this.state.reporterName,
                                        avatar: this.state.reporterImageUrl,
                                      }}
                                    />
                                  ) : '无'
                                }
                              </div>}
                            >
                              <Select
                                value={this.state.flag === 'loading' ? undefined : this.state.reporterId || undefined}
                                style={{ width: 150 }}
                                loading={this.state.selectLoading}
                                allowClear
                                autoFocus
                                filter
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
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                onChange={(value) => {
                                  this.setState({ reporterId: value });
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
                              </Select>
                            </ReadAndEdit>
                            <span
                              role="none"
                              style={{
                                color: '#3f51b5',
                                cursor: 'pointer',
                                marginTop: '-5px',
                                display: 'inline-block',
                                marginBottom: 5,
                              }}
                              onClick={() => {
                                getSelf().then((res) => {
                                  if (res.id !== this.state.reporterId) {
                                    this.setState({
                                      currentRae: undefined,
                                      reporterId: JSON.stringify(res),
                                      reporterName: `${res.loginName}${res.realName}`,
                                      reporterImageUrl: res.imageUrl,
                                    }, () => {
                                      this.updateIssue('reporterId');
                                    });
                                  }
                                });
                              }}
                            >
                              指派给我
                            </span>
                          </div>
                        </div>
                        <div className="line-start mt-10 assignee">
                          <div className="c7n-property-wrapper">
                            <span className="c7n-property">经办人：</span>
                          </div>
                          <div className="c7n-value-wrapper" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <ReadAndEdit
                              style={{ marginBottom: 5 }}
                              callback={this.changeRae.bind(this)}
                              thisType="assigneeId"
                              current={this.state.currentRae}
                              origin={this.state.assigneeId}
                              onOk={this.updateIssue.bind(this, 'assigneeId')}
                              onCancel={this.resetAssigneeId.bind(this)}
                              onInit={() => {
                                this.setAnIssueToState(this.state.origin);
                                if (this.state.assigneeId) {
                                  this.setState({
                                    flag: 'loading',
                                  });
                                  getUser(this.state.assigneeId).then((res) => {
                                    this.setState({
                                      assigneeId: JSON.stringify(res.content[0]),
                                      originUsers: [res.content[0]],
                                      flag: 'finish',
                                    });
                                  });
                                } else {
                                  this.setState({
                                    assigneeId: undefined,
                                    originUsers: [],
                                  });
                                }
                              }}
                              readModeContent={<div>
                                {
                                  this.state.assigneeId ? (
                                    <UserHead
                                      user={{
                                        id: this.state.assigneeId,
                                        loginName: '',
                                        realName: this.state.assigneeName,
                                        avatar: this.state.assigneeImageUrl,
                                      }}
                                    />
                                  ) : '无'
                                }
                              </div>}
                            >
                              <Select
                                value={this.state.flag === 'loading' ? undefined : this.state.assigneeId || undefined}
                                style={{ width: 150 }}
                                loading={this.state.selectLoading}
                                allowClear
                                autoFocus
                                filter
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
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                onChange={(value) => {
                                  this.setState({ assigneeId: value });
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
                              </Select>
                            </ReadAndEdit>
                            <span
                              role="none"
                              style={{
                                color: '#3f51b5',
                                cursor: 'pointer',
                                marginTop: '-5px',
                                display: 'inline-block',
                                marginBottom: 5,
                              }}
                              onClick={() => {
                                getSelf().then((res) => {
                                  if (res.id !== this.state.assigneeId) {
                                    this.setState({
                                      currentRae: undefined,
                                      assigneeId: JSON.stringify(res),
                                      assigneeName: `${res.loginName}${res.realName}`,
                                      assigneeImageUrl: res.imageUrl,
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
                            <span className="c7n-subtitle">日期</span>
                          </div>
                        </div>
                        
                        <div className="line-start mt-10">
                          <div className="c7n-property-wrapper">
                            <span className="c7n-property">创建时间：</span>
                          </div>
                          <div className="c7n-value-wrapper">
                            {formatDate(this.state.creationDate)}
                          </div>
                        </div>
                        <div className="line-start mt-10">
                          <div className="c7n-property-wrapper">
                            <span className="c7n-property">更新时间：</span>
                          </div>
                          <div className="c7n-value-wrapper">
                            {formatDate(this.state.lastUpdateDate)}
                          </div>
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
                      <div className="c7n-title-right" style={{ marginLeft: '14px', position: 'relative' }}>
                        <Button className="leftBtn" funcTyp="flat" onClick={() => this.setState({ edit: true })}>
                          <Icon type="zoom_out_map icon" style={{ marginRight: 2 }} />
                          <span>全屏编辑</span>
                        </Button>
                        <Icon
                          className="c7n-des-edit"
                          style={{ position: 'absolute', top: 8, right: -20 }}
                          role="none"
                          type="mode_edit mlr-3 pointer"
                          onClick={() => {
                            this.setState({
                              editDesShow: true,
                              editDes: this.state.description,
                            });
                          }}
                        />
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
                      <Icon type="work_log c7n-icon-title" />
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
                
                <div id="data_log">
                  <div className="c7n-title-wrapper">
                    <div className="c7n-title-left">
                      <Icon type="insert_invitation c7n-icon-title" />
                      <span>活动日志</span>
                    </div>
                    <div style={{ flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px' }} />
                  </div>
                  {this.renderDataLogs()}
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
                      {this.renderSubIssues()}
                    </div>
                  )
                }

                {
                  this.state.origin.typeCode !== 'sub_task' && (
                    <div id="link_task">
                      <div className="c7n-title-wrapper">
                        <div className="c7n-title-left">
                          <Icon type="link c7n-icon-title" />
                          <span>相关任务</span>
                        </div>
                        <div style={{ flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px' }} />
                        <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
                          <Button className="leftBtn" funcTyp="flat" onClick={() => this.setState({ createLinkTaskShow: true })}>
                            <Icon type="playlist_add icon" />
                            <span>创建相关任务</span>
                          </Button>
                        </div>
                      </div>
                      {this.renderLinkIssues()}
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
              issueId={this.state.origin.issueId}
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
        {
          this.state.createLinkTaskShow ? (
            <CreateLinkTask
              issueId={this.state.origin.issueId}
              visible={this.state.createLinkTaskShow}
              onCancel={() => this.setState({ createLinkTaskShow: false })}
              onOk={this.handleCreateLinkIssue.bind(this)}
            />
          ) : null
        }
      </div>
    );
  }
}
export default withRouter(CreateSprint);
