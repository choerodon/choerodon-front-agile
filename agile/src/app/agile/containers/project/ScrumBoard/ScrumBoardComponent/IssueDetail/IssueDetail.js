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
    // let height = '';
    // if (document.getElementsByClassName('page-content').length > 0) {
    //   if (document.getElementsByClassName('page-content')[0].offsetHeight) {
    //     height = document.getElementsByClassName('page-content')[0].offsetHeight;
    //   }
    // }
    return (
      <div
        className={this.props.visible ? 'c7n-issueDetail-container' : ''}
        // style={{
        //   height,
        // }}
      >
        {this.props.visible ? (
          <EditIssue
            issueId={ScrumBoardStore.getClickIssueDetail.issueId}
            onCancel={() => {
              ScrumBoardStore.setClickIssueDetail({});
              this.props.refresh();
            }}
            onDeleteIssue={() => {
              ScrumBoardStore.setClickIssueDetail({});
              this.props.refresh();              
            }}
            onUpdate={() => {
              this.props.refresh();     
            }}
          />
        ) : ''}
      </div>
    );
  }
}

export default IssueDetail;

