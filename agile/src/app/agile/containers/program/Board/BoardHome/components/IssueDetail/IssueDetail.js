import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import EditIssue from '../../../../../../components/EditIssueNarrow';
import BoardStore from '../../../../../../stores/Program/Board/BoardStore';
import './IssueDetail.scss';

@inject('HeaderStore')
@observer
class IssueDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onRef = (ref) => {
    BoardStore.setEditRef(ref);
  };

  render() {
    const { refresh, HeaderStore } = this.props;
    return BoardStore.getClickedIssue ? (
      <EditIssue
        store={BoardStore}
        onRef={this.onRef}
        backUrl="board"
        style={{
          height: HeaderStore.announcementClosed ? 'calc(100vh - 156px)' : 'calc(100vh - 208px)',
          width: '440px',
        }}
        issueId={BoardStore.getClickIssueDetail.issueId}
        onCancel={() => {
          BoardStore.resetClickedIssue();
        }}
        onDeleteIssue={() => {
          BoardStore.resetClickedIssue();
          refresh(BoardStore.getBoardList.get(BoardStore.getSelectedBoard));
        }}
        onUpdate={() => {
          refresh(BoardStore.getBoardList.get(BoardStore.getSelectedBoard));
        }}
        resetIssue={(parentIssueId) => {
          BoardStore.resetCurrentClick(parentIssueId);
        }}
      />
    ) : null;
  }
}

export default IssueDetail;
