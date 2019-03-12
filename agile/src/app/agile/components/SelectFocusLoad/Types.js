import React from 'react';
import { Select } from 'choerodon-ui';
import { find } from 'lodash';
import User from '../User';
import { getUsers, getUser } from '../../api/CommonApi';

const { Option } = Select;

export default {
  user: {
    request: getUsers,
    render: user => (
      <Option key={user.id} value={user.id}>
        <User user={user} />
      </Option>
    ),
    avoidShowError: (props, List) => new Promise((resolve) => {
      const { value } = props;
      const UserList = [...List];
      console.log(List, find(List, { id: value }));
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
};
