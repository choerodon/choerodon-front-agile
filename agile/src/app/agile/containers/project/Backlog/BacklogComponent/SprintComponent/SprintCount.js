import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { observer, inject } from 'mobx-react';

@observer
class SprintCount extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (JSON.stringify(nextProps) === JSON.stringify(this.props)) {
      return false;
    }
    return true;
  }

  render() {
    const {
      item, draggableId, selected,
    } = this.props;
    return (
      <div
        className="c7n-backlog-sprintCount"
        style={{
          display: String(draggableId) === String(item.issueId) && selected.issueIds.length > 0 ? 'flex' : 'none',
        }}
        label="sprintIssue"
      >
        {selected.issueIds.length}
      </div>
    );
  }
}

export default SprintCount;
