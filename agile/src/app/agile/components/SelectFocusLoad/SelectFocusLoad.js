import React, { Component } from 'react';
import { Select } from 'choerodon-ui';
import PropTypes from 'prop-types';
import Types from './Types';

const propTypes = {
  type: PropTypes.string.isRequired,
};
class SelectFocusLoad extends Component {
  state = {
    loading: false,
    List: [],
  }
  
  render() {
    const { loading, List } = this.state;
    const { type } = this.props;  
    const Type = Types[type];  
    const { render, request } = Type;
    const Options = List.map(render);
    return (
      <Select
        filter       
        filterOption={false}
        loading={loading}   
        style={{ width: 200 }}
        onFilterChange={(value) => {
          this.setState({
            loading: true,
          });
          request(value).then((Data) => {
            this.setState({
              List: Data.content,
              loading: false,
            });
          });
        }}
        {...this.props}
      >
        {Options}
      </Select>
    );
  }
}

SelectFocusLoad.propTypes = propTypes;
export default SelectFocusLoad;
