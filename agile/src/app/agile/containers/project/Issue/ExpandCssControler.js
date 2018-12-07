import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import IssueStore from '../../../stores/project/sprint/IssueStore';

@observer
class ExpandCssControler extends Component {
  render() {
    // const { expand } = this.props;
    const expand = IssueStore.getExpand;
    const expandClassName = expand ? 'c7n-Issue-expand' : '';
    return (
      <div className={expandClassName} />
    );
  }
}

export default ExpandCssControler;
