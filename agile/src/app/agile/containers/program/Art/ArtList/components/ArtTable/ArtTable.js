import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'choerodon-ui';
import moment from 'moment';
import StatusTag from '../../../../../../components/StatusTag';

const propTypes = {
  dataSource: PropTypes.shape({}).isRequired,
  onEditArtClick: PropTypes.func.isRequired,
};
const STATUS = {
  todo: '未开启',
  doing: '进行中',
  stop: '停用',
};
const ArtTable = ({ 
  dataSource,
  onEditArtClick,
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
  }, {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
    render: startDate => moment(startDate).format('YYYY-MM-DD'),
  }, {
    title: '状态',
    dataIndex: 'statusCode',
    key: 'statusCode',
    render: statusCode => (<StatusTag categoryCode={statusCode} name={STATUS[statusCode]} />),
  }, {
    title: '创建日期',
    dataIndex: 'createDate',
    key: 'createDate',
    render: createDate => moment(createDate).format('YYYY-MM-DD'),
  }, {
    title: '',
    key: 'action',
    render: (text, record) => (
      <div>
        <Button shape="circle" icon="mode_edit" onClick={() => { onEditArtClick(record); }} />
      </div>
    ),
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
