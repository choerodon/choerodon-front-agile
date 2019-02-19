import React, { Component } from 'react';
import {
  Icon, Button, Avatar, Collapse,
} from 'choerodon-ui';
import { observer } from 'mobx-react';
import './SwimLaneHeader.scss';
import TypeTag from '../../../../../components/TypeTag';
import StatusTag from '../../../../../components/StatusTag';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import UserHead from '../../../../../components/UserHead';

@observer
export default class SwimLaneHeader extends Component {
  renderByMode(mode, subIssueDataLength) {
    const { parentIssue } = this.props;
    const switchMap = new Map([
      ['parent_child', this.renderStoryComponent],
      ['assignee', this.renderAssigneeComponent],
      ['swimlane_epic', this.renderEpicComponent],
    ]);
    const strMap = new Map([
      ['parent_child', '子任务'],
      ['assignee', '任务'],
      ['swimlane_epic', '子任务'],
      ['swimlane_none', '子任务'],
    ]);
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {switchMap.get(mode)(parentIssue)}
        <span className="c7n-parentIssue-count" style={{ whiteSpace: 'nowrap' }}>{`  (${subIssueDataLength} ${strMap.get(mode)})`}</span>
      </div>
    );
  }

  renderStoryComponent = ({
    issueTypeDTO, issueNum, categoryCode, statusName, summary,
  }) => {
    const { parentIssue } = this.props;
    return (
      <React.Fragment>
        <TypeTag
          style={{
            marginLeft: 8,
            marginRight: 6,
          }}
          data={issueTypeDTO}
        />
        <span
          style={{ cursor: 'pointer', width: '100px' }}
          role="none"
          onClick={(e) => {
            e.stopPropagation();
            ScrumBoardStore.setClickedIssue(parentIssue);
          }}
        >
          {`#${issueNum}`}
        </span>
        <StatusTag
          categoryCode={categoryCode}
          style={{ marginRight: 8 }}
          name={statusName}
        />
        <span
          className="c7n-parentIssue-summary"
          style={JSON.stringify(ScrumBoardStore.getClickIssueDetail) !== '{}' ? {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: 235,
          } : {}
          }
        >
          {summary}
        </span>
      </React.Fragment>
    );
  };

  renderAssigneeComponent = ({ assigneeName, assigneeAvatarUrl, assigneeId }) => (
    <React.Fragment>
      <UserHead
        hiddenText
        size={24}
        user={{
          id: assigneeId,
          loginName: assigneeName,
          realName: assigneeName,
          avatar: assigneeAvatarUrl,
        }}
      />
      <span>{assigneeName}</span>
    </React.Fragment>
  );

  renderEpicComponent = ({ epicName }) => (
    <span>{epicName}</span>
  );

  render() {
    const {
      parentIssue, subIssueDataLength, mode, keyId, style,
    } = this.props;
    if (keyId === 'other') {
      if (mode === 'swimlane_epic') {
        return `其他史诗问题（${subIssueDataLength}）`;
      } else if (mode === 'swimlane_none') {
        return `所有问题（${subIssueDataLength}）`;
      } else {
        return `其他问题(${subIssueDataLength} 任务)`;
      }
    } else {
      return (
        <div className="c7n-swimlaneHeader" style={style}>
          {this.renderByMode(mode, subIssueDataLength)}
          {
            mode === 'parent_child' ? (
              <Button
                type="primary"
                style={{
                  display: parentIssue.categoryCode !== 'done' && parentIssue.canMoveToComplish ? 'block' : 'none',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  ScrumBoardStore.setUpdateParent(parentIssue);
                  ScrumBoardStore.setTransFromData(parentIssue, parentIssue.issueId);
                }}
              >
                {'移动到done'}
              </Button>
            ) : null
          }
        </div>
      );
    }
  }
}
