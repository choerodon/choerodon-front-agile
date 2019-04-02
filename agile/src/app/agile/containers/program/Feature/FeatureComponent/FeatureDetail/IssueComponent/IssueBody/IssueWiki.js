import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Icon, Button } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import Wiki from '../../../../../../../components/Wiki';
import WikiItem from '../../../../../../../components/EditIssueNarrow/Component/WikiItem';

@inject('AppState')
@observer class IssueCommit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addWikiShow: false,
    };
  }

  componentDidMount() {
  }

  renderWiki = () => {
    const { wikies } = this.state;
    return (
      <div>
        {
          wikies && wikies.wikiRelationList
          && wikies.wikiRelationList.map(wiki => (
            <WikiItem
              key={wiki.id}
              wiki={wiki}
              onDeleteWiki={this.onDeleteWiki}
              wikiHost={wikies.wikiHost}
              type="narrow"
            />
          ))
        }
      </div>
    );
  };

  render() {
    const { addWikiShow } = this.state;
    const {
      intl, store, origin, wikies,
    } = this.props;

    return (
      <div id="wiki">
        <div className="c7n-title-wrapper">
          <div className="c7n-title-left">
            <Icon type="library_books c7n-icon-title" />
            <span>Wiki 文档</span>
          </div>
          <div style={{
            flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
          }}
          />
          <div className="c7n-title-right" style={{ marginLeft: '14px' }}>
            <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ addWikiShow: true })}>
              <Icon type="add_box icon" />
              <span>添加文档</span>
            </Button>
          </div>
        </div>
        {this.renderWiki()}
        {
          addWikiShow ? (
            <Wiki
              issueId={origin.issueId}
              visible={addWikiShow}
              onCancel={() => this.setState({ addWikiShow: false })}
              onOk={this.onWikiCreate}
              checkIds={wikies ? wikies.wikiRelationList.map(wiki => wiki.wikiUrl) : []}
            />
          ) : null
        }
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueCommit));
