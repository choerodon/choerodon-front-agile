import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Icon, Button } from 'choerodon-ui';
import _ from 'lodash';
import { injectIntl, FormattedMessage } from 'react-intl';
import CreateLinkTask from '../../../../../../../components/CreateLinkTask';
import LinkList from '../../../../../../../components/EditIssueNarrow/Component/LinkList';

@inject('AppState')
@observer class IssueLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLinkTaskShow: false,
    };
  }

  componentDidMount() {
  }

  handleCreateLinkIssue() {
    const { onUpdate } = this.props;
    this.reloadIssue();
    this.setState({
      createLinkTaskShow: false,
    });
    if (onUpdate) {
      onUpdate();
    }
  }

  renderLinkList(link, i) {
    const { reloadIssue } = this.props;
    const { origin } = this.state;
    return (
      <LinkList
        issue={{
          ...link,
          typeCode: link.typeCode,
        }}
        i={i}
        onOpen={(issueId, linkedIssueId) => {
          reloadIssue(issueId === origin.issueId ? linkedIssueId : issueId);
        }}
        onRefresh={() => {
          reloadIssue(origin.issueId);
        }}
      />
    );
  }

  renderLinkIssues() {
    const { linkIssues } = this.state;
    const group = _.groupBy(linkIssues, 'ward');
    return (
      <div className="c7n-tasks">
        {
          _.map(group, (v, k) => (
            <div key={k}>
              <div style={{ margin: '7px auto' }}>{k}</div>
              {
                _.map(v, (linkIssue, i) => this.renderLinkList(linkIssue, i))
              }
            </div>
          ))
        }
      </div>
    );
  }

  render() {
    const { createLinkTaskShow } = this.state;
    const {
      intl, store, origin,
    } = this.props;

    return (
      <div id="link_task">
        <div className="c7n-title-wrapper">
          <div className="c7n-title-left">
            <Icon type="link c7n-icon-title" />
            <span>问题链接</span>
          </div>
          <div style={{
            flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
          }}
          />
          <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
            <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ createLinkTaskShow: true })}>
              <Icon type="relate icon" />
              <span>创建链接</span>
            </Button>
          </div>
        </div>
        {this.renderLinkIssues()}
        {
          createLinkTaskShow ? (
            <CreateLinkTask
              issueId={origin.issueId}
              visible={createLinkTaskShow}
              onCancel={() => this.setState({ createLinkTaskShow: false })}
              onOk={this.handleCreateLinkIssue.bind(this)}
            />
          ) : null
        }
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueLink));
