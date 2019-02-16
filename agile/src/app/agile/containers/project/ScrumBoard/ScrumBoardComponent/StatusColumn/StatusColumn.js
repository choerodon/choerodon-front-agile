/**
 * 列状态
 */
import React, { Component } from 'react';
import './StatusColumn.scss';
import { observer } from 'mobx-react';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';

@observer
class StatusColumn extends Component {
  render() {
    const { columnData } = this.props;
    return columnData.filter(column => column.hasStatus).map(column => (
      <div className="c7n-scrumboard-statusHeader" key={column.columnId}>
        <p className="c7n-scrumboard-statusHeader-name">
          {column.columnName}
        </p>
        <p className="c7n-scrumboard-statusHeader-count">
          {`(${column.columnIssueCount})`}
        </p>
      </div>
    ));
  }
}

export default StatusColumn;
