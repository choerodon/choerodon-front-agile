import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

@observer
export default WrappedComponent => class SprintCount extends Component {
  render() {
    return (
      <React.Fragment>
        <div
          className="c7n-backlog-sprintCount"
          style={{
            display: BacklogStore.getMultiSelected.size > 0 ? 'flex' : 'none',
          }}
          label="sprintIssue"
        >
          {BacklogStore.getMultiSelected.size}
        </div>
        <WrappedComponent {...this.props} />
      </React.Fragment>
    );
  }
};
