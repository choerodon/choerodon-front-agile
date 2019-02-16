import React, { Component } from 'react';
import { Icon, Tooltip, Rate } from 'choerodon-ui';
import { observer } from 'mobx-react';
import TypeTag from '../../../../../components/TypeTag';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import './StatusIssue.scss';
import UserHead from '../../../../../components/UserHead';

@observer
export default class CardProvider extends React.Component {
  constructor(props) {
    super(props);
    this.ref = {};
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (JSON.stringify(nextProps) === JSON.stringify(this.props)) {
      return false;
    }
    return true;
  }

  renderStatusBackground = (categoryCode) => {
    if (categoryCode === 'todo') {
      return 'rgb(255, 177, 0)';
    } else if (categoryCode === 'doing') {
      return 'rgb(77, 144, 254)';
    } else if (categoryCode === 'done') {
      return 'rgb(0, 191, 165)';
    } else {
      return 'gray';
    }
  };

  convertedDay = (stayDay) => {
    if (stayDay >= 0 && stayDay <= 6) {
      return 1;
    } else if (stayDay >= 7 && stayDay <= 10) {
      return 2;
    } else if (stayDay >= 11 && stayDay <= 15) {
      return 3;
    } else {
      return 4;
    }
  };

  render() {
    const {
      completed, issue, statusName, categoryCode, onClick, ...otherProps
    } = this.props;
    return (
      <div
        className={`c7n-scrumboard-issue ${ScrumBoardStore.currentClickId === issue.issueId ? 'shouldBackgroundColorChange' : ''}`}
        role="none"
        onClick={(e) => {
          onClick();
        }}
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
              // label={ScrumBoardStore.getClickIssueDetail.issueId}
            className="c7n-scrumboard-issueTop"
            style={{
              // display: issueId ? 'block' : 'flex',
              // flexWrap: 'wrap',
              display: 'flex',
              justifyContent: 'space-between',
              // flexDirection: ScrumBoardStore.getClickIssueDetail.issueId ?
              // 'column' : 'row',
              // alignItems: 'center',
              // height: '32px',
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
                <Tooltip title={issue.issueTypeDTO ? issue.issueTypeDTO.name : ''}>
                  <TypeTag
                    data={issue.issueTypeDTO}
                  />
                </Tooltip>
                <p
                  style={{ marginLeft: 5, textDecoration: completed ? 'line-through' : '' }}
                  className="textDisplayOneColumn"
                >
                  {issue.issueNum}
                </p>
                {issue.stayDay >= 3 && !completed ? (
                  <Tooltip title={`卡片停留 ${issue.stayDay} 天`}>
                    <div>
                      <Rate
                        character={<Icon type="brightness_1" />}
                        allowHalf
                        disabled
                        value={this.convertedDay(issue.stayDay)}
                        count={4}
                        className={issue.stayDay <= 3 ? 'notEmergency' : 'emergency'}
                      />
                    </div>
                  </Tooltip>
                ) : ''}
              </div>
              <div style={{
                display: 'flex',
                // paddingLeft: ScrumBoardStore.getClickIssueDetail.issueId ? 0 : 24,
                alignItems: 'center',
                flexGrow: '1',
                marginBottom: 4,
              }}
              >
                <Tooltip title={`状态: ${statusName}`}>
                  <p
                    style={{
                      borderRadius: 2,
                      paddingLeft: 4,
                      paddingRight: 4,
                      background: this.renderStatusBackground(categoryCode),
                      color: 'white',
                      maxWidth: 50,
                      minWidth: 20,
                      textAlign: 'center',
                      height: 20,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {statusName}
                  </p>
                </Tooltip>
                <Tooltip title={`优先级: ${issue.priorityDTO && issue.priorityDTO.name}`}>
                  <p
                    style={{
                      background: `${issue.priorityDTO ? issue.priorityDTO.colour : '#FFFFFF'}1F`,
                      color: issue.priorityDTO ? issue.priorityDTO.colour : '#FFFFFF',
                      textAlign: 'center',
                      marginLeft: '8px',
                      minWidth: 16,
                      maxWidth: 46,
                      paddingLeft: 2,
                      paddingRight: 2,
                      height: 20,
                      borderRadius: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {issue.priorityDTO && issue.priorityDTO.name}
                  </p>
                </Tooltip>
              </div>
            </div>
            {
              <Tooltip title={issue.assigneeName ? `经办人: ${issue.assigneeName}` : ''}>
                {
                    issue.assigneeName ? (
                      <UserHead
                        hiddenText
                        size={32}
                        style={{ marginLeft: 8 }}
                        user={{
                          id: issue.assigneeId,
                          loginName: issue.assigneeName,
                          realName: issue.assigneeName,
                          avatar: issue.imageUrl,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                        marginLeft: 8,
                        marginBottom: 4,
                      }}
                      />
                    )
                  }
              </Tooltip>
              }
          </div>
          <div className="c7n-scrumboard-issueBottom">
            <Tooltip title={issue.summary} placement="topLeft">
              <p className="textDisplayTwoColumn">
                {issue.summary}
              </p>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}
