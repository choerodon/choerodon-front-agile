import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'choerodon-ui';
import FilterItem from './FilterItem';
import './FilterManage.scss';

class FilterManage extends Component {
  render() {
    const {
      myFilters, onClose, onDelete, onModify, 
    } = this.props;
    return (
      <div className="c7nagile-FilterManage">
        <div className="c7nagile-FilterManage-header">        
          <span>筛选管理</span>
          <Icon type="close" onClick={onClose} />
        </div>
        {
          myFilters.map(filter => (
            <FilterItem
              filter={filter}
              onDelete={onDelete}
              onModify={onModify}
            />
          ))
        }
      </div>
    );
  }
}

FilterManage.propTypes = {

};

export default FilterManage;
