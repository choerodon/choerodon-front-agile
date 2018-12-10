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
      // 修改部分被更改过的 issue 数据
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
