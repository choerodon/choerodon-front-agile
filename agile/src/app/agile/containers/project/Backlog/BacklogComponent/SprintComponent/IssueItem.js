import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { observer, inject } from 'mobx-react';
import { Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import Typetag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';
import { STATUS } from '../../../../../common/Constant';
import DragIssueItem from './DragIssueItem';

@observer
class IssueItem extends Component {
  componentDidUpdate() {
    console.log('didUpdate');
  }

  render() {
    const {
      store, data, handleClickIssue, sprintId, draggableId, selected, epicVisible, versionVisible,
    } = this.props;
    const getSelect = store.getSelectIssue;
    return data.map((item, index) => (
      <DragIssueItem
        key={item.issueId}
        store={store}
        item={item}
        draggableId={draggableId}
        index={index}
        handleClickIssue={handleClickIssue}
        sprintId={sprintId}
        epicVisible={epicVisible}
        versionVisible={versionVisible}
        selected={selected}
      />
    ));
  }
}

export default IssueItem;
