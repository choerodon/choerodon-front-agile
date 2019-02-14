import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import EditIssue from '../../../../../components/EditIssueNarrow';
import '../../../Backlog/BacklogComponent/IssueDetailComponent/IssueDetail.scss';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
// import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

@inject('AppState')
@observer
class IssueDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { visible, refresh } = this.props;
    return (
      <div>
        {visible ? (
          <EditIssue
            store={ScrumBoardStore}
            backUrl="scrumboard"
            style={{
              height: 'calc(100vh - 156px)',
              width: '440px',
            }}
            issueId={ScrumBoardStore.getClickIssueDetail.issueId}
            onCancel={() => {
              ScrumBoardStore.setClickIssueDetail({});
              refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
            }}
            onDeleteIssue={() => {
              ScrumBoardStore.setClickIssueDetail({});
              refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
            }}
            onUpdate={() => {
              refresh(ScrumBoardStore.getBoardList.get(ScrumBoardStore.getSelectedBoard));
            }}
          />
        ) : ''}
      </div>
    );
  }
}

export default IssueDetail;
