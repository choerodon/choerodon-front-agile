import React, { Component, memo } from 'react';
import { observer } from 'mobx-react';
import {
  Modal, Form, Input,
} from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { checkMyFilterName, createMyFilter } from '../../api/NewIssueApi';

const { AppState } = stores;
const FormItem = Form.Item;

class CreateMyFilter extends Component {
    checkMyFilterNameRepeatCreating = (rule, value, callback) => {
      checkMyFilterName(value).then((res) => {
        if (res) {     
          callback('筛选名称重复');
        } else {
          callback();
        }
      });
    }

    handleSaveFilterOk = () => {      
      const { form, searchDTO, onCreate } = this.props;
      
      
      form.validateFields(['filterName'], (err, values) => {
        if (!err) {
          const { filterName } = values;
          const filterDTO = {
            name: filterName,
            // filterId: 0,
            // objectVersionNumber: 0,
            personalFilterSearchDTO: searchDTO,
            projectId: AppState.currentMenuType.id,
            userId: AppState.userInfo.id,
          };
          createMyFilter(filterDTO)
            .then((res) => {              
              form.setFieldsValue({ filterName: '' });
              onCreate();
              Choerodon.prompt('保存成功');
            }).catch(() => {              
              Choerodon.prompt('保存失败');
            });
        }
      });
    }

    render() {      
      const { form, visible, onCancel } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          title="保存筛选"
          visible={visible}
          onOk={this.handleSaveFilterOk}
          onCancel={onCancel}
        >
          <Form className="c7n-filterNameForm">
            <FormItem>
              {getFieldDecorator('filterName', {
                rules: [{
                  required: true, message: '请输入筛选名称',
                }, { validator: this.checkMyFilterNameRepeatCreating }],
                validateTrigger: 'onChange',
              })(
                <Input
                  label="筛选名称"
                  maxLength={10}
                />,
              )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
}
const CreateMyFilterContainer = () => Form.create()(CreateMyFilter);
export default memo(CreateMyFilterContainer);
