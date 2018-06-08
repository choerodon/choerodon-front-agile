import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import EditIssue from '../../../../../components/EditIssueNarrow';
import './IssueDetail.scss';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

@inject('AppState')
@observer
class IssueDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleIssueUpdate() {
    // const issueId = BacklogStore.getClickIssueDetail.issueId;
    // BacklogStore.axiosGetIssueDetail(issueId).then((res) => {
    //   window.console.log(res);
    //   window.console.log(BacklogStore.getSprintData);
    // }).catch((error) => {
    //   window.console.log(error);
    // });
    // this.props.refresh();
    const chosenEpic = BacklogStore.getChosenEpic;
    const type = BacklogStore.getChosenVersion;    
    const data = {
      advancedSearchArgs: {},
    };
    if (type === 'unset') {
      data.advancedSearchArgs.noVersion = 'true';
    } else if (type !== 'all') {
      data.advancedSearchArgs.versionId = type;
    }
    if (chosenEpic === 'unset') {
      data.advancedSearchArgs.noEpic = 'true';
    } else if (chosenEpic !== 'all') {
      data.advancedSearchArgs.epicId = chosenEpic;
    }
    if (BacklogStore.getOnlyMe) {
      data.advancedSearchArgs.ownIssue = 'true';
    }
    if (BacklogStore.getRecent) {
      data.advancedSearchArgs.onlyStory = 'true';
    }
    BacklogStore.axiosGetSprint(data).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
      window.console.log(error);
    });
  }
  render() {
    return (
      <div
        className={this.props.visible ? 'c7n-issueDetail-container' : ''}
      >
        {this.props.visible ? (
          <EditIssue
            issueId={BacklogStore.getClickIssueDetail.issueId}
            onCancel={() => {
              BacklogStore.setClickIssueDetail({});
              BacklogStore.setIsLeaveSprint(false);
            }}
            onDeleteIssue={() => {
              BacklogStore.setClickIssueDetail({});
              BacklogStore.setIsLeaveSprint(false);
              this.props.refresh();
            }}
            onUpdate={this.handleIssueUpdate.bind(this)}
          />
        ) : ''}
      </div>
    );
  }
}

export default IssueDetail;

