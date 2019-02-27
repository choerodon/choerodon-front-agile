/**
 * 列状态
 */
import React, { Component } from 'react';
import './StatusColumn.scss';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';

@observer
class StatusColumn extends Component {
  render() {
    // const { columnData } = this.props;
    return [...ScrumBoardStore.getHeaderData.values()].filter(column => column.hasStatus).map(column => (
      <div
        className={classnames('c7n-scrumboard-statusHeader', {
          greaterThanMax: column.maxNum && ScrumBoardStore.getAllColumnCount.get(column.columnId) > column.maxNum,
          lessThanMin: column.minNum && ScrumBoardStore.getAllColumnCount.get(column.columnId) < column.minNum,
        })}
        key={column.columnId}
      >
        <div className="c7n-scrumboard-statusHeader-columnMsg">
          <p className="c7n-scrumboard-statusHeader-columnMsg-name">
            {column.columnName}
          </p>
          <p className="c7n-scrumboard-statusHeader-columnMsg-count">
            {`(${column.columnIssueCount})`}
          </p>
        </div>
        <div className="c7n-scrumboard-statusHeader-columnConstraint">
          {column.minNum && (
            <p className="c7n-scrumboard-statusHeader-columnConstraint-min">
              {`最小：${column.minNum}`}
            </p>
          )}
          {column.maxNum && (
            <p className="c7n-scrumboard-statusHeader-columnConstraint-max">
              {`最大：${column.maxNum}`}
            </p>
          )}
        </div>
      </div>
    ));
  }
}

export default StatusColumn;
