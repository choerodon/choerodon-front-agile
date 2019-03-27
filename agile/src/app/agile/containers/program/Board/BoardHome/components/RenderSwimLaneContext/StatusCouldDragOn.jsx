import React, { Component } from 'react';
import { observer } from 'mobx-react';

import BoardStore from '../../../../../../stores/Program/Board/BoardStore';

@observer
class StatusCouldDragOn extends Component {
  shouldComponentUpdate(nextProps) {
    const { cantDragOn } = this.props;
    return nextProps.cantDragOn !== cantDragOn;
  }

  render() {
    const { statusId } = this.props;
    const cantDragOn = BoardStore.getCanDragOn.get(statusId);
    const hasActivePi = BoardStore.getActivePi;
    const isDragging = BoardStore.getIsDragging;
    return (
      <div className={cantDragOn && isDragging ? 'statusCantDragOn' : ''} />
    );
  }
}

export default StatusCouldDragOn;
