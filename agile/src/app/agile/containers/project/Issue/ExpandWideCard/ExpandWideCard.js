import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import EditIssue from '../../../../components/EditIssueWide';
import { loadIssue } from '../../../../api/NewIssueApi';
import IssueFilterControler from '../IssueFilterControler';

@inject('AppState', 'HeaderStore')
@observer
class ExpandWideCard extends Component {
  // 更新 Issue 时
  handleIssueUpdate = (issueId) => {
    const { issueRefresh } = this.props;
    issueRefresh();
  };

  render() {
    const { HeaderStore, onHideIssue } = this.props;
    return IssueStore.getExpand ? (
      <div
        style={{
          width: IssueStore.getExpand ? '64%' : 0,
          display: 'block',
          overflow: 'hidden',
          borderTop: '1px solid rgb(211, 211, 211)',
          height: HeaderStore.announcementClosed ? 'calc(100vh - 156px)' : 'calc(100vh - 208px)',
        }}
      >
        <EditIssue
          {...this.props}
          store={IssueStore}
          issueId={IssueStore.getSelectedIssue && IssueStore.getSelectedIssue.issueId}
          onCancel={() => {
            onHideIssue();
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
