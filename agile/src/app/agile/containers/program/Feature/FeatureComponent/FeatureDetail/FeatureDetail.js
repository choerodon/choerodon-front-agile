import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import EditIssue from '../../../../../components/EditIssueNarrow';

@inject('AppState')
@observer
class FeatureDetail extends Component {
  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  /**
   * 刷新issue详情的数据
   */
  refreshIssueDetail() {
    if (this.editIssue) {
      this.editIssue.refresh();
    }
  }

  render() {
    const { cancelCallback, refresh, store } = this.props;
    const visible = Object.keys(store.getClickIssueDetail).length > 0;
    return (
      <div
        className={visible ? 'c7n-issueDetail-container' : ''}
      >
        {visible ? (
          <EditIssue
            store={store}
            onRef={(ref) => {
              this.editIssue = ref;
            }}
            issueId={store.getClickIssueId}
            onCancel={() => {
              store.setClickIssueDetail({});
              // store.setIsLeaveSprint(false);
              // cancelCallback();
            }}
            onDeleteIssue={() => {
              store.setClickIssueDetail({});
              // store.setIsLeaveSprint(false);
              refresh();
            }}
            onUpdate={refresh}
          />
        ) : ''}
      </div>
    );
  }
}

export default FeatureDetail;
