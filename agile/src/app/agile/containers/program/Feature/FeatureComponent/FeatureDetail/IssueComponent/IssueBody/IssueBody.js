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
import IssueLink from './IssueLink';
import IssueBranch from './IssueBranch/IssueBranch';

@inject('AppState', 'HeaderStore')
@observer class IssueBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { store, reloadIssue } = this.props;
    const issue = store.getIssue;
    const { issueTypeDTO = {} } = issue;

    return (
      <div className="c7n-content-bottom" id="scroll-area" style={{ position: 'relative' }}>
        <section className="c7n-body-editIssue">
          <div className="c7n-content-editIssue">
            <IssueDetail store={store} />
            <IssueDes store={store} />
            <IssueAttachment store={store} />
            {issueTypeDTO.code && ['sub_task', 'feature'].indexOf(issueTypeDTO.code) !== -1
              ? <IssueWiki store={store} /> : ''
            }
            <IssueWiki store={store} />
            <IssueCommit store={store} reloadIssue={reloadIssue} />
            <IssueWorkLog store={store} reloadIssue={reloadIssue} />
            <IssueLog store={store} />
            {issueTypeDTO.code && ['sub_task', 'feature'].indexOf(issueTypeDTO.code) !== -1
              ? <SubTask store={store} /> : ''
            }
            <IssueLink store={store} />
            {issueTypeDTO.code && ['feature'].indexOf(issueTypeDTO.code) !== -1
              ? <IssueBranch store={store} /> : ''
            }
          </div>
        </section>
      </div>
    );
  }
}

export default IssueBody;
