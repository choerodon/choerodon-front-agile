/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import { Spin } from 'choerodon-ui';
import './EditFeature.scss';
import {
  loadBranchs, loadDatalogs, loadLinkIssues,
  loadIssue, loadWorklogs, loadWikies,
} from '../../../../../api/NewIssueApi';
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
@observer class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.needBlur = true;
    this.componentRef = React.createRef();
    this.state = {
      issueLoading: false,
      assigneeShow: false,
      changeParentShow: false,
      copyIssueShow: false,
      transformSubIssueShow: false,
      origin: {},
      assigneeId: undefined,
      linkIssues: [],
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
    this.needBlur = true;
    const {
      store,
      backUrl,
      onCancel,
      style,
      onUpdate,
    } = this.props;
    const {
      assigneeId,
      assigneeShow,
      changeParentShow,
      copyIssueShow,
      linkIssues,
      origin,
      issueLoading,
      transformSubIssueShow,
      transformFromSubIssueShow,
    } = this.state;

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
          reloadIssue={this.loadIssueDetail}
          onUpdate={onUpdate}
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
            onUpdate={onUpdate}
            loginUserId={loginUserId}
            hasPermission={hasPermission}
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
