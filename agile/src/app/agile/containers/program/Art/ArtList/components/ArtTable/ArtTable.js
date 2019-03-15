import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'choerodon-ui';
import moment from 'moment';
import StatusTag from '../../../../../../components/StatusTag';

const propTypes = {
  dataSource: PropTypes.shape({}).isRequired,
  onEditArtClick: PropTypes.func.isRequired,
  onArtNameClick: PropTypes.func.isRequired,
  
};
const ArtTable = ({ 
  dataSource,
  onEditArtClick,
  onArtNameClick,
}) => {
  const columns = [{
    title: '编号',
    dataIndex: 'code',
    key: 'code',  
    render: (code, record) => `#${code}-${record.id}`,  
  }, {
    title: '名称',
    dataIndex: 'name',
    key: 'name',   
    render: (name, record) => <span role="none" onClick={() => { onArtNameClick(record); }} style={{ color: '#3F51B5', cursor: 'pointer' }}>{name}</span>,
  }, {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
    render: startDate => moment(startDate).format('YYYY-MM-DD'),
  }, {
    title: '状态',
    dataIndex: 'enabled',
    key: 'enabled',
    render: enabled => <StatusTag categoryCode={enabled ? 'doing' : 'todo'} name={enabled ? '启用' : '未启用'} />,
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
