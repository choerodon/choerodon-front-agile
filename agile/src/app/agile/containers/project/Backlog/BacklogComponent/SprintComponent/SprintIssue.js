import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import TypeTag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';
import StatusTag from '../../../../../components/StatusTag';
import PriorityTag from '../../../../../components/PriorityTag';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

@observer
class SprintIssue extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (JSON.stringify(nextProps) === JSON.stringify(this.props)) {
      return false;
    }
    return true;
  }

  render() {
    const {
      item, epicVisible, versionVisible, issueDisplay,
    } = this.props;
    return (
      <React.Fragment>
        <div
          label="sprintIssue"
          className="c7n-backlog-sprintIssueSide"
          style={{
            flexGrow: 1,
            width: issueDisplay ? 'unset' : 0,
          }}
        >
          <TypeTag
            data={item.issueTypeDTO}
          />
          <div
            label="sprintIssue"
            style={{
              marginLeft: 8,
              whiteSpace: issueDisplay ? 'normal' : 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              height: issueDisplay ? 'auto' : 20,
              wordBreak: 'break-all',
            }}
          >
            <span
              style={{
                textDecoration: item.statusMapDTO && item.statusMapDTO.completed ? 'line-through' : 'none',
              }}
            >
              {`${item.issueNum} `}
            </span>
            <Tooltip title={item.summary} placement="topLeft">
              {item.summary}
            </Tooltip>
          </div>
        </div>
        <div
          style={{
            marginTop: epicVisible || versionVisible || JSON.stringify(BacklogStore.getClickIssueDetail) !== '{}' ? 6 : 0,
            justifyContent: issueDisplay ? 'space-between' : 'flex-end',
          }}
          label="sprintIssue"
          className="c7n-backlog-sprintIssueSide"
        >
          <div className="c7n-backlog-sprintSideRightItems">
            <div
              style={{
                maxWidth: 34,
                marginLeft: !_.isNull(item.priorityDTO && item.priorityDTO.name) && !issueDisplay ? '12px' : 0,
              }}
              label="sprintIssue"
              className="c7n-backlog-sprintIssueRight"
            >
              <Tooltip title={`优先级: ${item.priorityDTO ? item.priorityDTO.name : ''}`}>
                <PriorityTag priority={item.priorityDTO} />
              </Tooltip>
            </div>
            <div
              style={{
                padding: '0 3px',
                maxWidth: 50,
                marginLeft: item.versionNames.length ? '12px' : 0,
                border: '1px solid rgba(0, 0, 0, 0.36)',
                color: 'rgba(0, 0, 0, 0.36)',
                borderRadius: '2px',
                display: item.versionNames.length > 0 ? 'block' : 'none',
              }}
              label="sprintIssue"
              className="c7n-backlog-sprintIssueRight"
            >
              {item.versionNames.length > 0 ? (
                <Tooltip title={`版本: ${item.versionNames.join(', ')}`}>
                  <span label="sprintIssue" className="c7n-backlog-sprintIssueVersion">
                    <span>{item.versionNames.join(', ')}</span>
                  </span>
                </Tooltip>
              ) : ''}
            </div>
            <div
              style={{
                padding: '0 3px',
                maxWidth: 86,
                marginLeft: !_.isNull(item.epicName) ? '12px' : 0,
                border: `1px solid ${item.color}`,
                display: !_.isNull(item.epicName) ? 'block' : 'none',
                color: 'rgba(0,0,0,0.36)',
              }}
              label="sprintIssue"
              className="c7n-backlog-sprintIssueRight"
            >
              {!_.isNull(item.epicName) ? (
                <Tooltip title={`史诗: ${item.epicName}`}>
                  <span
                    label="sprintIssue"
                    className="c7n-backlog-sprintIssueEpic"
                    style={{
                      color: item.color,
                    }}
                  >
                    {item.epicName}
                  </span>
                </Tooltip>
              ) : ''}
            </div>
          </div>
          <div className="c7n-backlog-sprintSideRightItems">
            <div
              style={{
                maxWidth: 105,
                marginLeft: !_.isNull(item.assigneeName) ? '12px' : 0,
                flexGrow: 0,
                flexShrink: 0,
              }}
              label="sprintIssue"
              className="c7n-backlog-sprintIssueRight"
            >
              {item.assigneeId && (
                <UserHead
                  user={{
                    id: item.assigneeId,
                    loginName: '',
                    realName: item.assigneeName,
                    avatar: item.imageUrl,
                  }}
                />
              )}

            </div>
            <div
              style={{
                width: 63,
                marginLeft: !_.isNull(item.statusMapDTO && item.statusMapDTO.name) ? '12px' : 0,
              }}
              label="sprintIssue"
              className="c7n-backlog-sprintIssueRight"
            >
              <Tooltip title={`状态: ${item.statusMapDTO ? item.statusMapDTO.name : ''}`}>
                <div>
                  <StatusTag
                    data={item.statusMapDTO}
                  />
                </div>
              </Tooltip>

            </div>
            <div
              style={{
                minWidth: 27,
                marginLeft: '12px',
              }}
              label="sprintIssue"
              className="c7n-backlog-sprintIssueRight"
            >
              <Tooltip title={`故事点: ${item.storyPoints}`}>
                <div
                  label="sprintIssue"
                  className="c7n-backlog-sprintIssueStoryPoint"
                  style={{
                    visibility: item.storyPoints && item.issueTypeDTO && item.issueTypeDTO.typeCode === 'story' ? 'visible' : 'hidden',
                  }}
                >
                  {item.storyPoints}
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SprintIssue;
