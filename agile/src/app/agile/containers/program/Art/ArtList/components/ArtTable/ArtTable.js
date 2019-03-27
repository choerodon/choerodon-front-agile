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
const STATUS = {
  todo: '未启用',
  doing: '进行中',
  done: '已完成',
  discontinueUse: '停用',
};
const ArtTable = ({ 
  dataSource,
  onEditArtClick,
  onArtNameClick,
  onFinishArtClick,
}) => {
  const columns = [{
    title: '编号',
    dataIndex: 'code',
    key: 'code',  
    render: (code, record) => `#${code}`,  
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
    dataIndex: 'statusCode',
    key: 'statusCode',
    render: (statusCode, record) => {
      if (!record.enabled) {
        // eslint-disable-next-line no-param-reassign
        statusCode = 'discontinueUse';
      }
      return (<StatusTag categoryCode={statusCode} name={STATUS[statusCode]} />);
    },
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
        <Button shape="circle" disabled={record.enabled && record.statusCode === 'done'} icon="finished" onClick={() => { onFinishArtClick(record); }} />
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
