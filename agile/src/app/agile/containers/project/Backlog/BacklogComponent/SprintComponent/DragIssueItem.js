import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { observer, inject } from 'mobx-react';
import SideBorder from './SideBorder';
import SprintCount from './SprintCount';
import SprintIssue from './SprintIssue';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

@observer
class DragIssueItem extends Component {
  render() {
    const {
      item, draggableId, index, handleClickIssue, sprintId, epicVisible, versionVisible, selected,
    } = this.props;

    const getSelect = BacklogStore.getSelectIssue;
    return (
      <Draggable key={item.issueId} draggableId={item.issueId} index={index}>
        {(provided1, snapshot1) => (
          <div
            id={item.issueId}
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
                // position: 'relative',
              }}
              label="sprintIssue"
              role="none"
              onClick={(e) => {
                handleClickIssue(sprintId, item, e);
              }}
            >
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
