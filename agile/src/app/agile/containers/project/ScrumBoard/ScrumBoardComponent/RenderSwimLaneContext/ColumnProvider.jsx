/* eslint-disable camelcase */
import React from 'react';
import { inject, observer } from 'mobx-react';

@observer
export default class ColumnProvider extends React.Component {
  getColumn(columnObj) {
    const { children, column_status_RelationMap } = this.props;
    const subStatusArr = column_status_RelationMap.get(columnObj.columnId);
    return (
      <div
        key={columnObj.columnId}
        className="c7n-swimlaneContext-itemBodyColumn"
      >
        {children(subStatusArr, columnObj.columnId)}
      </div>
    );
  }

  render() {
    const { columnStructure, column_status_RelationMap } = this.props;
    return columnStructure.filter(column => column_status_RelationMap.get(column.columnId).length > 0).map(column => this.getColumn(column));
  }
}
