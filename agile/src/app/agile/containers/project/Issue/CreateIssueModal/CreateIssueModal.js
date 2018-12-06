import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { stores } from 'choerodon-front-boot';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import CreateIssue from '../../../../components/CreateIssueNew';

// const { AppState } = stores;

@observer
class CreateIssueModal extends Component {
  handleCreateIssue = (issueObj) => {
    // const { history } = this.props;
    // const {
    //   type, id, name, organizationId,
    // } = AppState.currentMenuType;
    IssueStore.createQuestion(false);
    IssueStore.init();
    IssueStore.loadIssues();
    if (issueObj) {
      IssueStore.setClickedRow({
        selectedIssue: issueObj,
        expand: true,
      });
    }
  };

  render() {
    return IssueStore.getCreateQuestion ? (
      <CreateIssue
        visible={IssueStore.getCreateQuestion}
        onCancel={IssueStore.createQuestion(false)}
        onOk={this.handleCreateIssue.bind(this)}
        store={IssueStore}
      />
    ) : null;
  }
}

export default CreateIssueModal;
