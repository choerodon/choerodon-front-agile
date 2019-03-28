import React, { Component } from 'react';
import { stores, axios, Permission } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import TimeAgo from 'timeago-react';
import {
  Select, Input, DatePicker, Button, Modal, Tabs, InputNumber,
  Tooltip, Progress, Dropdown, Menu, Spin, Icon, Popover,
} from 'choerodon-ui';
import {
  STATUS, COLOR, TYPE, ICON, TYPE_NAME,
} from '../../../../common/Constant';
import {
  UploadButtonNow, ReadAndEdit, IssueDescription, DatetimeAgo,
} from '../../../../components/CommonComponent';
import {
  delta2Html, handleFileUpload, text2Delta, beforeTextUpload, formatDate, returnBeforeTextUpload,
} from '../../../../common/utils';
import {
  loadBranchs, loadDatalogs, updateStatus, loadLinkIssues,
  loadIssue, loadWorklogs, updateIssue, loadProgramEpics,
  deleteIssue, loadStatus,
  loadWikies, loadIssueTypes, createCommit,
} from '../../../../api/NewIssueApi';
import { getSelf, getUsers, getUser } from '../../../../api/CommonApi';
import WYSIWYGEditor from '../../../../components/WYSIWYGEditor';
import FullEditor from '../../../../components/FullEditor';
import CreateLinkTask from '../../../../components/CreateLinkTask';
import UserHead from '../../../../components/UserHead';
import LinkList from '../../../../components/EditIssueNarrow/Component/IssueList';
import Comment from '../../../../components/EditIssueNarrow/Component/Comment';
import TextEditToggle from '../../../../components/TextEditToggle';
import CopyIssue from '../../../../components/CopyIssue';
import TypeTag from '../../../../components/TypeTag';

import '../../../../components/EditIssueNarrow/EditIssueNarrow.scss';

const FEATURESTATUS = { 
  ...STATUS,
  ...{
    prepare: '#F67F5A',
  }, 
};

const { AppState } = stores;
const { Option, blur } = Select;
const { TextArea } = Input;
const { confirm } = Modal;
const { Text, Edit } = TextEditToggle;
let sign = true;
let filterSign = false;
const storyPointList = ['0.5', '1', '2', '3', '4', '5', '8', '13'];

let loginUserId;
let hasPermission;
class FeatureDetail extends Component {
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

  constructor(props) {
    super(props);
    this.needBlur = true;
    this.componentRef = React.createRef();
    this.state = {
      issueTypes: [],
      createdById: undefined,
      issueLoading: false,
      flag: undefined,
      selectLoading: true,
      saveLoading: false,
      edit: false,
      addCommit: false,
      addCommitDes: '',
      createLinkTaskShow: false,
      editDesShow: false,
      copyIssueShow: false,
      // origin: {},
      origin: {

      },
      loading: true,
      nav: 'detail',
      editDes: undefined,
      editCommentId: undefined,
      editComment: undefined,
      currentRae: undefined,
      issueId: undefined,
      epicId: undefined,
      epicName: '',
      issueNum: undefined,
      typeCode: 'story',
      issueTypeDTO: {},
      reporterId: undefined,
      reporterImageUrl: undefined,
      statusId: undefined,
      statusCode: undefined,
      statusMapDTO: {},
      storyPoints: undefined,
      creationDate: undefined,
      lastUpdateDate: undefined,
      statusName: '',
      reporterName: '',
      summary: '',
      description: '',
      fileList: [],
      issueCommentDTOList: [],
      issueLinkDTOList: [],
      linkIssues: [],
      originStatus: [],
      originEpics: [],
      originUsers: [],
      transformId: false,
      benfitHypothesis: '',
      acceptanceCritera: '',
      featureDTO: {},
      featureType: 'enabler',
    };
  }

  componentDidMount() {
    const { onRef, issueId } = this.props;
    // const issueId = 39765;
    if (onRef) {
      onRef(this);
    }
    this.firstLoadIssue(issueId);
    document.getElementById('scroll-area').addEventListener('scroll', (e) => {
      if (sign) {
        const { nav } = this.state;
        const currentNav = this.getCurrentNav(e);
        if (nav !== currentNav && currentNav) {
          this.setState({
            nav: currentNav,
          });
        }
      }
    });

    axios.all([
      axios.get('/iam/v1/users/self'),
      axios.post('/iam/v1/permissions/checkPermission', [{
        code: 'agile-service.project-info.updateProjectInfo',
        organizationId: AppState.currentMenuType.organizationId,
        projectId: AppState.currentMenuType.id,
        resourceType: 'project',
      }]),
      loadIssueTypes('program'),
    ])
      .then(axios.spread((users, permission, issueTypes) => {
        loginUserId = users.id;
        hasPermission = permission[0].approve;
        this.setState({
          issueTypes,
          issueTypeDTO: issueTypes.find(item => item.typeCode === 'feature'),
        });
      }));
  }

