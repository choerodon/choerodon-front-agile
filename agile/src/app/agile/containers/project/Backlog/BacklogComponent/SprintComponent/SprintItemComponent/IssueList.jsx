import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import { Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import Typetag from '../../../../../../components/TypeTag';
import UserHead from '../../../../../../components/UserHead';
import { STATUS } from '../../../../../../common/Constant';
import SideBorder from '../SideBorder';
import SprintCount from '../SprintCount';
import SprintIssue from '../SprintIssue';
import BacklogStore from '../../../../../../stores/project/backlog/BacklogStore';
import Backlog from '../../../../userMap/component/Backlog/Backlog';
import IssueItem from './IssueItem';

@observer
class IssueList extends Component {
  myOnMouseDown = (e, item, index) => {
    e.stopPropagation();
    const { sprintId } = this.props;
    // if (BacklogStore.getPrevClickedIssue) {
    if (!(e.shiftKey && (e.ctrlKey || e.metaKey))) {
      if (e.shiftKey) {
        BacklogStore.dealWithMultiSelect(sprintId, item, 'shift');
      } else if (e.ctrlKey || e.metaKey) {
        BacklogStore.dealWithMultiSelect(sprintId, item, 'ctrl');
      } else {
        BacklogStore.clickedOnce(sprintId, item);
      }
    }
    // } else {
    // }
  };

  render() {
    const { sprintId } = this.props;
    // const getSelect = store.getSelectIssue;

    return BacklogStore.getIssueMap.get(sprintId).map((item, index) => (
      <Draggable key={item.issueId} draggableId={item.issueId} index={index}>
        {(provided, snapshot) => (
          <div
            key={item.issueId}
            className="c7n-backlog-sprintIssue"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <IssueItem
              key={item.issueId}
              item={item}
              onClick={this.myOnMouseDown}
            />
            {provided.placeholder}
          </div>
        )}
      </Draggable>
    ));
  }
}

export default IssueList;
