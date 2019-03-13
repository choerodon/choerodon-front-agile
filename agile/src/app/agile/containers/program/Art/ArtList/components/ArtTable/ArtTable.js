import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'choerodon-ui';
import moment from 'moment';

const propTypes = {
  dataSource: PropTypes.shape({}).isRequired,
  onEditArtClick: PropTypes.func.isRequired,
};
const ArtTable = ({ 
  dataSource,
  onEditArtClick,
}) => {
  const columns = [{
    title: '编号',
    dataIndex: 'seqNumber',
    key: 'seqNumber',    
  }, {
    title: '名称',
    dataIndex: 'name',
    key: 'name',   
    render: name => <span style={{ color: '#3F51B5' }}>{name}</span>,
  }, {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
    render: startDate => moment(startDate).format('YYYY-MM-DD'),
  }, {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: status => status,
  }, {
    title: '创建日期',
    dataIndex: 'createDate',
    key: 'createDate',
    render: createDate => moment(createDate).format('YYYY-MM-DD'),
  }, {
    title: '',
    key: 'action',
    render: (text, record) => (<Button shape="circle" icon="mode_edit" onClick={() => { onEditArtClick(record); }} />),
  }];

  return (
    <Table
      rowKey="id"
      filterBar={false}   
      pagination={false}
      columns={columns}
      dataSource={dataSource}
    />
  );
};

ArtTable.propTypes = propTypes;

export default memo(ArtTable);
