import React, { Component } from 'react';
import { observer } from 'mobx-react';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import EditIssue from '../../../../components/EditIssueWide';
import { loadIssue } from '../../../../api/NewIssueApi';
import IssueFilterControler from '../IssueFilterControler';

@observer
class ExpandWideCard extends Component {
  // 更新 Issue 时
  handleIssueUpdate = (issueId) => {
    const { issueRefresh } = this.props;
    issueRefresh();
  };

  render() {
    return IssueStore.getExpand ? (
      <div
        style={{
          width: IssueStore.getExpand ? '64%' : 0,
          display: 'block',
          overflow: 'hidden',
          height: 'calc(100vh - 106px)',
        }}
      >
        <EditIssue
          {...this.props}
          store={IssueStore}
          issueId={IssueStore.getSelectedIssue && IssueStore.getSelectedIssue.issueId}
          onCancel={() => {
            IssueStore.setClickedRow({
              expand: false,
              selectedIssue: {},
              checkCreateIssue: false,
            });
          }}
          onDeleteIssue={() => {
            IssueStore.setClickedRow({
              expand: false,
              selectedIssue: {},
            });
            const filterControler = new IssueFilterControler();
            filterControler.refresh('refresh').then((res) => {
              IssueStore.refreshTrigger(res);
              Promise.resolve();
            });
          }}
          onUpdate={this.handleIssueUpdate.bind(this)}
          onCopyAndTransformToSubIssue={() => {
            const filterControler = new IssueFilterControler();
            filterControler.refresh('refresh').then((res) => {
              IssueStore.refreshTrigger(res);
              Promise.resolve();
            });
          }}
        />
      </div>
    ) : null;
  }
}

export default ExpandWideCard;
