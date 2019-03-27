import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import EditIssue from '../../../../../components/EditIssueNarrow';
import '../../../Backlog/BacklogComponent/IssueDetailComponent/IssueDetail.scss';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
// import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

@inject('AppState', 'HeaderStore')
@observer
class IssueDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onRef = (ref) => {
    ScrumBoardStore.setEditRef(ref);
  };

  render() {
    const { refresh, HeaderStore } = this.props;
    return ScrumBoardStore.getClickedIssue ? (
      <EditIssue
        store={ScrumBoardStore}
        onRef={this.onRef}
        backUrl="scrumboard"
        style={{
          height: HeaderStore.announcementClosed ? 'calc(100vh - 156px)' : 'calc(100vh - 208px)',
          width: '440px',
        }}
        issueId={ScrumBoardStore.getCurrentClickId}
        onCancel={() => {
          ScrumBoardStore.resetClickedIssue();
        }}
        onDeleteIssue={() => {
          ScrumBoardStore.resetClickedIssue();
          refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
        }}
        onUpdate={() => {
          refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
        }}
        resetIssue={(parentIssueId) => {
          ScrumBoardStore.resetCurrentClick(parentIssueId);
        }}
      />
    ) : null;
  }
}

export default IssueDetail;
