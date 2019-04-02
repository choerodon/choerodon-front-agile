/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Spin } from 'choerodon-ui';
import './EditFeature.scss';
import {
  loadBranchs, loadDatalogs, loadLinkIssues,
  loadIssue, loadWorklogs, loadWikies,
} from '../../../../../api/NewIssueApi';
import { getUsers } from '../../../../../api/CommonApi';
import CopyIssue from '../../../../../components/CopyIssue';
import TransformSubIssue from '../../../../../components/TransformSubIssue';
import TransformFromSubIssue from '../../../../../components/TransformFromSubIssue';
import Assignee from '../../../../../components/Assignee';
import ChangeParent from '../../../../../components/ChangeParent';
import IssueSidebar from './IssueComponent/IssueSidebar';
import IssueHeader from './IssueComponent/IssueHeader';
import IssueBody from './IssueComponent/IssueBody/IssueBody';

const { AppState } = stores;

let loginUserId;
let hasPermission;
class CreateSprint extends Component {
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
      createdById: undefined,
      issueLoading: false,
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
      createBranchShow: false,
      assigneeShow: false,
      changeParentShow: false,
      editDesShow: false,
      copyIssueShow: false,
      transformSubIssueShow: false,
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
      issueTypeDTO: {},
      parentIssueId: undefined,
      reporterId: undefined,
      reporterImageUrl: undefined,
      sprintId: undefined,
      sprintName: '',
      statusId: undefined,
      statusCode: undefined,
      statusMapDTO: {},
      storyPoints: undefined,
      creationDate: undefined,
      lastUpdateDate: undefined,
      statusName: '',
      priorityName: '',
      priorityId: false,
      priorityColor: '#FFFFFF',
      priorityDTO: {},
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
      fixVersionsFixed: [],
      influenceVersionsFixed: [],
      branchs: {},
      originStatus: [],
      originPriorities: [],
      originComponents: [],
      originVersions: [],
      originLabels: [],
      originEpics: [],
      originUsers: [],
      originSprints: [],
      originFixVersions: [],
      originInfluenceVersions: [],
      transformId: false,
      addWiki: false,
      wikies: [],
    };
  }

  componentDidMount() {
    const { onRef, issueId } = this.props;
    if (onRef) {
      onRef(this);
    }
    this.loadIssueDetail(issueId);

    axios.all([
      axios.get('/iam/v1/users/self'),
      axios.post('/iam/v1/permissions/checkPermission', [{
        code: 'agile-service.project-info.updateProjectInfo',
        organizationId: AppState.currentMenuType.organizationId,
        projectId: AppState.currentMenuType.id,
        resourceType: 'project',
      }]),
    ])
      .then(axios.spread((users, permission) => {
        loginUserId = users.id;
        hasPermission = permission[0].approve;
      }));
  }

  componentWillReceiveProps(nextProps) {
    const { issueId } = this.props;
    if (nextProps.issueId && nextProps.issueId !== issueId) {
      this.loadIssueDetail(nextProps.issueId);
    }
  }

  loadIssueDetail = (paramIssueId) => {
    const { store, issueId } = this.props;
    const id = paramIssueId || issueId;
    this.setState({
      issueLoading: true,
    }, () => {
      loadIssue(id).then((res) => {
        store.setIssue(res);
        this.setState({
          issueLoading: false,
        });
      });
      axios.all([
        loadWikies(id),
        loadWorklogs(id),
        loadDatalogs(id),
        loadLinkIssues(id),
        loadBranchs(id),
      ])
        .then(axios.spread((wiki, workLogs, dataLogs, linkIssues, branches) => {
          store.initIssueAttribute(wiki, workLogs, dataLogs, linkIssues, branches);
        }));
    });
  };

  render() {
    const menu = AppState.currentMenuType;
    this.needBlur = true;
    const { type, id: projectId, organizationId: orgId } = menu;
    const {
      store,
      backUrl,
      onCancel,
      style,
      onUpdate,
    } = this.props;
    const {
      issueTypeDTO,
      assigneeId,
      assigneeShow,
      changeParentShow,
      copyIssueShow,
      linkIssues,
      issueId,
      reporterId,
      reporterName,
      reporterImageUrl,
      origin,
      issueLoading,
      transformSubIssueShow,
      transformFromSubIssueShow,
      issueNum,
      originUsers,
      createdById,
      parentIssueId,
      parentIssueNum,
      summary,
      remainingTime,
      storyPoints,
    } = this.state;
    const issueTypeData = store.getIssueTypes ? store.getIssueTypes : [];
    const typeCode = issueTypeDTO ? issueTypeDTO.typeCode : '';
    const typeId = issueTypeDTO ? issueTypeDTO.id : '';
    const currentType = issueTypeData.find(t => t.id === typeId);
    let issueTypes = [];
    if (currentType) {
      issueTypes = issueTypeData.filter(t => (t.stateMachineId === currentType.stateMachineId
        && t.typeCode !== typeCode && t.typeCode !== 'sub_task'
      ));
      issueTypes = AppState.currentMenuType.category === 'PROGRAM' ? issueTypes : issueTypes.filter(item => item.typeCode !== 'feature');
    }


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
        <IssueSidebar
          store={store}
        />
        <div className="c7n-content">
          <IssueHeader
            store={store}
            reloadIssue={this.loadIssueDetail}
            backUrl={backUrl}
            onCancel={onCancel}
            loginUserId={loginUserId}
            hasPermission={hasPermission}
            onUpdate={onUpdate}
          />
          <IssueBody
            store={store}
            reloadIssue={this.loadIssueDetail}
          />
        </div>
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
            />
          ) : null
        }
        {
          transformSubIssueShow ? (
            <TransformSubIssue
              visible={transformSubIssueShow}
              issueId={origin.issueId}
              issueNum={origin.issueNum}
              ovn={origin.objectVersionNumber}
              onCancel={() => this.setState({ transformSubIssueShow: false })}
              onOk={this.handleTransformSubIssue.bind(this)}
              store={store}
            />
          ) : null
        }
        {
          transformFromSubIssueShow ? (
            <TransformFromSubIssue
              visible={transformFromSubIssueShow}
              issueId={origin.issueId}
              issueNum={origin.issueNum}
              ovn={origin.objectVersionNumber}
              onCancel={() => this.setState({ transformFromSubIssueShow: false })}
              onOk={this.handleTransformFromSubIssue.bind(this)}
              store={store}
            />
          ) : null
        }

        {
          assigneeShow ? (
            <Assignee
              issueId={origin.issueId}
              issueNum={origin.issueNum}
              visible={assigneeShow}
              assigneeId={assigneeId}
              objectVersionNumber={origin.objectVersionNumber}
              onOk={() => {
                this.setState({ assigneeShow: false });
                this.reloadIssue();
              }}
              onCancel={() => {
                this.setState({ assigneeShow: false });
              }}
            />
          ) : null
        }
        {
          changeParentShow ? (
            <ChangeParent
              issueId={origin.issueId}
              issueNum={origin.issueNum}
              visible={changeParentShow}
              objectVersionNumber={origin.objectVersionNumber}
              onOk={() => {
                this.setState({ changeParentShow: false });
                this.reloadIssue();
              }}
              onCancel={() => {
                this.setState({ changeParentShow: false });
              }}
            />
          ) : null
        }
      </div>
    );
  }
}
export default withRouter(CreateSprint);
