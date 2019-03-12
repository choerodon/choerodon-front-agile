import React from 'react';
import { Select } from 'choerodon-ui';
import User from '../User';
import { getUsers } from '../../api/CommonApi';

const { Option } = Select;

export default {
  user: {
    request: getUsers,
    render: user => (
      <Option key={user.id} value={user.id}>
        <User user={user} />
      </Option>
    ),
  },
};
