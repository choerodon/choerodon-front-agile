import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Icon, Button, Avatar } from 'choerodon-ui';
import './SwimLaneContext.scss';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import StatusTag from '../../../../../components/StatusTag';
import TypeTag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';

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
    if (!str) {
      return '';
    }
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return str[0];
  }

  /**
   *类型
   *
   * @param {*} type
   * @returns
   * @memberof SwimLaneContext
   */
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

  /**
   *泳道名称
   *
   * @param {*} item
   * @returns
   * @memberof SwimLaneContext
   */
  renderSwimLaneTitle(item) {
    const { data, changeState } = this.props;
    const { expand } = this.state;
    let result;
    if (ScrumBoardStore.getSwimLaneCode === 'parent_child') {
      result = (
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon 
              style={{ fontSize: 17, cursor: 'pointer' }}
              type={expand ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
              role="none"
              onClick={() => {
                this.setState({
                  expand: !expand,
                });
              }}
            />
            <div
              style={{
                marginLeft: 8,
                marginRight: 6,
              }}
            >
              <TypeTag
                data={item.issueTypeDTO}
              />
            </div>
            <span
              style={{ cursor: 'pointer', width: '100px' }}
              role="none"
              onClick={() => {
                ScrumBoardStore.setClickIssueDetail(item);
              }}
            >
              {`#${item.issueNum}`}
            </span>
            <StatusTag
              data={{
                type: item.categoryCode,
                name: item.status,
              }}
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
              {item.summary}
            </span>
            <span className="c7n-parentIssue-count" style={{ whiteSpace: 'nowrap' }}>{`  (${item.count} 子任务)`}</span>

          </div>
          <Button
            type="primary"
            style={{
              display: ScrumBoardStore.judgeMoveParentToDone(data.categoryCode, data.issueId) ? 'block' : 'none',
            }}
            onClick={() => {
              changeState('judgeUpdateParent', {
                id: data.issueId,
                issueNumber: data.issueNum,
                code: data.categoryCode,
                objectVersionNumber: data.objectVersionNumber,
                typeId: data.issueTypeDTO && data.issueTypeDTO.id,
                statusId: data.statusId,
              });
            }}
          >
            {'移动到done'}
          </Button>
        </div>
      );
    } else if (ScrumBoardStore.getSwimLaneCode === 'assignee') {
      result = (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon 
            style={{ fontSize: 17, cursor: 'pointer', marginRight: 8 }}
            type={expand ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
            role="none"
            onClick={() => {
              this.setState({
                expand: !expand,
              });
            }}
          />
          <UserHead 
            hiddenText
            size={24}
            user={{
              id: item.assigneeId,
              loginName: item.assigneeName,
              realName: item.assigneeName,
              avatar: item.imageUrl,
            }}
          />
          {item.assigneeName}
          <span className="c7n-parentIssue-count">{`  (${item.count} 问题)`}</span>
        </div>
      );
    } else if (ScrumBoardStore.getSwimLaneCode === 'swimlane_epic') {
      result = (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon 
            style={{ fontSize: 17, cursor: 'pointer', marginRight: 8 }}
            type={expand ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
            role="none"
            onClick={() => {
              this.setState({
                expand: !expand,
              });
            }}
          />
          {item.epicName}
          <span className="c7n-parentIssue-count">{`  (${item.count} 问题)`}</span>
        </div>
      );
    }
    return result;
  }

  render() {
    const item = this.props.data;
    let id;
    if (ScrumBoardStore.getSwimLaneCode === 'parent_child') {
      // 故事泳道
      id = item.issueId;
    } else if (ScrumBoardStore.getSwimLaneCode === 'assignee') {
      // 经办人泳道
      id = item.assigneeId;
    } else if (ScrumBoardStore.getSwimLaneCode === 'swimlane_epic') {
      // 史诗
      id = item.epicId;
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
