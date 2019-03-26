import React, { Fragment } from 'react';
import { Icon, Button, Input } from 'choerodon-ui';
import TextEditToggle from '../../../../../../components/TextEditToggle';

const { Text, Edit } = TextEditToggle;
const ArtInfo = ({
  onSubmit,
  name,
}) => (
<<<<<<< Updated upstream
  <Fragment>
    <div style={{ display: 'flex', height: 40 }}>
      {
          enabled && (
            <Fragment>
              <div><Icon type="warning" style={{ color: '#FADB14' }} /></div>
              <div style={{ width: 500, marginLeft: 5 }}>
                注意：此ART正在进行中。你正在编辑
                <span className="weight">{name}</span>
                ，如果编辑后的修改需要生效，请点击
                <span className="weight">发布</span>
                。
                <span className="weight">清除修改</span>
                点击后恢复为当前设置。
              </div>
            </Fragment>
          )
        }
      <div style={{ flex: 1, visibility: 'hidden' }} />
      <div>
        {canRelease && <Button type="primary" funcType="raised" onClick={onReleaseClick}>发布</Button>}
        {isModified && <Button funcType="raised" style={{ marginLeft: 10 }} onClick={onClearModify}>清除修改</Button>}
      </div>
    </div>
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
    <div style={{ marginBottom: 20 }}>
      <TextEditToggle
        style={{ width: 420 }}
        formKey="description"
        onSubmit={(newDescription) => { onSubmit({ description: newDescription }); }}
        originData={description}
      >
        <Text>
          {description}
        </Text>
        <Edit>
          <Input.TextArea autoFocus maxLength={44} />
        </Edit>
      </TextEditToggle>
    </div>
  </Fragment>
=======
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
>>>>>>> Stashed changes
);
export default ArtInfo;
