/**
 * 列状态
 */
import React, { Component } from 'react';
import './StatusColumn.scss';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import BoardStore from '../../../../../../stores/Program/Board/BoardStore';

@observer
class StatusColumn extends Component {
  render() {
    // const columnConstraintsIsOn = BoardStore.getAllColumnCount.size > 0;
    return [...BoardStore.getHeaderData.values()].filter(column => column.hasStatus).map(column => (
      <div
        className={classnames('c7n-board-statusHeader', {
          // greaterThanMax: columnConstraintsIsOn && column.maxNum !== null && BoardStore.getAllColumnCount.get(column.columnId) > column.maxNum,
          // lessThanMin: columnConstraintsIsOn && column.minNum !== null && BoardStore.getAllColumnCount.get(column.columnId) < column.minNum,
        })}
        key={column.columnId}
      >
        <div className={classnames('c7n-board-statusHeader-columnMsg', {
          // alignToCenter: !columnConstraintsIsOn || (column.minNum === null && column.maxNum === null),
          alignToCenter: true,
        })}
        >
          <p className="c7n-board-statusHeader-columnMsg-name">
            {column.columnName}
          </p>
          <p className="c7n-board-statusHeader-columnMsg-count">
            {`(${column.columnIssueCount})`}
          </p>
        </div>
        {/* {
          columnConstraintsIsOn ? (
            <div className="c7n-board-statusHeader-columnConstraint">
              {column.minNum !== null ? (
                <p className="c7n-board-statusHeader-columnConstraint-min display-in-oneline">
                  {`最小：${column.minNum}`}
                </p>
              ) : null}
              {column.maxNum !== null ? (
                <p className="c7n-board-statusHeader-columnConstraint-max display-in-oneline">
                  {`最大：${column.maxNum}`}
                </p>
              ) : null}
            </div>
          ) : null
        } */}
      </div>
    ));
  }
}

export default StatusColumn;
