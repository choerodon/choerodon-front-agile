import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Icon } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { UploadButtonNow } from '../../../../../../../components/CommonComponent';
import { handleFileUpload } from '../../../../../../../common/utils';

@inject('AppState')
@observer class IssueAttachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
    };
  }

  componentDidMount() {
  }

  /**
   * 更新fileList
   * @param data
   */
  setFileList = (data) => {
    this.setState({ fileList: data });
  };

  /**
   * 上传附件
   * @param arr
   */
  onChangeFileList = (arr) => {
    const { AppState, origin, refresh } = this.props;
    if (arr.length > 0 && arr.some(one => !one.url)) {
      const config = {
        issueId: origin.issueId,
        fileName: arr[0].name || 'AG_ATTACHMENT',
        projectId: AppState.currentMenuType.id,
      };
      handleFileUpload(arr, refresh, config);
    }
  };

  render() {
    const { fileList } = this.state;
    const {
      intl, store,
    } = this.props;

    return (
      <div id="attachment">
        <div className="c7n-title-wrapper">
          <div className="c7n-title-left">
            <Icon type="attach_file c7n-icon-title" />
            <span>附件</span>
          </div>
          <div style={{
            flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px', marginRight: '114.67px',
          }}
          />
        </div>
        <div className="c7n-content-wrapper" style={{ marginTop: '-47px' }}>
          <UploadButtonNow
            onRemove={this.setFileList}
            onBeforeUpload={this.setFileList}
            updateNow={this.onChangeFileList}
            fileList={fileList}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueAttachment));
