import React, { Component } from 'react';
import { Icon, Popconfirm, Tooltip } from 'choerodon-ui';
import { AppState } from 'choerodon-front-boot';
import _ from 'lodash';
import UserHead from '../../UserHead';
import WYSIWYGEditor from '../../WYSIWYGEditor';
import { IssueDescription } from '../../CommonComponent';
import {
  delta2Html, text2Delta, beforeTextUpload, formatDate, 
} from '../../../common/utils';
import { deleteLink, updateCommit } from '../../../api/NewIssueApi';
import PriorityTag from '../../PriorityTag';
import StatusTag from '../../StatusTag';
import TypeTag from '../../TypeTag';
import './IssueList.scss';


class IssueList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  componentWillMount() {
  }

  confirm(issueId, e) {
    this.handleDeleteIssue(issueId);
  }

  cancel(e) {
  }

  handleDeleteIssue(linkId) {
    deleteLink(linkId)
      .then((res) => {
        this.props.onRefresh();
      });
  }

  render() {
    const { issue, i, showAssignee } = this.props;
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
        <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${issue.typeCode}`}>
          <div>
            <TypeTag
              data={issue.issueTypeDTO}
            />
          </div>
        </Tooltip>
        <Tooltip title={`编号概要： ${issue.issueNum} ${issue.summary}`}>
          <div style={{ marginLeft: 8, flex: 1, overflow: 'hidden' }}>
            <p
              style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, color: 'rgb(63, 81, 181)', 
              }}
              role="none"
              onClick={() => {
                this.props.onOpen(issue.issueId, issue.linkedIssueId);
              }}
            >
              {`${issue.issueNum} ${issue.summary}`}
            </p>
          </div>
        </Tooltip>
        <div style={{ width: '34px', marginRight: '15px', overflow: 'hidden' }}>
          <Tooltip mouseEnterDelay={0.5} title={`优先级： ${issue.priorityName}`}>
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
          {/* <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${issue.statusName}`}>
            <div>
              <StatusTag
                name={issue.statusName}
                color={issue.statusColor}
              />
            </div>
          </Tooltip> */}

          <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${issue.statusMapDTO.name}`}>
            <div>
              <StatusTag
                data={issue.statusMapDTO}
              />
            </div>
          </Tooltip>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
          }}
        >
          <Popconfirm
            title="确认要删除该问题链接吗?"
            placement="left"
            onConfirm={this.confirm.bind(this, issue.linkId)}
            onCancel={this.cancel}
            okText="删除"
            cancelText="取消"
            okType="danger"
          >
            <Icon type="delete_forever mlr-3 pointer" />
          </Popconfirm>
        </div>
      </div>
    );
  }
}

export default IssueList;
