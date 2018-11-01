import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import './TypeTag.scss';

class TypeTag extends Component {
  render() {
    const {
      data, showName,
    } = this.props;
    return (
      <div className="c7n-typeTag">
        <div
          className="icon"
          style={{
            backgroundColor: data ? data.colour : '#fab614',
          }}
        >
          <Icon
            style={{ fontSize: '16px' }}
            type={data ? data.icon : 'help'}
          />
        </div>
        {
          showName && (
            <span className="name">{data ? data.name : ''}</span>
          )
        }
      </div>
    );
  }
}
export default TypeTag;
