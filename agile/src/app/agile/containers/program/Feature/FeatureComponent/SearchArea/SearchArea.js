import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AdvancedSearch from '../AdvancedSearch';
import CreateMyFilter from '../../../../../components/CreateMyFilter';
import FilterManage from '../../../../../components/FilterManage';

import './SearchArea.scss';

class SearchArea extends PureComponent {
  render() {
    const {
      searchDTO, onAdvancedSearchChange, 
      onClearFilter, selectedFilter, 
      createMyFilterVisible, myFilters, filterManageVisible, onCancel, onCreate, onSaveClick, onSelectMyFilter, onManageClick, onClose,
    } = this.props;

    return (
      <div className="c7nagile-SearchArea">
        <CreateMyFilter 
          visible={createMyFilterVisible}
          searchDTO={searchDTO}
          onCancel={onCancel}
          onCreate={onCreate}
        />
        <AdvancedSearch
          searchDTO={searchDTO}
          myFilters={myFilters}
          selectedFilter={selectedFilter} 
          onAdvancedSearchChange={onAdvancedSearchChange}
          onSaveClick={onSaveClick}
          onSelectMyFilter={onSelectMyFilter}
          onManageClick={onManageClick}
          onClearFilter={onClearFilter}
        />
        {
          filterManageVisible 
          && (
          <FilterManage 
            myFilters={myFilters}
            onClose={onClose}
          />
          )
        }
        
      </div>
    );
  }
}

SearchArea.propTypes = {

};

export default SearchArea;
