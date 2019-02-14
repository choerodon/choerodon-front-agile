import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Collapse } from 'choerodon-ui';
import './RenderSwimLaneContext.scss';
import { DragDropContext } from 'react-beautiful-dnd';
import TypeTag from '../../../../../components/TypeTag';
import StatusTag from '../../../../../components/StatusTag';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import SwimLaneHeader from './SwimLaneHeader.jsx';

const { Panel } = Collapse;

@inject('AppState')
@observer
class EpicRenderHeader extends Component {
  getPanelKey = (key) => {
    if (key === 'other') {
      return 'swimlane_epic-other';
    } else {
      return `swimlane_epic-${key}`;
    }
  };

  getDefaultExpanded = issueArr => [...issueArr.map(issue => `swimlane_epic-${issue.epicId}`), 'swimlane_epic-other'];

  getPanelItem = (key, parentIssue) => {
    const { children, mode } = this.props;
    return (
      <Panel
        key={this.getPanelKey(key)}
        className="c7n-swimlaneContext-container"
        header={(
          <SwimLaneHeader
            parentIssue={parentIssue}
            mode={mode}
            keyId={key}
            subIssueDataLength={parentIssue.issueArrLength}
          />
        )}
      >
        {children(key === 'other' ? parentIssue : parentIssue.subIssueData, key === 'other' ? 'swimlane_epic-unInterconnected' : `swimlane_epic-${parentIssue.epicId}`)}
      </Panel>
    );
  };

  render() {
    const { parentIssueArr, otherIssueWithoutParent } = this.props;
    return (
      <Collapse
        defaultActiveKey={this.getDefaultExpanded([...parentIssueArr.values()], otherIssueWithoutParent)}
        forceRender
        bordered={false}
      >
        {Array.from(parentIssueArr).map(([key, value]) => this.getPanelItem(key, value))}
        {this.getPanelItem('other', otherIssueWithoutParent)}
      </Collapse>
    );
  }
}

export default EpicRenderHeader;
