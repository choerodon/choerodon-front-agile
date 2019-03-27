import React, { Fragment } from 'react';
import { Icon, Button, Input } from 'choerodon-ui';
import TextEditToggle from '../../../../../../components/TextEditToggle';

const { Text, Edit } = TextEditToggle;
const ArtInfo = ({
  onSubmit,
  name,
}) => (
  <div style={{ fontSize: '18px', fontWeight: 500, margin: '20px 0 10px' }}>
    <TextEditToggle
      style={{ width: 420 }}
      formKey="name"
      onSubmit={(newName) => { onSubmit({ name: newName }); }}
      originData={name}
      rules={[{
        required: true, message: '请输入ART名称!',
      }]}
    >
      <Text>
        {name}
      </Text>
      <Edit>
        <Input autoFocus maxLength={30} />
      </Edit>
    </TextEditToggle>
  </div>
);
export default ArtInfo;
