import React, { Component } from 'react';
import Card from '../Card';
import IssueType from './IssueType';

class IssueTypeWrap extends Component {
  render() {
    return (
      <Card 
        title="问题类型分布"
        link="#"
      >
        <IssueType />
      </Card>
    );
  }
}

export default IssueTypeWrap;
