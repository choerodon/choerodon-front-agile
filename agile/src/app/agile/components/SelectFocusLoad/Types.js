import React from 'react';
import { Select } from 'choerodon-ui';
import { find } from 'lodash';
import User from '../User';
import { getUsers, getUser } from '../../api/CommonApi';
import { loadEpics, loadProgramEpics, loadIssueTypes } from '../../api/NewIssueApi';
import TypeTag from '../TypeTag';

const { Option } = Select;

export default {
  user: {
    request: (...args) => new Promise(resolve => getUsers(...args).then((UserData) => { resolve(UserData.content); })),
    render: user => (
      <Option key={user.id} value={user.id}>
        <User user={user} />
      </Option>
    ),
    avoidShowError: (props, List) => new Promise((resolve) => {
      const { value } = props;
      const UserList = [...List];

      if (value && !find(UserList, { id: value })) {
        getUser(value).then((res) => {
          if (res.content && res.content.length > 0) {
            UserList.push(res.content[0]);
            resolve(UserList);
          } else {
            resolve(null);
          }
        }).catch((err) => {
          console.log(err);
          resolve(null);
        });
      } else {
        resolve(null);
      }
    }),
  },
  epic: {
    props: {
      filterOption:
        (input, option) => option.props.children
          && option.props.children.toLowerCase().indexOf(
            input.toLowerCase(),
          ) >= 0,
    },
    request: loadEpics,
    render: epic => (
      <Option
        key={epic.issueId}
        value={epic.issueId}
      >
        {epic.epicName}
      </Option>
    ),
  },
  epic_program: {
    props: {
      filterOption:
        (input, option) => option.props.children
          && option.props.children.toLowerCase().indexOf(
            input.toLowerCase(),
          ) >= 0,
    },
    request: loadProgramEpics,
    render: epic => (
      <Option
        key={epic.issueId}
        value={epic.issueId}
      >
        {epic.epicName}
      </Option>
    ),
  },  
  issue_type_program: {
    props: {
      filterOption:
        (input, option) => option.props.children
          && option.props.children.toLowerCase().indexOf(
            input.toLowerCase(),
          ) >= 0,
    },
    request: () => new Promise(resolve => loadIssueTypes('program').then((issueTypes) => { 
      const defaultType = find(issueTypes, { typeCode: 'feature' }).id; 
      resolve(issueTypes, defaultType); 
    })),
    render: issueType => (
      <Option
        key={issueType.id}
        value={issueType.id}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
          <TypeTag
            data={issueType}
            showName
          />
        </div>
      </Option>
    ),
  },
};