  // componentWillReceiveProps(nextProps) {
  //   const { issueId } = this.props;
  //   if (nextProps.issueId && nextProps.issueId !== issueId) {
  //     this.setState({
  //       currentRae: undefined,
  //     });
  //     this.firstLoadIssue(nextProps.issueId);
  //   }
  // }

  onFilterChange(input) {
    if (!filterSign) {
      this.setState({
        selectLoading: true,
      });
      getUsers(input).then((res) => {
        this.setState({
          originUsers: res.content,
          selectLoading: false,
        });
      });
      filterSign = true;
    } else {
      this.debounceFilterIssues(input);
    }
  }

  getCurrentNav = (e) => {
    const eles = ['detail', 'des', 'attachment', 'commit', 'link_task'];
    return _.find(eles, i => this.isInLook(document.getElementById(i)));
  }

  scrollToAnchor = (anchorName) => {
    if (anchorName) {
      const anchorElement = document.getElementById(anchorName);
      if (anchorElement) {
        sign = false;
        anchorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'end',
        });
        setTimeout(() => {
          sign = true;
        }, 2000);
      }
    }
  }

  /**
   * Attachment
   */
  addFileToFileList = (data) => {
    this.reloadIssue();
  }

  setAnIssueToState = (paramIssue) => {
    const { origin } = this.state;
    const issue = paramIssue || origin;
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
      epicColor,
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
      priorityDTO,
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
      statusMapDTO,
      storyPoints,
      summary,
      typeCode,
      issueTypeDTO,
      versionIssueRelDTOList,
      subIssueDTOList,
      featureDTO,
    } = issue;
    const { benfitHypothesis, acceptanceCritera, featureType } = featureDTO;
    const fileList = _.map(issue.issueAttachmentDTOList, issueAttachment => ({
      uid: issueAttachment.attachmentId,
      name: issueAttachment.fileName,
      url: issueAttachment.url,
    }));
    this.setState({
      origin: issue,
      creationDate,
      editDes: description,
      description,
      epicId,
      epicName,
      epicColor,
      fileList,
      issueCommentDTOList,
      issueId,
      issueLinkDTOList,
      issueNum,
      lastUpdateDate,
      objectVersionNumber,
      projectId,
      reporterId,
      reporterName,
      reporterImageUrl,
      statusId: statusMapDTO.id,
      statusCode: statusMapDTO.type,
      statusName: statusMapDTO.name,
      storyPoints,
      summary,
      typeCode,
      issueTypeDTO,
      issueLoading: false,
      benfitHypothesis,
      acceptanceCritera,
      featureType,
      featureDTO,
    });
  }

  /**
   * Attachment
   */
  setFileList = (data) => {
    this.setState({ fileList: data });
  };

  /**
   * Attachment
   */
  onChangeFileList = (arr) => {
    const { origin } = this.state;
    if (arr.length > 0 && arr.some(one => !one.url)) {
      const config = {
        issueId: origin.issueId,
        fileName: arr[0].name || 'AG_ATTACHMENT',
        projectId: AppState.currentMenuType.id,
      };
      handleFileUpload(arr, this.addFileToFileList, config);
    }
  };

  handleDeleteIssue = (issueId) => {
    const that = this;
    const { issueNum, subIssueDTOList } = this.state;
    confirm({
      width: 560,
      title: `删除feature${issueNum}`,
      content:
        (
          <div>
            <p style={{ marginBottom: 10 }}>请确认您要删除这个feature。</p>
            <p style={{ marginBottom: 10 }}>这个feature将会被彻底删除。包括所有附件和评论。</p>
            <p style={{ marginBottom: 10 }}>如果您完成了这个feature，通常是已解决或者已关闭，而不是删除。</p>
          </div>
        ),
      onOk() {
        return deleteIssue(issueId)
          .then((res) => {
            that.props.onDeleteIssue();
          });
      },
      onCancel() { },
      okText: '删除',
      okType: 'danger',
    });
  }

  handleTitleChange = (e) => {
    this.setState({ summary: e.target.value });
    this.needBlur = false;
    // 由于 OnChange 和 OnBlur 几乎同时执行，不能确定先后顺序，所以需要 setTimeout 修改事件循环先后顺序
    setTimeout(() => { this.needBlur = true; }, 100);
  };

  handleBenfitHypothesisChange = (e) => {
    this.setState({ benfitHypothesis: e.target.value });
    this.needBlur = false;
    // 由于 OnChange 和 OnBlur 几乎同时执行，不能确定先后顺序，所以需要 setTimeout 修改事件循环先后顺序
    setTimeout(() => { this.needBlur = true; }, 100);
  }

  handleAcceptanceCriteraChange = (e) => {
    this.setState({ acceptanceCritera: e.target.value });
    this.needBlur = false;
    // 由于 OnChange 和 OnBlur 几乎同时执行，不能确定先后顺序，所以需要 setTimeout 修改事件循环先后顺序
    setTimeout(() => { this.needBlur = true; }, 100);
  }

  handleFeatureTypeChange = (e) => {
    this.setState({
      featureType: e.target.value,
    });
  }

  handleEpicNameChange = (e) => {
    this.setState({ epicName: e.target.value });
  };

  handleStoryPointsChange = (e) => {
    this.setState({ storyPoints: (e && (e > 999.9 ? 999.9 : e)) || '' });
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
        storyPoints: String(value).slice(0, 3), // 限制最长三位,
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

  refresh = () => {
    const { origin } = this.state;
    loadIssue(origin.issueId).then((res) => {
      this.setAnIssueToState(res);
      this.setState({
        createdById: res.createdBy,
      });
    });
  };

  loadIssueStatus = () => {
    const {
      issueTypeDTO,
      issueId,
      origin,
    } = this.state;
    const typeId = issueTypeDTO.id;
    this.setAnIssueToState();
    loadStatus(origin.statusId, issueId, typeId, 'program').then((res) => {
      this.setState({
        originStatus: res,
        selectLoading: false,
      });
    });
  };

  statusOnChange = (e, item) => {
    // e.preventDefault();
    const that = this;
    if (that.needBlur) {
      setTimeout(() => {
        if (document.getElementsByClassName(that.state.currentRae).length) {
          that.needBlur = false;
          document.getElementsByClassName(that.state.currentRae)[0].click();
        }
      }, 10);
    }
  };

  updateIssue = (pro, value) => {
    const { state } = this;
    const {
      origin,
      issueId,
      transformId,
      featureDTO,
    } = this.state;
    const { onUpdate } = this.props;
    const obj = {
      issueId,
      objectVersionNumber: origin.objectVersionNumber,
    };
    if ((pro === 'description') || (pro === 'editDes')) {
      if (state[pro]) {
        returnBeforeTextUpload(state[pro], obj, updateIssue, 'description')
          .then((res) => {
            this.reloadIssue(state.origin.issueId);
          });
      }
    } else if (pro === 'assigneeId' || pro === 'reporterId') {
      obj[pro] = state[pro] ? JSON.parse(state[pro]).id || 0 : 0;
      updateIssue(obj)
        .then((res) => {
          this.reloadIssue();
          if (onUpdate) {
            onUpdate();
          }
        });
    } else if (pro === 'storyPoints' || pro === 'remainingTime') {
      obj[pro] = state[pro] === '' ? null : state[pro];
      updateIssue(obj)
        .then((res) => {
          this.reloadIssue();
          if (onUpdate) {
            onUpdate();
          }
        });
    } else if (pro === 'statusId') {
      if (transformId) {
        updateStatus(transformId, issueId, origin.objectVersionNumber, AppState.currentMenuType.id, 'program')
          .then((res) => {
            this.reloadIssue();
            if (onUpdate) {
              onUpdate();
            }
            this.setState({
              transformId: false,
            });
          });
      }
    } else if (pro === 'benfitHypothesis' || pro === 'acceptanceCritera' || pro === 'featureType') {
      if (!obj.featureDTO) {
        obj.featureDTO = {};
      }
      obj.featureDTO[pro] = value || (state[pro] === '' ? null : state[pro]);
      obj.featureDTO.id = featureDTO.id;
      obj.featureDTO.objectVersionNumber = featureDTO.objectVersionNumber;
      obj.featureDTO.issueId = featureDTO.issueId;
      updateIssue(obj)
        .then((res) => {
          this.reloadIssue();
          if (onUpdate) {
            onUpdate();
          }
        });
    } else {
      obj[pro] = state[pro] || 0;
      updateIssue(obj)
        .then((res) => {
          this.reloadIssue();
          if (onUpdate) {
            onUpdate();
          }
        });
    }
  };

  updateIssueSelect = (originPros, pros) => {
    const { state } = this;
    const { issueId, origin: { objectVersionNumber } } = this.state;
    const { onUpdate } = this.props;
    const obj = {
      issueId,
      objectVersionNumber,
    };
    const origin = state[originPros];
    let target;
    let transPros;
    if (originPros === 'originLabels') {
      if (!state[pros].length) {
        transPros = [];
      } else if (typeof state[pros][0] !== 'string') {
        transPros = this.transToArr(state[pros], 'labelName', 'array');
      } else {
        transPros = state[pros];
      }
    } else if (!state[pros].length) {
      transPros = [];
    } else if (typeof state[pros][0] !== 'string') {
      transPros = this.transToArr(state[pros], 'name', 'array');
    } else {
      transPros = state[pros];
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
        if (onUpdate) {
          onUpdate();
        }
      });
  };

  isInLook = (ele) => {
    const a = ele.offsetTop;
    const target = document.getElementById('scroll-area');
    // return a >= target.scrollTop && a < (target.scrollTop + target.offsetHeight);
    return a + ele.offsetHeight > target.scrollTop;
  }

  resetStoryPoints(value) {
    this.setState({ storyPoints: value });
  }

  resetBenfitHypothesis(value) {
    this.setState({ benfitHypothesis: value });
  }

  resetAcceptanceCritera(value) {
    this.setState({ acceptanceCritera: value });
  }

  resetFeatureType(value) {
    this.setState({
      featureType: value,
    });
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

  resetStatusId(value) {
    this.setState({ statusId: value });
  }

  resetEpicId(value) {
    this.setState({ epicId: value });
  }

  firstLoadIssue(paramIssueId) {
    const { origin } = this.state;
    const issueId = paramIssueId || origin.issueId;
    this.setState({
      addCommit: false,
      addCommitDes: '',
      editDesShow: undefined,
      editDes: undefined,
      editCommentId: undefined,
      editComment: undefined,
      // issueLoading: true,
    }, () => {
      loadIssue(issueId).then((res) => {
        this.setAnIssueToState(res);
        this.setState({
          createdById: res.createdBy,
          creationDate: res.creationDate,
        });
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
      loadWikies(issueId).then((res) => {
        this.setState({
          wikies: res || [],
        });
      });
      this.setState({
        editDesShow: false,
      });
    });
  }

  reloadIssue(paramIssueId) {
    const { onUpdate, store } = this.props;
    this.firstLoadIssue(paramIssueId);
    if (onUpdate) {
      onUpdate();
    }
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


  handleCreateLinkIssue() {
    const { onUpdate } = this.props;
    this.reloadIssue();
    this.setState({
      createLinkTaskShow: false,
    });
    if (onUpdate) {
      onUpdate();
    }
  }

  handleCopyIssue() {
    const { onUpdate } = this.props;
    this.reloadIssue();
    this.setState({
      copyIssueShow: false,
    });
    if (onUpdate) {
      onUpdate();
    }
    if (onUpdate) {
      onUpdate();
    }
  }


  handleClickMenu(e) {
    const { origin: { issueId } } = this.state;
    if (e.key === '1') {
      const { createdById } = this.state;
      this.handleDeleteIssue(issueId);
    } else if (e.key === '2') {
      this.setState({ copyIssueShow: true });
    }
  }

  changeRae(currentRae) {
    this.setState({
      currentRae,
    });
  }

  renderLinkIssues() {
    const { linkIssues } = this.state;
    const group = _.groupBy(linkIssues, 'ward');
    return (
      <div className="c7n-tasks">
        {
          _.map(group, (v, k) => (
            <div key={k}>
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

  renderLinkList(link, i) {
    const { origin } = this.state;
    return (
      <LinkList
        issue={{
          ...link,
          typeCode: link.typeCode,
        }}
        i={i}
        onOpen={(issueId, linkedIssueId) => {
          this.reloadIssue(issueId === origin.issueId ? linkedIssueId : issueId);
        }}
        onRefresh={() => {
          this.reloadIssue(origin.issueId);
        }}
      />
    );
  }

  /**
   * Des
   */
  renderDes() {
    let delta;
    const { editDesShow, description, editDes } = this.state;
    if (editDesShow === undefined) {
      return null;
    }
    if (!description || editDesShow) {
      delta = text2Delta(editDes);
      return (
        <div className="line-start mt-10">
          <WYSIWYGEditor
            bottomBar
            value={text2Delta(editDes)}
            style={{ height: 200, width: '100%' }}
            onChange={(value) => {
              this.setState({ editDes: value });
            }}
            handleDelete={() => {
              this.setState({
                editDesShow: false,
                editDes: description,
              });
            }}
            handleSave={() => {
              this.setState({
                editDesShow: false,
                description: editDes || '',
              });
              this.updateIssue('editDes');
            }}
            handleClickOutSide={() => {
              this.setState({
                editDesShow: false,
                description: editDes || '',
              });
              this.updateIssue('editDes');
            }}
          />
        </div>
      );
    } else {
      delta = delta2Html(description);
      return (
        <div className="c7n-content-wrapper">
          <div
            className="line-start mt-10 c7n-description"
            role="none"
          >
            <IssueDescription data={delta} />
          </div>
        </div>
      );
    }
  }

  /**
   * Comment
   */
  createReply = (commit) => {
    createCommit(commit).then((res) => {
      this.reloadIssue();
      this.setState({
        addCommit: false,
        addCommitDes: '',
      });
    });
  };

  handleCreateCommit() {
    const { addCommitDes, origin: { issueId: extra } } = this.state;
    if (addCommitDes) {
      beforeTextUpload(addCommitDes, { issueId: extra, commentText: '' }, this.createReply, 'commentText');
    } else {
      this.createReply({ issueId: extra, commentText: '' });
    }
  }

  /**
   * Comment
   */
  renderCommits() {
    const { addCommitDes, addCommit, issueCommentDTOList } = this.state;
    const delta = text2Delta(addCommitDes);
    return (
      <div>
        {addCommit && (
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
              handleClickOutSide={() => this.handleCreateCommit()}
            />
          </div>
        )}
        {issueCommentDTOList.map(comment => (
          <Comment
            key={comment.commentId}
            comment={comment}
            onDeleteComment={() => this.reloadIssue()}
            onUpdateComment={() => this.reloadIssue()}
            isWide
          />
        ))}
      </div>
    );
  }


  render() {
    const menu = AppState.currentMenuType;
    this.needBlur = true;
    const { type, id: projectId, organizationId: orgId } = menu;
    const {
      store,
      backUrl,
      history,
      onCancel,
      style,
      resetIssue,
    } = this.props;
    const {
      issueTypeDTO,
      flag,
      fileList,
      createLinkTaskShow,
      copyIssueShow,
      editDes,
      edit,
      linkIssues,
      selectLoading,
      currentRae,
      issueId,
      originStatus,
      statusId,
      statusCode,
      statusName,
      creationDate,
      lastUpdateDate,
      reporterId,
      reporterName,
      reporterImageUrl,
      epicId,
      epicColor,
      epicName,
      originEpics,
      origin,
      description,
      nav,
      issueLoading,
      issueNum,
      summary,
      storyPoints,
      originUsers,
      issueTypes,
      benfitHypothesis,
      acceptanceCritera,
      featureType,
    } = this.state;
    // const issueTypeData = store.getIssueTypes ? store.getIssueTypes : [];
    const typeCode = issueTypeDTO ? issueTypeDTO.typeCode : '';
    const typeId = issueTypeDTO ? issueTypeDTO.id : '';
    // const currentType = issueTypeData.find(t => t.id === typeId);
    // if (currentType) {
    //   issueTypes = issueTypeData.filter(t => (t.stateMachineId === currentType.stateMachineId
    //     && t.typeCode !== typeCode && t.typeCode !== 'sub_task'
    //   ));
    // }

    const getMenu = () => {
      const { createdById } = this.state;
      return (
        <Menu onClick={this.handleClickMenu.bind(this)}>
          {
            <Menu.Item
              key="1"
              disabled={loginUserId !== createdById && !hasPermission}
            >
              {'删除'}
            </Menu.Item>
          }
          <Menu.Item key="2">
            {'复制feature'}
          </Menu.Item>
        </Menu>
      );
    };
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
      >
        {
          issueTypes.map(t => (
            <Menu.Item key={t.typeCode} value={t.id}>
              <TypeTag
                data={t}
                showName
              />
            </Menu.Item>
          ))
        }
      </Menu>
    );
    const urlParams = AppState.currentMenuType;
    return (
      <div className="choerodon-modal-editIssue" style={style}>
        {
          issueLoading ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(255, 255, 255, 0.65)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Spin />
            </div>
          ) : null
        }
        <div className="c7n-nav">
          <div>
            <Dropdown overlay={typeList} trigger={['click']} disabled={typeCode === 'feature'}>
              <div
                style={{
                  height: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TypeTag
                  data={issueTypeDTO}
                />
                <Icon
                  type="arrow_drop_down"
                  style={{ fontSize: 16 }}
                />
              </div>
            </Dropdown>
          </div>
          <ul className="c7n-nav-ul" style={{ padding: 0 }}>
            <Tooltip placement="right" title="详情">
              <li id="DETAILS-nav" className={`c7n-li ${nav === 'detail' ? 'c7n-li-active' : ''}`}>
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
              <li id="DESCRIPTION-nav" className={`c7n-li ${nav === 'des' ? 'c7n-li-active' : ''}`}>
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
              <li id="ATTACHMENT-nav" className={`c7n-li ${nav === 'attachment' ? 'c7n-li-active' : ''}`}>
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
              <li id="COMMIT-nav" className={`c7n-li ${nav === 'commit' ? 'c7n-li-active' : ''}`}>
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
            {/* <Tooltip placement="right" title="问题链接">
              <li id="LINK_TASKS-nav" className={`c7n-li ${nav === 'link_task' ? 'c7n-li-active' : ''}`}>
                <Icon
                  type="link c7n-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'link_task' });
                    this.scrollToAnchor('link_task');
                  }}
                />
              </li>
            </Tooltip> */}
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
                    <a
                      role="none"
                      onClick={() => {
                      // const backUrl = this.props.backUrl || 'backlog';
                        history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&paramName=${origin.issueNum}&paramIssueId=${origin.issueId}&paramUrl=${backUrl || 'backlog'}`);
                        return false;
                      }}
                    >
                      {issueNum}
                    </a>
                  </div>
                  <div
                    style={{
                      cursor: 'pointer', fontSize: '13px', lineHeight: '20px', display: 'flex', alignItems: 'center',
                    }}
                    role="none"
                    onClick={() => {
                      onCancel();
                    }}
                  >
                    <Icon type="last_page" style={{ fontSize: '18px', fontWeight: '500' }} />
                    <span>隐藏详情</span>
                  </div>
                </div>
              
                <div className="line-justify" style={{ marginBottom: 5, alignItems: 'flex-start' }}>
                  <ReadAndEdit
                    callback={this.changeRae.bind(this)}
                    thisType="summary"
                    line
                    current={currentRae}
                    origin={origin.summary}
                    onInit={() => this.setAnIssueToState()}
                    onOk={this.updateIssue.bind(this, 'summary')}
                    onCancel={this.resetSummary.bind(this)}
                    readModeContent={(
                      <div className="c7n-summary">
                        {summary}
                      </div>
                    )}
                  >
                    <TextArea
                      maxLength={44}
                      value={summary}
                      size="small"
                      onChange={this.handleTitleChange.bind(this)}
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
                <div className="line-start">
                  {
                    <div style={{ display: 'flex', marginRight: 25 }}>
                      <span>故事点：</span>
                      <div style={{ maxWidth: 130 }}>
                        <ReadAndEdit
                          callback={this.changeRae.bind(this)}
                          thisType="storyPoints"
                          current={currentRae}
                          handleEnter
                          origin={origin.storyPoints}
                          onInit={() => this.setAnIssueToState(origin)}
                          onOk={this.updateIssue.bind(this, 'storyPoints')}
                          onCancel={this.resetStoryPoints.bind(this)}
                          readModeContent={(
                            <span>
                              {storyPoints === undefined || storyPoints === null ? '无' : `${storyPoints} 点`}
                            </span>
                        )}
                        >
                          <Select
                            value={storyPoints && storyPoints.toString()}
                            mode="combobox"
                              // onBlur={e => this.statusOnChange(e)}
                            ref={(e) => {
                              this.componentRef = e;
                            }}
                            onPopupFocus={(e) => {
                              this.componentRef.rcSelect.focus();
                            }}
                            tokenSeparators={[',']}
                              // getPopupContainer={triggerNode => triggerNode.parentNode}
                            style={{ marginTop: 0, paddingTop: 0 }}
                            onChange={value => this.handleChangeStoryPoint(value)}
                          >
                            {storyPointList.map(sp => (
                              <Option key={sp.toString()} value={sp}>
                                {sp}
                              </Option>
                            ))}
                          </Select>
                        </ReadAndEdit>
                   
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="c7n-content-bottom" id="scroll-area" style={{ position: 'relative' }}>
            <section className="c7n-body-editIssue">
              <div className="c7n-content-editIssue">
                <div className="c7n-details">
                  <div id="detail">
                    <div className="c7n-title-wrapper" style={{ marginTop: 0 }}>
                      <div className="c7n-title-left">
                        <Icon type="error_outline c7n-icon-title" />
                        <span>详情</span>
                      </div>
                      <div style={{
                        flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                      }}
                      />
                    </div>

                    <div className="c7n-content-wrapper">
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            {'特性类型：'}
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          <TextEditToggle
                            style={{ width: 150 }}
                            formKey="featureType"
                            onSubmit={(value) => { this.updateIssue('featureType', value); }}
                            originData={featureType}
                          >
                            <Text>
                              {
                                featureType => (featureType === 'business' ? '业务' : '使能')
                              }
                            </Text>
                            <Edit>
                              <Select
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                style={{ width: '150px' }}
                              >
                                <Option key="business" value="business">业务</Option>
                                <Option key="enabler" value="enabler">使能</Option>
                              </Select>
                            </Edit>
                          </TextEditToggle>
                        </div>
                      </div>
                   
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            {'状态：'}
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="statusId"
                            current={currentRae}
                            handleEnter
                            origin={statusId}
                            onOk={this.updateIssue.bind(this, 'statusId')}
                            onCancel={this.resetStatusId.bind(this)}
                            onInit={this.loadIssueStatus}
                            readModeContent={(
                              <div>
                                {
                                  statusId ? (
                                    <div
                                      style={{
                                        background: FEATURESTATUS[statusCode],
                                        color: '#fff',
                                        borderRadius: '2px',
                                        padding: '0 8px',
                                        display: 'inline-block',
                                        margin: '2px auto 2px 0',
                                      }}
                                    >
                                      {statusName}
                                    </div>
                                  ) : '无'
                                }
                              </div>
                            )}
                          >
                            <Select
                              value={originStatus.length ? statusId : statusName}
                              style={{ width: 150 }}
                              loading={selectLoading}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              // onBlur={() => this.statusOnChange()}
                              onChange={(value, item) => {
                                this.setState({
                                  statusId: value,
                                  transformId: item.key,
                                });
                                this.needBlur = false;
                              // 由于 OnChange 和 OnBlur 几乎同时执行，不能确定先后顺序，所以需要 setTimeout 修改事件循环先后顺序
                              // setTimeout(() => { this.needBlur = true; }, 100);
                              }}
                            >
                              {
                                originStatus && originStatus.length
                                  ? originStatus.map(transform => (transform.statusDTO ? (
                                    <Option key={transform.id} value={transform.endStatusId}>
                                      {transform.statusDTO.name}
                                    </Option>
                                  ) : ''))
                                  : null
                              }
                            </Select>
                          </ReadAndEdit>
                        </div>
                      </div>
                   
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            {'史诗：'}
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="epicId"
                            current={currentRae}
                            origin={epicId}
                            onOk={this.updateIssue.bind(this, 'epicId')}
                            onCancel={this.resetEpicId.bind(this)}
                            onInit={() => {
                              this.setAnIssueToState(origin);
                              loadProgramEpics().then((res) => {
                                this.setState({
                                  originEpics: res,
                                });
                              });
                            }}
                            readModeContent={(
                              <div>
                                {
                                      epicId ? (
                                        <div
                                          style={{
                                            color: epicColor,
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderColor: epicColor,
                                            borderRadius: '2px',
                                            fontSize: '13px',
                                            lineHeight: '20px',
                                            padding: '0 8px',
                                            display: 'inline-block',
                                          }}
                                        >
                                          {epicName}
                                        </div>
                                      ) : '无'
                                    }
                              </div>
                                )}
                          >
                            <Select
                              value={
                                    originEpics.length
                                      ? epicId || undefined
                                      : epicName || undefined
                                  }
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              style={{ width: '150px' }}
                                  // onBlur={() => this.statusOnChange()}
                              allowClear
                              loading={selectLoading}
                              onFocus={() => {
                                this.setState({
                                  selectLoading: true,
                                });
                                loadProgramEpics().then((res) => {
                                  this.setState({
                                    originEpics: res,
                                    selectLoading: false,
                                  });
                                });
                              }}
                              onChange={(value) => {
                                const epic = _.find(originEpics,
                                  { issueId: value * 1 });
                                this.setState({
                                  epicId: value,
                                // epicName: epic.epicName,
                                });
                                this.needBlur = false;
                              // 由于 OnChange 和 OnBlur 几乎同时执行，
                              // 不能确定先后顺序，所以需要 setTimeout 修改事件循环先后顺序
                              // setTimeout(() => { this.needBlur = true; }, 100);
                              }}
                            >
                              {originEpics.map(epic => <Option key={`${epic.issueId}`} value={epic.issueId}>{epic.epicName}</Option>)}
                            </Select>
                          </ReadAndEdit>
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
                            current={currentRae}
                            origin={reporterId}
                            onOk={this.updateIssue.bind(this, 'reporterId')}
                            onCancel={this.resetReporterId.bind(this)}
                            onInit={() => {
                              this.setAnIssueToState(origin);
                              if (reporterId) {
                                this.setState({
                                  flag: 'loading',
                                });
                                getUser(reporterId).then((res) => {
                                  this.setState({
                                    reporterId: JSON.stringify(res.content[0]),
                                    originUsers: res.content.length ? [res.content[0]] : [],
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
                            readModeContent={(
                              <div>
                                {
                                  reporterId && reporterName ? (
                                    <UserHead
                                      user={{
                                        id: reporterId,
                                        loginName: '',
                                        realName: reporterName,
                                        avatar: reporterImageUrl,
                                      }}
                                    />
                                  ) : '无'
                                }
                              </div>
                            )}
                          >
                            <Select
                              value={flag === 'loading' ? undefined : reporterId || undefined}
                              style={{ width: 150 }}
                              loading={selectLoading}
                              // onBlur={() => this.statusOnChange()}
                              allowClear
                              filter
                              onFilterChange={this.onFilterChange.bind(this)}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              onChange={(value) => {
                                this.setState({ reporterId: value });
                              }}
                            >
                              {originUsers.filter(u => u.enabled).map(user => (
                                <Option key={JSON.stringify(user)} value={JSON.stringify(user)}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                                    <UserHead
                                      user={{
                                        id: user && user.id,
                                        loginName: user && user.loginName,
                                        realName: user && user.realName,
                                        avatar: user && user.imageUrl,
                                      }}
                                    />
                                  </div>
                                </Option>
                              ))}
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
                                if (res.id !== reporterId) {
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
                            {'分配给我'}
                          </span>
                        </div>
                      </div>
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            {'特性价值：'}
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          <TextEditToggle
                            style={{ width: 150 }}
                            formKey="benfitHypothesis"
                            onSubmit={(value) => { this.updateIssue('benfitHypothesis', value); }}
                            originData={benfitHypothesis}
                          >
                            <Text>
                              {
                                benfitHypothesis => (
                                  <span>
                                    {benfitHypothesis === undefined || benfitHypothesis === null ? '-' : `${benfitHypothesis}`}
                                  </span>
                                )
                              }
                            </Text>
                            <Edit>
                              <TextArea
                                maxLength={44}
                                value={benfitHypothesis}
                                size="small"
                              />
                            </Edit>
                          </TextEditToggle>
                        </div>
                      </div>
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">
                            {'验收标准：'}
                          </span>
                        </div>
                        <div className="c7n-value-wrapper">
                          <TextEditToggle
                            style={{ width: 150 }}
                            formKey="acceptanceCritera"
                            onSubmit={(value) => { this.updateIssue('acceptanceCritera', value); }}
                            originData={acceptanceCritera}
                          >
                            <Text>
                              {
                                acceptanceCritera => (
                                  <span>
                                    {acceptanceCritera === undefined || acceptanceCritera === null ? '-' : `${acceptanceCritera}`}
                                  </span>
                                )
                              }
                            </Text>
                            <Edit>
                              <TextArea
                                maxLength={44}
                                value={acceptanceCritera}
                                size="small"
                              />
                            </Edit>
                          </TextEditToggle>
                        
                        </div>
                      </div>
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">创建时间：</span>
                        </div>
                        <div className="c7n-value-wrapper">
                          <DatetimeAgo
                            date={creationDate}
                          />
                        </div>
                      </div>
                      <div className="line-start mt-10">
                        <div className="c7n-property-wrapper">
                          <span className="c7n-property">更新时间：</span>
                        </div>
                        <div className="c7n-value-wrapper">
                          <DatetimeAgo
                            date={lastUpdateDate}
                          />
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
                      <div style={{
                        flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                      }}
                      />
                      <div className="c7n-title-right" style={{ marginLeft: '14px', position: 'relative' }}>
                        <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ edit: true })}>
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
                              editDes: description,
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
                    <div style={{
                      flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px', marginRight: '114.67px',
                    }}
                    />
                  </div>
                  <div className="c7n-content-wrapper" style={{ marginTop: '-47px' }}>
                    <UploadButtonNow
                      onRemove={this.setFileList}
                      onBeforeUpload={this.setFileList}
                      updateNow={this.onChangeFileList}
                      fileList={fileList}
                    />
                  </div>
                </div>
                <div id="commit">
                  <div
                    className="c7n-title-wrapper"
                    style={{
                      marginBottom: 2,
                    }}
                  >
                    <div className="c7n-title-left">
                      <Icon type="sms_outline c7n-icon-title" />
                      <span>评论</span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                        marginLeft: '14px',
                      }}
                    />
                    <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
                      <Button
                        className="leftBtn"
                        funcType="flat"
                        onClick={() => this.setState({ addCommit: true })}
                      >
                        <Icon type="playlist_add icon" />
                        <span>添加评论</span>
                      </Button>
                    </div>
                  </div>
                  {this.renderCommits()}
                </div>
               
                {/* {
                <div id="link_task">
                  <div className="c7n-title-wrapper">
                    <div className="c7n-title-left">
                      <Icon type="link c7n-icon-title" />
                      <span>问题链接</span>
                    </div>
                    <div style={{
                      flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                    }}
                    />
                    <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
                      <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ createLinkTaskShow: true })}>
                        <Icon type="relate icon" />
                        <span>创建链接</span>
                      </Button>
                    </div>
                  </div>
                  {this.renderLinkIssues()}
                </div>
                } */}
              </div>
            </section>
          </div>
        </div>
       
        {
          edit ? (
            <FullEditor
              initValue={text2Delta(editDes)}
              visible={edit}
              onCancel={() => this.setState({ edit: false })}
              onOk={callback}
            />
          ) : null
        }
        {
          createLinkTaskShow ? (
            <CreateLinkTask
              issueId={origin.issueId}
              visible={createLinkTaskShow}
              onCancel={() => this.setState({ createLinkTaskShow: false })}
              onOk={this.handleCreateLinkIssue.bind(this)}
            />
          ) : null
        }
        {
          copyIssueShow ? (
            <CopyIssue
              issueId={origin.issueId}
              issueNum={origin.issueNum}
              issue={origin}
              issueLink={linkIssues}
              issueSummary={origin.summary}
              visible={copyIssueShow}
              onCancel={() => this.setState({ copyIssueShow: false })}
              onOk={this.handleCopyIssue.bind(this)}
              copyFeature
            />
          ) : null
        }
      </div>
    );
  }
}
export default withRouter(FeatureDetail);
