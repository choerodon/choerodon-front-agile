import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { Droppable } from 'react-beautiful-dnd';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import StatusCouldDragOn from './StatusCouldDragOn';

const getDragOver = isDraggingOver => ({
  background: isDraggingOver ? '#f2f9f4' : 'none',
  borderColor: isDraggingOver ? '#1ab16f' : 'inherit',
});

const getStatusNameStyle = isDraggingOver => ({
  color: isDraggingOver ? '#1ab16f' : '#26348b',
});

@observer
export default class StatusProvider extends Component {
  getStatus({
    completed, name: statusName, categoryCode, statusId,
  }) {
    const { children, keyId, columnId } = this.props;
    return (
      <div
        key={statusId}
        className="c7n-swimlaneContext-itemBodyStatus"
        onClick={this.handleColumnClick}
        role="none"
      >
        <Droppable
          droppableId={`${statusId}/${columnId}`}
          isDropDisabled={ScrumBoardStore.getCanDragOn.get(statusId)}
        >
          {(provided, snapshot) => (
            <React.Fragment>
              <StatusCouldDragOn cantDragOn={ScrumBoardStore.getCanDragOn.get(statusId)} />
              <div
                ref={provided.innerRef}
                className="c7n-swimlaneContext-itemBodyStatus-container"
                style={getDragOver(snapshot.isDraggingOver)}
                {...provided.droppableProps}
              >
                <span
                  className="c7n-swimlaneContext-itemBodyStatus-container-statusName"
                  style={getStatusNameStyle(snapshot.isDraggingOver)}
                >
                  {statusName}
                </span>
                {children(keyId, statusId, {
                  completed,
                  statusName,
                  categoryCode,
                })}
                {provided.placeholder}
              </div>
            </React.Fragment>
          )}
        </Droppable>
      </div>
    );
  }

  handleColumnClick = () => {
    ScrumBoardStore.resetClickedIssue();
  };

  render() {
    const { statusData, keyId } = this.props;
    return statusData.map(status => this.getStatus(status));
  }
}
