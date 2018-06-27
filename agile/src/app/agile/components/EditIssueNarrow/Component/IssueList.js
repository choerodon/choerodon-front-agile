import React, { Component } from 'react';
import { Icon, Popconfirm, Tooltip } from 'choerodon-ui';
import { AppState } from 'choerodon-front-boot';
import _ from 'lodash';
import UserHead from '../../UserHead';
import WYSIWYGEditor from '../../WYSIWYGEditor';
import { IssueDescription } from '../../CommonComponent';
import { delta2Html, text2Delta, beforeTextUpload, formatDate } from '../../../common/utils';
import { deleteIssue, updateCommit } from '../../../api/NewIssueApi';
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
    window.console.log('cancle');
  }

  handleDeleteIssue(issueId) {
    deleteIssue(issueId)
      .then((res) => {
        this.props.onRefresh();
      });
  }

  render() {
    const { issue, i } = this.props;
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
        <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${issue.typeCode}`}>
          <div>
            <TypeTag
              type={{
                typeCode: issue.typeCode,
              }}
            />
          </div>
        </Tooltip>
        <Tooltip title={`子任务编号概要： ${issue.issueNum} ${issue.summary}`}>
          <div style={{ marginLeft: 8, flex: 1, overflow: 'hidden' }}>
            <p
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, color: 'rgb(63, 81, 181)' }}
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
          <Tooltip mouseEnterDelay={0.5} title={`优先级： ${issue.priorityName}`}>
            <div style={{ marginRight: 12 }}>
              <PriorityTag
                priority={{
                  priorityCode: issue.priorityCode,
                  priorityName: issue.priorityName,
                }}
              />
            </div>
          </Tooltip>
        </div>
        <div style={{ width: '48px', marginRight: '15px', display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${issue.statusName}`}>
            <div>
              <StatusTag
                status={{
                  statusColor: issue.statusColor,
                  statusName: issue.statusName,
                }}
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
      </div>
    );
  }
}

export default IssueList;
