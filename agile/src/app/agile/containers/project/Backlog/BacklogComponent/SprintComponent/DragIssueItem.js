import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { observer, inject } from 'mobx-react';
import SideBorder from './SideBorder';
import SprintCount from './SprintCount';
import SprintIssue from './SprintIssue';

@observer
class DragIssueItem extends Component {
  // shouldComponentUpdate(nextProps, nextState) {
  //   const itemProperty = ['assigneeId', 'assigneeName', 'categoryCode', 'color', 'description', 'epicId', 'epicName', 'imageUrl', 'issueId', 'issueNum', 'issueTypeDTO', 'objectVersionNumber', 'priorityCode', 'priorityDTO', 'statusMapDTO', 'statusName', 'storyPoints', 'summary', 'typeCode', 'versionIds', 'versionNames'];
  //   const { item } = this.props;
  //   return itemProperty.some((property) => {
  //     if (typeof nextProps.item[property] !== 'object') {
  //       return nextProps.item[property] !== item[property];
  //     } else {
  //       return JSON.stringify(nextProps.item[property]) !== JSON.stringify(item[property]);
  //     }
  //   });
  // }

  /**
   *渲染issue背景色
   *
   * @param {*} item
   * @returns
   * @memberof SprintIssue
   */
  renderIssueBackground =(item) => {
    const { store } = this.props;
    if (store.getClickIssueDetail.issueId === item.issueId) {
      return '#F6F8FF';
    } else if (store.getIsDragging) {
      return 'white';
    } else {
      return 'unset';
    }
  }

  /**
   *根据打开的组件个数 判断issue样式
   *
   * @returns
   * @memberof SprintIssue
   */
  renderIssueDisplay=() => {
    let flag = 0;
    const {
      epicVisible, versionVisible, store, draggableId, selected,
    } = this.props;
    if (epicVisible) {
      flag += 1;
    }
    if (versionVisible) {
      flag += 1;
    }
    if (JSON.stringify(store.getClickIssueDetail) !== '{}') {
      flag += 1;
    }
    return flag >= 2;
  };

  render() {
    const {
      store, item, draggableId, index, handleClickIssue, sprintId, epicVisible, versionVisible, selected,
    } = this.props;

    const getSelect = store.getSelectIssue;
    return (
      <Draggable key={item.issueId} draggableId={item.issueId} index={index}>
        {(provided1, snapshot1) => (
          <div
            id={item.issueId}
            className={store.getIsDragging ? 'c7n-backlog-sprintIssue' : 'c7n-backlog-sprintIssue c7n-backlog-sprintIssueHover'}
            style={{
              position: 'relative',
            }}
            label="sprintIssue"
          >
            <div
              className="c7n-backlog-sprintIssueItem"
              ref={provided1.innerRef}
              {...provided1.draggableProps}
              {...provided1.dragHandleProps}
              style={{
                userSelect: 'none',
                background: getSelect.includes(item.issueId) ? '#EFF2F9' : this.renderIssueBackground(item),
                padding: '10px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.12)',
                ...provided1.draggableProps.style,
                fontSize: 13,
                display: this.renderIssueDisplay() ? 'block' : 'flex',
                alignItems: 'center',
                cursor: 'move',
                flexWrap: 'nowrap',
                justifyContent: 'space-between',
                // position: 'relative',
              }}
              label="sprintIssue"
              role="none"
              onClick={(e) => {
                handleClickIssue(sprintId, item, e);
              }}
            >
              <SideBorder
                item={item}
                clickIssue={store.getClickIssueDetail.issueId}
              />
              <SprintCount
                item={item}
                draggableId={draggableId}
                selected={selected}
              />
              <SprintIssue
                item={item}
                epicVisible={epicVisible}
                versionVisible={versionVisible}
                issueDisplay={this.renderIssueDisplay()}
              />
            </div>
            {provided1.placeholder}
          </div>
        )}
      </Draggable>    
    );
  }
}

export default DragIssueItem;
