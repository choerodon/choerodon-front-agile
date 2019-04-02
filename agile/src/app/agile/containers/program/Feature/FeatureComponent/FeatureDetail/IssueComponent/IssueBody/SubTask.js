import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Icon } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import CreateSubTask from '../../../../../../../components/CreateSubTask';

@inject('AppState')
@observer class SubTask extends Component {
  constructor(props) {
    super(props);
    this.sign = false;
    this.state = {
      createSubTaskShow: false,
    };
  }

  componentDidMount() {
  }

  renderSubIssues() {
    const { subIssueDTOList } = this.state;
    return (
      <div className="c7n-tasks">
        {
          subIssueDTOList.map((subIssue, i) => this.renderIssueList(subIssue, i))
        }
      </div>
    );
  }

  render() {
    const { createSubTaskShow } = this.state;
    const {
      intl, origin, store,
    } = this.props;

    return (
      <div id="sub_task">
        <div className="c7n-title-wrapper">
          <div className="c7n-title-left">
            <Icon type="filter_none c7n-icon-title" />
            <span>子任务</span>
          </div>
          <div style={{
            flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
          }}
          />
          <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
            <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ createSubTaskShow: true })}>
              <Icon type="playlist_add icon" />
              <span>创建子任务</span>
            </Button>
          </div>
        </div>
        {this.renderSubIssues()}
        {
          createSubTaskShow ? (
            <CreateSubTask
              issueId={origin.issueId}
              parentSummary={origin.summary}
              visible={createSubTaskShow}
              onCancel={() => this.setState({ createSubTaskShow: false })}
              onOk={this.handleCreateSubIssue.bind(this)}
              store={store}
            />
          ) : null
        }
      </div>
    );
  }
}

export default withRouter(injectIntl(SubTask));
