import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Input, Icon, Popover, Menu, Checkbox } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import _ from 'lodash';
import './Backlog.scss';
import US from '../../../../../stores/project/userMap/UserMapStore';
import TypeTag from '../../../../../components/TypeTag';
import onClickOutside from '../../../../../components/CommonComponent/ClickOutSide';

const { AppState } = stores;

@observer
class Backlog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: [],
      filterString: '',
    };
  }

  componentDidMount() {
    this.loadIssues();
  }

  onChangeUserName = (evt) => {
    this.setState({
      filterString: evt.target.value,
    });
  };
  loadIssues() {
    US.loadBacklogIssues();
  }
  handleClickOutside = (evt) => {
    // window.console.log('click out side');
  };
  handleQuickFilter = type => (value) => {
    switch (type) {
      case 'default':
        US.setCurrentBacklogFilters(0, value);
        break;

      case 'custom':
        US.setCurrentBacklogFilters(1, value);
        break;
      default:
        break;
    }
    US.loadBacklogIssues();
  };
  handleClickExpand(id) {
    const expand = US.backlogExpand.slice();
    const index = expand.findIndex(v => v === id);
    if (index === -1) {
      expand.push(id);
    } else {
      expand.splice(index, 1);
    }
    US.setBacklogExpand(expand);
  }

  handleClickFilter(id) {
    const currentBacklogFilters = US.currentBacklogFilters.slice();
    const index = currentBacklogFilters.findIndex(v => v === id);
    if (index === -1) {
      currentBacklogFilters.push(id);
    } else {
      currentBacklogFilters.splice(index, 1);
    }
    US.setCurrentBacklogFilter(currentBacklogFilters);
    US.loadBacklogIssues();
  }
  quickFilter(data) {
    return data.reduce((finalList, issue, i) => {
      if (issue.summary.indexOf(this.state.filterString) > -1) {
        finalList.push(this.renderIssue(issue, i));
      } else if (issue.issueNum.indexOf(this.state.filterString) > -1) {
        finalList.push(this.renderIssue(issue, i));
      }
      return finalList;
    }, []);
  }
  renderIssues() {
    const mode = US.mode;
    const expand = US.backlogExpand;
    let group = [];
    if (mode === 'none') {
      group = US.backlogIssues;
      return (
        <div style={{ paddingRight: 12 }}>
          <div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
                paddingBottom: 4,
                borderBottom: '1px solid rgba(151, 151, 151, 0.2)',
              }}
            >
              <h4 style={{ fontSize: '14px', lineHeight: '20px' }}>Issues</h4>
              <Icon
                type={expand.includes(0) ? 'expand_less' : 'expand_more'}
                onClick={this.handleClickExpand.bind(this, 0)}
              />
            </div>
            {expand.includes(0) ? null : (
              <ul style={{ padding: 0, margin: 0 }}>{this.quickFilter(group)}</ul>
            )}
          </div>
        </div>
      );
    } else {
      group = US[`${mode}s`];
      return (
        <div style={{ paddingRight: 12 }}>
          {_.map(group, (v, i) => this.renderGroupIssue(v, i))}
          {this.renderUnscheduledIssue()}
        </div>
      );
    }
  }

  renderGroupIssue(group, i) {
    const mode = US.mode;
    const expand = US.backlogExpand;
    const issues = US.backlogIssues.filter(v => v[`${mode}Id`] === group[`${mode}Id`]);
    return (
      <div key={i}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
            paddingBottom: 4,
            borderBottom: '1px solid rgba(151, 151, 151, 0.2)',
          }}
        >
          <h4
            style={{
              fontSize: '14px',
              lineHeight: '20px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {group.name || group.sprintName}
          </h4>
          <Icon
            type={expand.includes(group[`${mode}Id`]) ? 'expand_less' : 'expand_more'}
            onClick={this.handleClickExpand.bind(this, group[`${mode}Id`])}
          />
        </div>
        {expand.includes(group[`${mode}Id`]) ? null : (
          <ul style={{ padding: 0, margin: 0 }}>{this.quickFilter(issues)}</ul>
        )}
      </div>
    );
  }

  renderUnscheduledIssue(group, i) {
    const mode = US.mode;
    const expand = US.backlogExpand;
    const issues = US.backlogIssues.filter(v => v[`${mode}Id`] === null);
    return (
      <div key={i}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
            paddingBottom: 4,
            borderBottom: '1px solid rgba(151, 151, 151, 0.2)',
          }}
        >
          <h4
            style={{
              fontSize: '14px',
              lineHeight: '20px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Unscheduled
          </h4>
          <Icon
            type={expand.includes('Unscheduled') ? 'expand_less' : 'expand_more'}
            onClick={this.handleClickExpand.bind(this, 'Unscheduled')}
          />
        </div>
        {expand.includes('Unscheduled') ? null : (
          <ul style={{ padding: 0, margin: 0 }}>{this.quickFilter(issues)}</ul>
        )}
      </div>
    );
  }

  renderIssue(issue, i) {
    return (
      <li
        style={{
          display: 'flex',
          flexDirection: 'row',
          padding: '5px 4px',
          border: '1px solid rgba(151, 151, 151, 0.2)',
          borderTop: 'none',
          background: issue.statusCode === 'done' ? 'rgba(0, 0, 0, 0.06)' : '#fff',
        }}
      >
        <span style={{ marginRight: 4 }}>
          <TypeTag typeCode={issue.typeCode} />
        </span>
        <span
          style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {issue.summary}
        </span>
        <span
          style={{
            color: '#3f51b5',
            textAlign: 'right',
            textDecoration: issue.statusCode === 'done' ? 'line-through' : 'unset',
          }}
        >
          {issue.issueNum}
        </span>
      </li>
    );
  }

  render() {
    return (
      <div className="c7n-userMap-backlog">
        <div style={{ display: 'flex', flexDirection: 'row', height: 38, paddingRight: 20 }}>
          <div
            style={{
              width: 224,
              height: 38,
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.20)',
              borderRadius: '2px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            <Input
              placeholder="按照名称搜索"
              prefix={<Icon type="search" />}
              label=""
              // value={userName}
              onChange={this.onChangeUserName}
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
                  [
                    {
                      name: '仅我的问题',
                      id: 'mine',
                    },
                    {
                      name: '仅用户故事',
                      id: 'story',
                    },
                  ].map(items => (
                    <Checkbox
                      onChange={this.handleClickFilter.bind(this, items.id)}
                      checked={US.currentBacklogFilters.includes(items.id)}
                    >
                      {items.name}
                    </Checkbox>
                  ))
                }
                {
                  US.filters.map(filter => (
                    <Checkbox
                      onChange={this.handleClickFilter.bind(this, filter.filterId)}
                      checked={US.currentBacklogFilters.includes(filter.filterId)}
                    >
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
              boxShadow:
                '0 5px 5px -3px rgba(0,0,0,0.20), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12)',
              borderRadius: '2px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontSize: '13px',
                  lineHeight: '15px',
                  cursor: 'pointer',
                  color: '#3f51b5',
                  height: '100%',
                  fontWeight: 'bold',
                }}
              >
                <span>快速搜索</span>
                <Icon type="baseline-arrow_drop_down" style={{ fontSize: '16px', marginLeft: 6 }} />
              </div>
            </div>
          </Popover>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>{this.renderIssues()}</div>
      </div>
    );
  }
}

export default withRouter(onClickOutside(Backlog));
