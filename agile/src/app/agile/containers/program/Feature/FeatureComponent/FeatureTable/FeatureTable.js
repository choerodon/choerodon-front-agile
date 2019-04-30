import React from 'react';
import {
  Table, Tooltip,
} from 'choerodon-ui';
import FiltersProvider from '../../../../../components/FiltersProvider';
import {
  IssueNum, Summary, StatusName, LastUpdateTime, Sprint, Epic,
} from '../../../../project/Issue/IssueTable/IssueTableComponent';
import TypeTag from '../../../../../components/TypeTag';
import { QuickCreateFeatureWithProvider } from '../../../../../components/QuickCreateFeature';
import './FeatureTable.scss';

const getColumns = filters => ([
  {
    title: '编号',
    dataIndex: 'issueNum',
    key: 'issueNum',
    className: 'issueId',
    sorterId: 'issueId',
    width: 100,  
    // filters: [],
    render: text => <IssueNum text={text} />,
  },
  {
    title: '类型',
    key: 'featureType',
    dataIndex: 'featureType',
    className: 'featureType',
    sorterId: 'featureType',
    width: 100,
    render: (featureType, record) => {
      const { typeCode, issueTypeDTO } = record;
      return (
        <div style={{ lineHeight: 0 }}>
          {typeCode === 'feature' ? (
            <TypeTag
              showName
              data={{
                colour: featureType === 'business' ? '#29B6F6' : '#FFCA28',
                icon: 'agile-feature',
                name: featureType === 'business' ? '特性' : '使能',
              }}
            />
          ) : (
            <TypeTag
              showName
              data={issueTypeDTO}
            />
          )}
        </div>
      );
    },
  },
  {
    title: '概要',
    dataIndex: 'summary',
    className: 'summary',
    key: 'summary',
    width: 240, 
    // filters: [],
    render: text => <Summary text={text} />,
  },
  {
    title: '状态',
    key: 'statusList',
    className: 'status',
    sorterId: 'statusList',    
    filters: filters.issueStatus,
    filterMultiple: true,
    width: 134,
    render: record => <StatusName record={record} />,
  },
  {
    title: '史诗',
    key: 'epicList',
    className: 'epic',
    sorterId: 'epic',
    filters: filters.epic,
    filterMultiple: true,
    width: 134,
    render: (epic, record) => <Epic color={record.epicColor} name={record.epicName} />,
  },
  {
    title: 'PI',
    key: 'piList',
    className: 'piNameDTOList',
    dataIndex: 'piNameDTOList',    
    filters: filters.pi,
    filterMultiple: true,
    width: 134,
    render: piNameDTOList => (
      <Tooltip placement="top" title={piNameDTOList.length ? piNameDTOList.map(o => `${o.code}-${o.name};`) : ''}>
        {Sprint({ objArray: piNameDTOList, name: piNameDTOList.length > 0 && `${piNameDTOList[0].code}-${piNameDTOList[0].name}` })}
      </Tooltip>
    ),
  },
  {
    title: '最后更新时间',
    dataIndex: 'lastUpdateDate',
    className: 'lastUpdateDate',
    key: 'lastUpdateDate',
    sorterId: 'lastUpdateDate',
    width: 134,    
    render: text => <LastUpdateTime text={text} />,
  },
  {
    title: '创建时间',
    dataIndex: 'creationDate',
    className: 'creationDate',
    key: 'creationDate',
    sorterId: 'creationDate',
    width: 134,   
    hidden: true,
    render: text => <LastUpdateTime text={text} />,
  },
  {
    title: '故事点',
    dataIndex: 'storyPoints',
    className: 'storyPoints',
    key: 'storyPoints',
    sorterId: 'storyPoints',
    width: 134,
    hidden: true,
  },
  {
    title: '特性价值',
    dataIndex: 'benfitHypothesis',
    className: 'benfitHypothesis',
    key: 'benfitHypothesis',
    sorterId: 'benfitHypothesis',
    width: 134,   
    hidden: true, 
  },
  {
    title: '验收标准',
    dataIndex: 'acceptanceCritera',
    className: 'acceptanceCritera',
    key: 'acceptanceCritera',
    sorterId: 'acceptanceCritera',
    width: 134,   
    hidden: true, 
  },
]);

const FeatureTable = ({
  loading,
  dataSource,
  pagination,
  onChange,
  onRow,
  onCreateFeature,
}) => (
  <FiltersProvider fields={[{ key: 'issueStatus', args: ['program'] }, 'epic', 'pi']}>
    {
        filters => (
          <div className="c7nagile-FeatureTable">
            <Table
              loading={loading}
              columns={getColumns(filters)}
              pagination={pagination}
              dataSource={dataSource}
              onChange={onChange}
              onRow={onRow}
              footer={() => (<QuickCreateFeatureWithProvider onCreate={onCreateFeature} />)}
              scroll={{
                x: true,
              }}
            />
          </div>
        )}
  </FiltersProvider>
);

FeatureTable.propTypes = {

};

export default FeatureTable;
