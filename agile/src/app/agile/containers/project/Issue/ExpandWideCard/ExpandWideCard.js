import React, { Component } from 'react';
import { observer } from 'mobx-react';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import EditIssue from '../../../../components/EditIssueWide';
import { loadIssue } from '../../../../api/NewIssueApi';

@observer
class ExpandWideCard extends Component {
  handleIssueUpdate = (issueId) => {
    const selectedIssue = IssueStore.getSelectedIssue;
    let Id;
    if (!issueId) {
      Id = selectedIssue.issueId;
    } else {
      Id = issueId;
    }
    IssueStore.setLoading(true);
    loadIssue(Id).then((res) => {
      const obj = {
        ...res,
        imageUrl: res.assigneeImageUrl || '',
        versionIssueRelDTOS: res.versionIssueRelDTOList,
      };
      const originIssues = new Map(IssueStore.getIssues.map(item => [item.issueId, item]));
      originIssues.set(res.issueId, obj);
      IssueStore.setIssues(Array.from(originIssues.values()));
    });
  };

  render() {
    return IssueStore.getExpand ? (
      <div
        style={{
          width: '64%',
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
            IssueStore.init();
            IssueStore.loadIssues();
          }}
          onUpdate={this.handleIssueUpdate.bind(this)}
          onCopyAndTransformToSubIssue={() => {
            const { current, pageSize } = IssueStore.pagination;
            IssueStore.loadIssues(current - 1, pageSize);
          }}
        />
      </div>
    ) : null;
  }
}

export default ExpandWideCard;
