import React, { memo } from 'react';
import { Table } from 'choerodon-ui';
import propTypes from 'prop-types';

const PIListTable = ({ columns, dataSource }) => (
  <Table
    filterBar={false}
    pagination={false}
    rowKey={record => record.id}
    columns={columns}
    dataSource={dataSource.sort((a, b) => b.id - a.id)}
  />
);
PIListTable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  columns: propTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  dataSource: propTypes.array.isRequired,
};
export default memo(PIListTable);
