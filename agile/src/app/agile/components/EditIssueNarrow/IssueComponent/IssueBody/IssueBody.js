import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import IssueDetail from './IssueDetail';
import IssueDes from './IssueDes';
import IssueAttachment from './IssueAttachment';
import IssueWiki from './IssueWiki';
import IssueCommit from './IssueCommit';
import IssueWorkLog from './IssueWorkLog';
import IssueLog from './IssueLog';
import SubTask from './SubTask';
import SubBug from './SubBug';
import IssueLink from './IssueLink';
import IssueBranch from './IssueBranch';

@inject('AppState', 'HeaderStore')
@observer class IssueBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {
      store, reloadIssue,
    } = this.props;
    const issue = store.getIssue;
    const { issueTypeDTO = {} } = issue;

    return (
      <div className="c7n-content-bottom" id="scroll-area" style={{ position: 'relative' }}>
        <section className="c7n-body-editIssue">
          <div className="c7n-content-editIssue">
            <IssueDetail {...this.props} />
            <IssueDes store={store} />
            <IssueAttachment store={store} reloadIssue={reloadIssue} />
            {issueTypeDTO.typeCode && ['sub_task', 'feature'].indexOf(issueTypeDTO.typeCode) === -1
              ? <IssueWiki store={store} /> : ''
             }
            <IssueCommit store={store} reloadIssue={reloadIssue} />
            {issueTypeDTO.typeCode && ['feature'].indexOf(issueTypeDTO.typeCode) === -1
              ? <IssueWorkLog {...this.props} store={store} reloadIssue={reloadIssue} /> : ''
             }
            <IssueLog store={store} />
            {issueTypeDTO.typeCode && ['sub_task', 'feature'].indexOf(issueTypeDTO.typeCode) === -1
              ? <SubTask store={store} reloadIssue={reloadIssue} /> : ''
             }
            {issueTypeDTO.typeCode && ['story'].indexOf(issueTypeDTO.typeCode) !== -1
              ? <SubBug store={store} reloadIssue={reloadIssue} /> : ''
             }
            {issueTypeDTO.typeCode && ['feature', 'sub_task'].indexOf(issueTypeDTO.typeCode) === -1
              ? <IssueLink store={store} reloadIssue={reloadIssue} /> : ''
             }
            {issueTypeDTO.typeCode && ['feature'].indexOf(issueTypeDTO.typeCode) === -1
              ? <IssueBranch store={store} reloadIssue={reloadIssue} /> : ''
             }
          </div>
        </section>
      </div>
    );
  }
}

export default IssueBody;
