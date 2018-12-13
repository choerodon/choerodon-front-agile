import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import './StatusColumn.scss';
// 列状态
@inject('AppState')
@observer
class StatusColumn extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  
  /**
   *显示issue个数
   *
   * @returns
   * @memberof StatusColumn
   */
  showIssueLength() {
    const data = this.props.data.subStatuses;
    let length = 0;
    for (let index = 0, len = data.length; index < len; index += 1) {
      length += data[index].issues.length;
    }
    return length;
  }

  render() {
    return (
      <div className="c7n-scrumboard-status">
        <p
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100% - 50px)',
            display: 'inline-block',
            marginLeft: 12,
          }}
        >
          {`${this.props.data.name}`}
        </p>
        <p style={{ display: 'inline-block' }}>
          {`(${this.showIssueLength()})`}
        </p>
      </div>
    );
  }
}

export default StatusColumn;
