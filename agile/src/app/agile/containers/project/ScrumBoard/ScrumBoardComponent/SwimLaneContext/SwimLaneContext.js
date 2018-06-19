import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Icon, Button, Avatar } from 'choerodon-ui';
import _ from 'lodash';
import './SwimLaneContext.scss';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';

@inject('AppState')
@observer
class SwimLaneContext extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: true,
    };
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
  renderTypeCode(type) {
    const typeCode = this.props.data.typeCode;
    if (typeCode === 'story') {
      if (type === 'background') {
        return '#00BFA5';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="class" />
        );
      }
    } else if (typeCode === 'bug') {
      if (type === 'background') {
        return '#F44336';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="bug_report" />
        );
      }
    } else if (type === 'background') {
      return '#4D90FE';
    } else {
      return (
        <Icon style={{ color: 'white', fontSize: '14px' }} type="assignment" />
      );
    }
  }
  renderSwimLaneTitle(item) {
    let result;
    if (ScrumBoardStore.getSwimLaneCode === 'parent_child') {
      result = (
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon 
              style={{ fontSize: 17, cursor: 'pointer' }}
              type={this.state.expand ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
              role="none"
              onClick={() => {
                this.setState({
                  expand: !this.state.expand,
                });
              }}
            />
            <div
              className="c7n-parentIssue-icon"
              style={{
                marginLeft: 8,
                background: this.renderTypeCode('background'),
                marginRight: 6,
              }}
            >
              {this.renderTypeCode('icon')}
            </div>
            <span
              style={{ cursor: 'pointer' }}
              role="none"
              onClick={() => {
                ScrumBoardStore.setClickIssueDetail(item);
              }}
            >
            #{item.issueNum}
            </span>
            <div className="c7n-parentIssue-status">{item.status}</div>
            {item.summary}
          </div>
          <Button
            type="primary"
            style={{
              display: ScrumBoardStore.judgeMoveParentToDone(this.props.data.categoryCode, this.props.data.issueId) ? 'block' : 'none',
            }}
            onClick={() => {
              this.props.changeState('judgeUpdateParent', {
                id: this.props.data.issueId,
                issueNumber: this.props.data.issueNum,
                code: this.props.data.categoryCode,
                objectVersionNumber: this.props.data.objectVersionNumber,
              });
            }}
          >
        移动到done
          </Button>
        </div>
      );
    } else if (ScrumBoardStore.getSwimLaneCode === 'assignee') {
      result = (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon 
            style={{ fontSize: 17, cursor: 'pointer', marginRight: 8 }}
            type={this.state.expand ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
            role="none"
            onClick={() => {
              this.setState({
                expand: !this.state.expand,
              });
            }}
          />
          <Avatar
            src={item.imageUrl ? item.imageUrl : undefined}
            size="small"
          >
            {
              !item.imageUrl && item.assigneeName ? this.getFirst(item.assigneeName) : ''
            }
          </Avatar>
          {item.assigneeName}
        </div>
      );
    }
    return result;
  }
  render() {
    const item = this.props.data;
    let id;
    if (ScrumBoardStore.getSwimLaneCode === 'parent_child') {
      id = item.issueId;
    } else if (ScrumBoardStore.getSwimLaneCode === 'assignee') {
      id = item.assigneeId;
    }
    return (
      <div className="c7n-scrumboard-others">
        <div style={{ justifyContent: 'space-between' }} className="c7n-scrumboard-otherHeader">
          {this.renderSwimLaneTitle(item)}
          
        </div>
        <div 
          className="c7n-scrumboard-otherContent"
          style={{
            display: this.state.expand ? 'flex' : 'none',
          }}
        >
          <DragDropContext 
            onDragEnd={this.props.handleDragEnd.bind(this)}
            onDragStart={(start) => {
              ScrumBoardStore.setDragStartItem(start);
            }}
          >
            {this.props.renderIssueColumns(id)}
          </DragDropContext>
        </div>
      </div>
    );
  }
}

export default SwimLaneContext;

