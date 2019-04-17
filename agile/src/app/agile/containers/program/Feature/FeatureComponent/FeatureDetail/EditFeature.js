/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import { Spin } from 'choerodon-ui';
import './EditFeature.scss';
import {
  loadDatalogs, loadLinkIssues, loadIssue, getFieldAndValue, loadWikies,
} from '../../../../../api/NewIssueApi';
import CopyIssue from '../../../../../components/CopyIssue';
import IssueSidebar from './IssueComponent/IssueSidebar';
import IssueHeader from './IssueComponent/IssueHeader';
import IssueBody from './IssueComponent/IssueBody/IssueBody';
import VisibleStore from '../../../../../stores/common/visible/VisibleStore';

const { AppState } = stores;

let loginUserId;
let hasPermission;
@observer class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issueLoading: false,
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
        const param = {
          schemeCode: 'agile_issue',
          context: res.typeCode,
          pageCode: 'agile_issue_edit',
        };
        getFieldAndValue(id, param).then((fields) => {
          this.setState({
            issueLoading: false,
          });
          store.setIssueFields(res, fields);
        });
      });
      axios.all([
        loadWikies(id),
        loadDatalogs(id),
        loadLinkIssues(id),
      ])
        .then(axios.spread((wiki, dataLogs, linkIssues) => {
          store.initIssueAttribute(wiki, dataLogs, linkIssues);
        }));
    });
  };

  handleCopyIssue = () => {
    const { onUpdate, reloadIssue } = this.props;
    VisibleStore.setCopyIssueShow(false);
    if (onUpdate) {
      onUpdate();
    }
    if (reloadIssue) {
      reloadIssue();
    }
  };

  render() {
    const {
      store,
      backUrl,
      onCancel,
      style,
      onUpdate,
      onDeleteIssue,
    } = this.props;
    const {
      issueLoading,
    } = this.state;

    const issue = store.getIssue;
    const { issueId, issueNum, summary } = issue;
    const linkIssues = store.getLinkIssues;
    const {
      getCopyIssueShow: copyIssueShow,
    } = VisibleStore;

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
            onDeleteIssue={onDeleteIssue}
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
              issueId={issueId}
              issueNum={issueNum}
              issue={issue}
              issueLink={linkIssues}
              issueSummary={summary}
              visible={copyIssueShow}
              onCancel={() => VisibleStore.setCopyIssueShow(false)}
              onOk={this.handleCopyIssue.bind(this)}
              applyType="program"
            />
          ) : null
        }
      </div>
    );
  }
}
export default withRouter(CreateSprint);
