import React, { Component } from 'react';
import { Icon, Tooltip, Rate } from 'choerodon-ui';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import {
  CardTypeTag, IssueNum, StayDay, StatusName, Priority, Assignee, Summary,
} from './CardComponent';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import './StatusIssue.scss';

export default class CardProvider extends React.Component {
  constructor(props) {
    super(props);
    this.ref = {};
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const { clicked } = this.props;
    if (nextProps.clicked !== clicked) {
      return true;
    }
    return JSON.stringify(nextProps) !== JSON.stringify(this.props);
  }

  handleClick = (e) => {
    const { onClick, issue, index } = this.props;
    onClick(issue, index);
  }

  render() {
    const {
      completed, issue, statusName, categoryCode, onClick, clicked, ...otherProps
    } = this.props;
    return (
      <div
        className={classnames('c7n-scrumboard-issue', {
          shouldBackgroundColorChange: clicked,
        })}
        role="none"
        onClick={this.handleClick}
        {...otherProps}
        key={issue.issueNum}
        style={{
          // marginLeft: item.parentIssueId && this.props.swimLaneCode === '
          // assignee' && this.getParent(item.parentIssueId, item) ? 16 : 0,
          // backgroundColor: '#fff',
          // borderTop: item.parentIssueId && swimLaneCode === 'assignee' && this.getParent(item.parentIssueId, item) ? 'unset' : '1px solid rgba(0, 0, 0, 0.20)',
        }}
      >
        <div style={{ flexGrow: 1 }}>
          <div
            className="c7n-scrumboard-issueTop"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                flex: 1,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexGrow: '7',
                  marginBottom: 4,
                }}
              >
                <CardTypeTag issueTypeDTO={issue.issueTypeDTO} />
                <IssueNum issueNum={issue.issueNum} completed={completed} />
                <StayDay stayDay={issue.stayDay} completed={completed} />
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: '1',
                marginBottom: 4,
              }}
              >
                <StatusName
                  categoryCode={categoryCode}
                  statusName={statusName}
                />
                <Priority
                  priorityDTO={issue.priorityDTO}
                />
              </div>
            </div>
            <Assignee
              assigneeName={issue.assigneeName}
              assigneeId={issue.assigneeId}
              imageUrl={issue.imageUrl}
            />
          </div>
          <div className="c7n-scrumboard-issueBottom">
            <Summary summary={issue.summary} />
          </div>
        </div>
      </div>
    );
  }
}
