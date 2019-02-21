import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';

@observer
class StatusCouldDragOn extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const { cantDragOn } = this.props;
    return nextProps.cantDragOn !== cantDragOn;
  }

  render() {
    const { cantDragOn } = this.props;
    return (
      <div className={cantDragOn ? 'statusCantDragOn' : ''} />
    );
  }
}

export default StatusCouldDragOn;
