import React, { Component } from 'react';
import { Input, Icon, Popover, Menu, Checkbox } from 'choerodon-ui';
import _ from 'lodash';
import './Backlog.scss';
import US from '../../../../../stores/project/userMap/UserMapStore';
import TypeTag from '../../../../../components/TypeTag';

class Backlog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: [],
    };
  }

  handleClickExpand(id) {
    const expand = this.state.expand;
    const index = expand.findIndex(v => v === id);
    if (index === -1) {
      expand.push(id);
    } else {
      expand.splice(index, 1);
    }
    this.setState({ expand });
  }

  renderIssues() {
    const mode = US.mode;
    let group = [];
    if (mode === 'none') {
      group = US.issues;
      return (
        <div>
          <div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingBottom: 4, borderBottom: '1px solid rgba(151, 151, 151, 0.2)' }}>
              <h4 style={{ fontSize: '14px', lineHeight: '20px' }}>Issues</h4>
              <Icon
                type={this.state.expand.includes(0) ? 'expand_less' : 'expand_more'}
                onClick={this.handleClickExpand.bind(this, 0)}
              />
            </div>
            {
              this.state.expand.includes(0) ? null : (
                <ul style={{ padding: 0, margin: 0 }}>
                  {
                    _.map(group, (issue, i) => this.renderIssue(issue, i))
                  }
                </ul>
              )
            }
          </div>
        </div>
      );
    } else {
      group = US[`${mode}s`];
      return (
        <div>
          {
            _.map(group, (v, i) => (
              this.renderGroupIssue(v, i)
            ))
          }
        </div>
      );
    }
  }

  renderGroupIssue(group, i) {
    const mode = US.mode;
    const issues = US.issues.filter(v => v[`${mode}Id`] === group.id);
    return (
      <div key={i}>
        <h4 style={{ marginTop: 20, marginBottom: 4, paddingBottom: 4, fontSize: '14px', lineHeight: '20px', borderBottom: '1px solid rgba(151, 151, 151, 0.2)' }}>{group.name}</h4>
        <ul style={{ padding: 0, margin: 0 }}>
          {
            _.map(issues, (issue, index) => this.renderIssue(issue, index))
          }
        </ul>
      </div>
    );
  }

  renderIssue(issue, i) {
    return (
      <li style={{ display: 'flex', flexDirection: 'row', padding: '5px 4px', border: '1px solid rgba(151, 151, 151, 0.2)', borderTop: 'none' }}>
        <span style={{ marginRight: 4 }}>
          <TypeTag
            typeCode={issue.typeCode}
          />
        </span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {issue.summary}
        </span>
        <span style={{ width: 76, color: '#3f51b5', textAlign: 'right' }}>
          {issue.issueNum}
        </span>
      </li>
    );
  }

  render() {
    return (
      <div className="c7n-backlog">
        <div style={{ display: 'flex', flexDirection: 'row', height: 38 }}>
          <div style={{ width: 224, height: 38, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.20)', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: 16, paddingRight: 16 }}>
            <Input
              placeholder="按照名称搜索"
              prefix={(<Icon type="search" />)}
              label=""
              // value={userName}
              // onChange={this.onChangeUserName}
              // ref={node => this.userNameInput = node}
            />
          </div>
          <Popover
            content={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {
                  ['仅我的问题', '仅用户故事'].map(items => (
                    <Checkbox>
                      {items}
                    </Checkbox>
                  ))
                }
                {
                  US.filters.map(filter => (
                    <Checkbox>
                      {filter.name}
                    </Checkbox>
                  ))
                }
              </div>
            }
            trigger="click"
            placement="bottomRight"
            overlayClassName="c7n-backlog-popover"
            overlayStyle={{
              background: '#fff',
              boxShadow: '0 5px 5px -3px rgba(0,0,0,0.20), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12)',
              borderRadius: '2px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '13px', lineHeight: '15px', cursor: 'pointer', color: '#3f51b5', height: '100%', fontWeight: 'bold' }}>
                <span>快速搜索</span>
                <Icon type="baseline-arrow_drop_down" style={{ fontSize: '16px', marginLeft: 6 }} />
              </div>
            </div>
          </Popover>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {this.renderIssues()}
        </div>
      </div>
    );
  }
}
export default Backlog;
