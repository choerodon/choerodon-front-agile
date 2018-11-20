import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import './TypeTag.scss';

const initTypes = ['agile_epic', 'agile_story', 'agile_fault', 'agile_task', 'agile_subtask'];

class TypeTag extends Component {
  render() {
    const {
      data, showName,
    } = this.props;
    return (
      <div className="c7n-typeTag" {...this.props}>
        {initTypes.indexOf(data ? data.icon : '') !== -1
          ? (
            <Icon
              style={{
                fontSize: '26px',
                color: data ? data.colour : '#fab614',
              }}
              type={data ? data.icon : 'help'}
            />)
          : (
            <div
              className="icon-wapper"
              style={{
                backgroundColor: data ? data.colour : '#fab614',
                padding: '2px',
                margin: '3px',
              }}
            >
              <Icon
                style={{ fontSize: '16px' }}
                type={data ? data.icon : 'help'}
              />
            </div>)
        }
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
