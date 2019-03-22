import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import BacklogStore from '../../../../../../../stores/project/backlog/BacklogStore';

@inject('AppState', 'HeaderStore')
@observer class ClearAllFilter extends Component {
  clearFilter(e) {
    e.stopPropagation();
    BacklogStore.hideQuickSearch();
    setTimeout(() => {
      BacklogStore.showQuickSearch();
    }, 10);
    BacklogStore.clearSprintFilter();
  }

  render() {
    return (
      <p
        className={classnames('c7n-backlog-clearFilter')}
        style={{
          display: !BacklogStore.hasFilter ? 'none' : 'block',
          margin: 0,
          paddingRight: 16,
        }}
        role="none"
        onClick={this.clearFilter}
      >
        {'清空所有筛选器'}
      </p>
    );
  }
}

export default ClearAllFilter;
