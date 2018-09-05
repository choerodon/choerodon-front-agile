import React, { Component } from 'react';
import Card from '../Card';
import IssueType from './IssueType.js';

class IssueTypeWrap extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card
        title="迭代问题类型分布"
      >
        <IssueType />
      </Card>
    );
  }
}

export default IssueTypeWrap;
