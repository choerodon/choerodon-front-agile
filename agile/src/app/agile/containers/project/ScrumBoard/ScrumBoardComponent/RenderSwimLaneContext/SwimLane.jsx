/**
 * 列状态
 */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { trace } from 'mobx';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './SwimLane.scss';
import RenderSwimLaneContext from './index';
import ColumnProvider from './ColumnProvider';
import StatusProvider from './StatusProvider';
import CardProvider from './CardProvider';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import EpicRenderHeader from './EpicRenderHeader';

@inject('AppState')
@observer
class SwimLane extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderEpicLane = mode => (
    <EpicRenderHeader
      parentIssueArr={ScrumBoardStore.getInterconnectedData}
      otherIssueWithoutParent={ScrumBoardStore.getOtherQuestion}
      mode={mode}
      fromEpic
    >
      {(parentIssue, epicPrefix) => this.renderParentWithSub('parent_child', true, parentIssue, epicPrefix)}
    </EpicRenderHeader>
  );

  /**
   * 渲染被分配的任务列
   * @returns {Array}
   */
  renderParentWithSub = (mode, fromEpic = null, parentIssue = null, epicPrefix = null, style = {}) => (
    <RenderSwimLaneContext
      // key={issue.issueId}
      parentIssueArr={fromEpic ? parentIssue.interConnectedDataMap : ScrumBoardStore.getInterconnectedData}
      otherIssueWithoutParent={fromEpic ? parentIssue.unInterConnectedDataMap : ScrumBoardStore.getOtherQuestion}
      // mapStructure={mapStructure}
      // style={style}
      reAssignStyle={fromEpic}
      epicPrefix={epicPrefix}
      mode={mode}
    >
      {key => this.renderSwimLane(key)}
    </RenderSwimLaneContext>
  );

  renderSwimLane = (key) => {
    const { mapStructure, onDragEnd, onDragStart } = this.props;
    return (
      <DragDropContext
        onDragEnd={(start) => {
          onDragEnd(start);
        }}
        onDragStart={(start) => {
          onDragStart(start);
        }}
      >
        <ColumnProvider
          className="c7n-swimlaneContext-itemBodyColumn"
          {...mapStructure}
        >
          {(statusArr, columnId) => (
            <StatusProvider
              statusData={statusArr}
              columnId={columnId}
              keyId={key}
            >
              {(keyId, id, issueProvider) => <CardProvider keyId={keyId} id={id} issueProvider={issueProvider} />}
            </StatusProvider>
          )}
        </ColumnProvider>
      </DragDropContext>
    );
  };

  renderContext = (mode) => {
    switch (mode) {
      case 'assignee':
      case 'parent_child':
        return this.renderParentWithSub(mode);
      case 'swimlane_epic':
        return this.renderEpicLane(mode);
      case 'swimlane_none':
        return this.renderParentWithSub(mode);
      default:
        return null;
    }
  };

  render() {
    trace(true);
    const { mode } = this.props;
    return (
      this.renderContext(mode)
    );
  }
}

export default SwimLane;
