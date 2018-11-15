import React, { Component } from 'react';
import { Icon, Popconfirm, Tooltip } from 'choerodon-ui';
import { stores, Permission } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import WYSIWYGEditor from '../../WYSIWYGEditor';
import { IssueDescription } from '../../CommonComponent';
import {
  delta2Html, text2Delta, beforeTextUpload, formatDate, 
} from '../../../common/utils';
import IssueStore from '../../../stores/project/sprint/IssueStore';
import { deleteIssue, updateCommit } from '../../../api/NewIssueApi';
import PriorityTag from '../../PriorityTag';
import StatusTag from '../../StatusTag';
import TypeTag from '../../TypeTag';
import UserHead from '../../UserHead';
import './IssueList.scss';

const { AppState } = stores;

class IssueList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      paramOpenIssueId: undefined,
    };
  }

  confirm(issueId, e) {
    this.handleDeleteIssue(issueId);
  }

  handleDeleteIssue(issueId) {
    deleteIssue(issueId)
      .then((res) => {
        this.props.onRefresh();
      });
  }

  GetRequest(url) {
    const theRequest = {};
    if (url.indexOf('?') !== -1) {
      const str = url.split('?')[1];
      const strs = str.split('&');
      for (let i = 0; i < strs.length; i += 1) {
        theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
      }
    }
    return theRequest;
  }

  componentDidMount() {
    const { location: { search } } = this.props;
    const theRequest = this.GetRequest(search);
    const { paramIssueId, paramOpenIssueId } = theRequest;
    this.setState({
      paramOpenIssueId,
    });
    if (paramOpenIssueId && paramIssueId && paramOpenIssueId !== paramIssueId) {
      this.props.onOpen(paramOpenIssueId);
    }
  }

  componentWillUnmount() {
    this.setState({
      paramOpenIssueId: undefined,
    });
  }

  render() {
    const { issue, i, showAssignee } = this.props;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 10px',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          borderTop: !i ? '1px solid rgba(0, 0, 0, 0.12)' : '',
          marginLeft: 26,
        }}
      >
        <Tooltip mouseEnterDelay={0.5} title="任务类型: 子任务">
          <div>
            <TypeTag
              data={issue.issueTypeDTO}
            />
          </div>
        </Tooltip>
        <Tooltip title={`子任务编号概要： ${issue.issueNum} ${issue.summary}`}>
          <div style={{ marginLeft: 8, flex: 1, overflow: 'hidden' }}>
            <p
              style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, color: 'rgb(63, 81, 181)', 
              }}
              role="none"
              onClick={() => {
                this.props.onOpen(issue);
              }}
            >
              {`${issue.issueNum} ${issue.summary}`}
            </p>
          </div>
        </Tooltip>
        <div style={{ width: '34px', marginRight: '15px', overflow: 'hidden' }}>
          <Tooltip mouseEnterDelay={0.5} title={`优先级： ${issue.priorityDTO.name}`}>
            <div style={{ marginRight: 12 }}>
              <PriorityTag
                priority={issue.priorityDTO}
              />
            </div>
          </Tooltip>
        </div>
        {
          showAssignee ? (
            <div style={{ marginRight: 29, display: 'flex', justifyContent: 'flex-end' }}>
              <div>
                <UserHead
                  user={{
                    id: issue.assigneeId,
                    loginName: '',
                    realName: issue.assigneeName,
                    avatar: issue.imageUrl,
                  }}
                />
              </div>
            </div>
          ) : null
        }
        <div style={{
          width: '48px', marginRight: '15px', display: 'flex', justifyContent: 'flex-end', 
        }}
        >
          <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${issue.statusMapDTO.name}`}>
            <div>
              <StatusTag
                data={issue.statusMapDTO}
              />
            </div>
          </Tooltip>
        </div>
        <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.issue.deleteIssue']}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '16px',
            }}
          >
            <Popconfirm
              title="确认要删除该子任务吗?"
              placement="left"
              onConfirm={this.confirm.bind(this, issue.issueId)}
              onCancel={this.cancel}
              okText="删除"
              cancelText="取消"
              okType="danger"
            >
              <Icon type="delete_forever mlr-3 pointer" />
            </Popconfirm>
          </div>
        </Permission>
      </div>
    );
  }
}

export default withRouter(IssueList);
