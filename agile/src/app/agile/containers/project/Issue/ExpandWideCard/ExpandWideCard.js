import React, { Component } from 'react';
import _ from 'lodash';
import { observer, inject } from 'mobx-react';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import EditIssue from '../../../../components/EditIssueWide';
import { loadIssue } from '../../../../api/NewIssueApi';

@observer
class ExpandWideCard extends Component {
  handleIssueUpdate = (issueId) => {
    const { selectedIssue } = IssueStore.getSelectedIssue;
    let Id;
    if (!issueId) {
      Id = selectedIssue.issueId;
    } else {
      Id = issueId;
    }
    loadIssue(Id).then((res) => {
      const obj = {
        ...res,
        imageUrl: res.assigneeImageUrl || '',
        versionIssueRelDTOS: res.versionIssueRelDTOList,
      };
      const originIssues = _.slice(IssueStore.issues);
      const index = _.findIndex(originIssues, { issueId: res.issueId });
      originIssues[index] = obj;
      IssueStore.setIssues(originIssues);
    });
  };

  render() {
    return IssueStore.getExpand ? (
      <EditIssue
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
    ) : null;
  }
}

export default ExpandWideCard;
