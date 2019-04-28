import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FetureTable from '../FeatureTable';
import { getFeatures } from '../../../../../api/FeatureApi';
import FeatureStore from '../../../../../stores/program/Feature/FeatureStore';

const filterConvert = (filters) => {
  const searchDTO = {
    advancedSearchArgs: {
      statusList: [],
      reporterList: [],
      epicList: [],
    },
    // content: '',
    otherArgs: {
      piList: [],
    },
    // searchArgs: {
    //   assignee: '',
    //   component: '',
    //   epic: '',
    //   issueNum: '',
    //   sprint: '',
    //   summary: '',
    //   version: '',
    // },
  };
  const setArgs = (field, filter) => {
    Object.assign(searchDTO[field], filter);
  };
  // 循环遍历 Object 中的每个键
  Object.keys(filters).forEach((key) => {
    // 根据对应的 key 传入对应的 mode
    switch (key) {
      case 'statusList':
      case 'reporterList':
      case 'epicList':
        setArgs('advancedSearchArgs', { [key]: filters[key] });
        break;
      case 'piList':      
        setArgs('otherArgs', { [key]: filters[key] });
        break;
      default:
        setArgs('searchArgs', {
          [key]: filters[key][0],
        });
        break;
    }
  });
  return searchDTO;
};
class QueryMode extends Component {
  state = {
    loading: false,
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },
    searchDTO: {},
    issues: [],
  }

  componentDidMount() {
    this.loadFeatures();
  }

  componentWillUnmount() {   
    FeatureStore.setClickIssueDetail({});
  }
  
  refresh=() => {
    this.loadFeatures();
  }

  // eslint-disable-next-line react/destructuring-assignment
  loadFeatures = ({ pagination = this.state.pagination, searchDTO = this.state.searchDTO } = {}) => {
    const { current, pageSize } = pagination;
    this.setState({
      loading: true,
    });
    getFeatures({
      page: current - 1,
      size: pageSize,
    }, searchDTO).then((res) => {
      const { 
        content: issues, size, number, totalElements,
      } = res;
      this.setState({
        pagination: {
          current: number + 1,
          total: totalElements,
          pageSize: size,
        },
        issues,
        loading: false,
      });
    });
  }

  handleTableChange = (pagination, filters) => {
    const searchDTO = filterConvert(filters);
    // console.log(searchDTO);
    this.loadFeatures({ pagination, searchDTO });
    this.setState({
      searchDTO,
    });
  }

  handleTableRowClick = (record) => {
    FeatureStore.setClickIssueDetail(record);
  }

  handleCreateFeature = () => { 
    this.refresh();
  }

  render() {
    const { pagination, loading, issues } = this.state;
    return (
      <div style={{ flex: 1, height: '100%', overflow: 'auto' }}>
        <FetureTable
          loading={loading}
          dataSource={issues}
          pagination={pagination}
          onChange={this.handleTableChange}
          onRow={record => ({
            onClick: (event) => { this.handleTableRowClick(record); },
          })}
          onCreateFeature={this.handleCreateFeature}
        />
      </div>
    );
  }
}

QueryMode.propTypes = {

};

export default QueryMode;
