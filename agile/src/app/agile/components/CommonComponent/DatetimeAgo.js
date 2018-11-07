import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui';
import TimeAgo from 'timeago-react';

class DatetimeAgo extends Component {
  render() {
    const { date } = this.props;
    return (
      <Tooltip placement="top" title={date || ''}>
        <TimeAgo
          datetime={date || ''}
          locale="zh_CN"
        />
      </Tooltip>
    );
  }
}

export default DatetimeAgo;
