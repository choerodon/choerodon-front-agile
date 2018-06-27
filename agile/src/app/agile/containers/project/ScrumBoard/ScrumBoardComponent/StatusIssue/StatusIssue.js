import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Draggable } from 'react-beautiful-dnd';
import { Icon, Avatar, Tooltip } from 'choerodon-ui';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import './StatusIssue.scss';

@observer
class StatusIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  getFirst(str) {
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return '';
  }
  getParent(id, type) {
    const data = ScrumBoardStore.getBoardData;
    let parent;
    _.forEach(data, (item) => {
      _.forEach(item.subStatuses, (ss) => {
        _.forEach(ss.issues, (iss) => {
          if (iss.issueId === id) {
            parent = iss;
          }
        });
      });
    });
    if (parent) {
      if (type) {
        return true;
      } else {
        return (
          <div
            className="textDisplayOneColumn"
            style={{
              padding: '10px',
              border: '1px solid rgba(0,0,0,0.20)',
              borderRadius: '2px',
              background: '#F3F3F3',
              lineHeight: '24px',
            }}
          >
            <span>
              {parent.issueNum}
            </span>
            <span style={{ marginLeft: 10 }}>
              {parent.summary}
            </span>
          </div>
        );
      }
    }
    if (type) {
      return false;
    } else {
      return '';
    }
  }
  renderIssueDisplay() {
    const dragStartData = ScrumBoardStore.getDragStartItem;
    // 没有开始拖
    if (JSON.stringify(dragStartData) === '{}') {
      return 'visible';
    } else {
      const jsonDraggableId = JSON.parse(dragStartData.draggableId);
      const jsonSource = JSON.parse(dragStartData.source.droppableId);
      if (String(this.props.data.issueId) === String(jsonDraggableId.issueId)) {
        // 如果是当前拖动元素
        return 'visible';
      } else if (String(this.props.droppableId) === String(jsonSource.code)) {
        //   如果是拖动同一列的
        return 'visible';
      } else {
        return 'hidden';
      }
    }
  }
  renderTypeCode(type) {
    const typeCode = this.props.data.typeCode;
    if (typeCode === 'story') {
      if (type === 'background') {
        return '#00BFA5';
      } else {
        return (
          <Tooltip title="类型： 故事">
            <Icon style={{ color: 'white', fontSize: '14px' }} type="class" />
          </Tooltip>
        );
      }
    } else if (typeCode === 'bug') {
      if (type === 'background') {
        return '#F44336';
      } else {
        return (
          <Tooltip title="类型： 缺陷"> 
            <Icon style={{ color: 'white', fontSize: '14px' }} type="bug_report" />
          </Tooltip>
        );
      }
    } else if (typeCode === 'task') {
      if (type === 'background') {
        return '#4D90FE';
      } else {
        return (
          <Tooltip title="类型： 任务">
            <Icon style={{ color: 'white', fontSize: '14px' }} type="assignment" />
          </Tooltip>
        );
      }
    } else if (type === 'background') {
      return '#4D90FE';
    } else {
      return (
        <Tooltip title="类型： 子任务">
          <Icon style={{ color: 'white', fontSize: '14px' }} type="sutask" />
        </Tooltip>
      );
    }
  }
  renderStatusBackground() {
    if (this.props.categoryCode === 'todo') {
      return 'rgb(255, 177, 0)';
    } else if (this.props.categoryCode === 'doing') {
      return 'rgb(77, 144, 254)';
    } else if (this.props.categoryCode === 'done') {
      return 'rgb(0, 191, 165)';
    } else {
      return 'gray';
    }
  }
  renderPriorityStyle(type, item) {
    if (type === 'color') {
      if (item.priorityName === '中') {
        return 'rgb(53, 117, 223)';
      } else if (item.priorityName === '高') {
        return 'rgb(255, 177, 0)';
      } else {
        return 'rgba(0, 0, 0, 0.36)';
      }
    } else if (item.priorityName === '中') {
      return 'rgba(77, 144, 254, 0.2)';
    } else if (item.priorityName === '高') {
      return 'rgba(255, 177, 0, 0.12)';
    } else {
      return 'rgba(0, 0, 0, 0.08)';
    }
  }


  render() {
    const item = this.props.data;
    const index = this.props.index;
    const issueId = JSON.parse(JSON.stringify(ScrumBoardStore.getClickIssueDetail)).issueId;
    return (
      <div className="c7n-boardIssue">
        <Draggable 
          key={item.issueId} 
          draggableId={JSON.stringify({
            objectVersionNumber: item.objectVersionNumber,
            issueId: item.issueId,
          })} 
          index={index}
        >
          {(provided, snapshot) => 
            (
              <div>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    userSelect: 'none',
                    // background: snapshot.isDragging ? 'lightgreen' : 'white',  
                    minHeight: 83,
                    // borderLeft: '1px solid rgba(0,0,0,0.20)',
                    // borderRight: '1px solid rgba(0,0,0,0.20)',
                    cursor: 'move',
                    // visibility: this.renderIssueDisplay(),
                    ...provided.draggableProps.style,
                    // display: 'flex',
                    overflow: 'hidden',
                  }}
                  role="none"
                  onClick={() => {
                    ScrumBoardStore.setClickIssueDetail(item);
                  }}
                >
                  {
                    item.parentIssueId && ScrumBoardStore.getSwimLaneCode === 'assignee' ? 
                      this.getParent(item.parentIssueId)
                      : ''
                  }
                  <div 
                    className="c7n-scrumboard-issue"
                    style={{
                      marginLeft: item.parentIssueId && ScrumBoardStore.getSwimLaneCode === 'assignee' && this.getParent(item.parentIssueId, 'boolean') ? 16 : 0,
                      background: ScrumBoardStore.getClickIssueDetail.issueId === item.issueId ? 'rgba(140, 158, 255, 0.08)' : 'white',  
                      borderTop: item.parentIssueId && ScrumBoardStore.getSwimLaneCode === 'assignee' && this.getParent(item.parentIssueId, 'boolean') ? 'unset' : '1px solid rgba(0, 0, 0, 0.20)',
                    }}
                  >
                    <div 
                      className="c7n-scrumboard-issueBorder" 
                      style={{
                        background: this.renderTypeCode('background'),
                        display: ScrumBoardStore.getSwimLaneCode === 'assignee' ? 'block' : 'none',
                      }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div
                        label={ScrumBoardStore.getClickIssueDetail.issueId}
                        className="c7n-scrumboard-issueTop"
                        style={{
                          display: issueId ? 'block' : 'flex',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            className="c7n-scrumboard-issueIcon"
                            style={{
                              display: ScrumBoardStore.getSwimLaneCode === 'assignee' ? 'block' : 'none',
                              background: this.renderTypeCode('background'),
                            }}
                          >
                            {this.renderTypeCode('icon')}
                          </div>
                          <p style={{ marginLeft: 5 }} className="textDisplayOneColumn">{item.issueNum}</p>
                        </div>
                        <p
                          style={{
                            margin: ScrumBoardStore.getClickIssueDetail.issueId ? '5px 0 5px 0' : '0 0 0 13px',
                          }}
                        >
                          <Tooltip title={`状态: ${this.props.statusName}`}>
                            <span
                              style={{ 
                                borderRadius: 2, 
                                padding: '2px 8px', 
                                background: this.renderStatusBackground(),
                                // background: '#4D90FE', 
                                color: 'white',
                                maxWidth: 56,
                              }}
                              className="textDisplayOneColumn"
                            >
                              {this.props.statusName}
                            </span>
                          </Tooltip>
                        </p>
                      </div>
                      <div className="c7n-scrumboard-issueBottom">
                        <Tooltip title={`优先级: ${item.priorityName}`}>
                          <p
                            style={{ 
                              flexBasis: '20px',
                              background: this.renderPriorityStyle('background', item),
                              color: this.renderPriorityStyle('color', item),
                              textAlign: 'center',
                            }}
                          >{item.priorityName}</p>
                        </Tooltip>
                        <Tooltip title={item.summary} placement="topLeft">
                          <p
                            className="textDisplayOneColumn" 
                            style={{ 
                              flexBasis: '90%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: '20px',
                              paddingLeft: 10,
                            }}
                          >{item.summary}</p>
                        </Tooltip>
                      </div>
                    </div>
                    {/* <div style={{ flexShrink: 0 }} cla
                ssName="c7n-scrumboard-issueSide">M</div> */}
                    {
                      item.assigneeName ? (
                        <Tooltip title={`经办人: ${item.assigneeName}`}>
                          <Avatar
                            src={item.imageUrl ? item.imageUrl : undefined}
                            style={{
                              flexShrink: 0,
                            }}
                          >
                            {!item.imageUrl && item.assigneeName ? this.getFirst(item.assigneeName) : ''}
                          </Avatar>
                        </Tooltip>
                      ) : ''
                    }
                  </div>
                </div>
                {provided.placeholder}
              </div>
            )
          }
        </Draggable>
      </div>
      
    );
  }
}

export default StatusIssue;

