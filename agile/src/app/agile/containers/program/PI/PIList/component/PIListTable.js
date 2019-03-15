import React, { memo } from 'react';
import { Table } from 'choerodon-ui';
import propTypes from 'prop-types';

const PIListTable = ({ columns, dataSource }) => (
  <Table
    filterBar={false}
    pagination={false}
    rowKey={record => record.id}
    columns={columns}
    dataSource={dataSource}
  />
);
PIListTable.propTypes = {
  columns: propTypes.array.isRequired,
  dataSource: propTypes.array.isRequired,
};
export default memo(PIListTable);
