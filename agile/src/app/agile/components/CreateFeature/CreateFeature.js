import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, Select, Modal, Radio, Button, Icon,
} from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import { find } from 'lodash';
import SelectFocusLoad from '../SelectFocusLoad';
import WYSIWYGEditor from '../WYSIWYGEditor';
import FullEditor from '../FullEditor';
import UploadControl from '../UploadControl';
import SelectNumber from '../SelectNumber';
import {
  createIssue, loadPriorities,
} from '../../api/NewIssueApi';
import { handleFileUpload, getProjectId, beforeTextUpload } from '../../common/utils';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const RadioGroup = Radio.Group;
const defaultProps = {

};

const propTypes = {
  visible: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
};
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};
@Form.create()
class CreateFeature extends Component {
  state = {
    fullEditorVisible: false,
    defaultPriority: null,
  }

  componentDidMount() {
    loadPriorities().then((res) => {
      this.setState({
        defaultPriority: res.find(item => item.default) || res[0],
      });
    });
  }
  
  
  handleModalCancel = () => {
    this.setState({
      fullEditorVisible: false,
    });
  }

  handleModalOk = () => {
    this.setState({
      fullEditorVisible: false,
    });
  }

  handleShowFullEditor=() => {
    this.setState({
      fullEditorVisible: true,
    });
  }

  handleOk = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {
          issueTypeId, storyPoints, epicId, summary, benfitHypothesis, acceptanceCritera, featureType, fileList,
          description,
        } = values;
        const { defaultPriority } = this.state;
        const issueObj = {
          projectId: getProjectId(),
          programId: getProjectId(),
          issueTypeId,
          typeCode: 'feature',
          summary,
          priorityId: defaultPriority.id,
          priorityCode: `priority-${defaultPriority.id}`,
          epicId: epicId || 0,
          parentIssueId: 0,
          storyPoints,
          featureDTO: {
            benfitHypothesis,
            acceptanceCritera,
            featureType,
          },
        };

       
        if (description) {
          beforeTextUpload(description, issueObj, this.handleCreateFeature);
        } else {
          issueObj.description = '';
          this.handleCreateFeature(issueObj, fileList);
        }
        // onSubmit(values);
      }
    });
  }

  handleCreateFeature = (issueObj, fileList) => {
    const { onCreate } = this.props;
    createIssue(issueObj, 'program').then((res) => {
      if (fileList && fileList.length > 0) {
        const config = {
          issueType: res.statusId,
          issueId: res.issueId,
          fileName: fileList[0].name,
          projectId: getProjectId(),
        };
        if (fileList.some(one => !one.url)) {
          handleFileUpload(fileList, () => {}, config);
        }
      }
      Choerodon.prompt('创建成功');
      if (onCreate) {
        onCreate();
      }
    }).catch((error) => {
      console.log(error);
      Choerodon.prompt('创建失败');
    });
  }

  handleTypesLoaded=(issueTypes) => {
    const { form } = this.props;
    const defaultType = find(issueTypes, { typeCode: 'feature' }).id;
    form.setFieldsValue({ issueTypeId: defaultType });
  }

  render() {
    const {
      visible, onCancel, loading, form, 
    } = this.props;
    const { fullEditorVisible } = this.state;
    const { getFieldDecorator } = form;
    return (
      <Sidebar
        title="创建特性"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={loading}
        destroyOnClose
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
          title="在项目群中创建特性"
          description="请在下面输入问题的详细信息，包含详细描述、特性价值、验收标准等等。您可以通过丰富的问题描述帮助相关人员更快更全面的理解任务，同时更好的把控问题进度。"
        >
          <Form>
            <FormItem>
              {getFieldDecorator('issueTypeId', {                
                rules: [{
                  required: true, message: '请选择类型!',
                }],
              })(
                <SelectFocusLoad afterLoad={this.handleTypesLoaded} loadWhenMount disabled type="issue_type_program" label="问题类型" style={{ width: 500 }} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('featureType', {
                rules: [{
                  required: true, message: '请选择特性类型!',
                }],
                initialValue: 'business',
              })(
                <RadioGroup label="特性类型">
                  <Radio value="business" style={radioStyle}>业务</Radio>
                  <Radio value="enabler" style={radioStyle}>使能</Radio>
                </RadioGroup>,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('summary', {
                rules: [{
                  required: true, message: '请输入特性名称',
                }, {
                  validator: this.handleCheckStatusRepeat,
                }],
              })(
                <Input style={{ width: 500 }} maxLength={30} label="特性名称" />,
              )}
            </FormItem>
            <div style={{ display: 'flex', marginBottom: 3, alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>描述</div>
              <div style={{ marginLeft: 80 }}>
                <Button className="leftBtn" funcType="flat" onClick={this.handleShowFullEditor} style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon type="zoom_out_map" style={{ color: '#3f51b5', fontSize: '18px', marginRight: 12 }} />
                  <span style={{ color: '#3f51b5' }}>全屏编辑</span>
                </Button>
              </div>
            </div>
            <FormItem>
              {getFieldDecorator('description', {                
              })(
                <WYSIWYGEditor />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('description', {
              })(
                <FullEditor
                  visible={fullEditorVisible} 
                  onCancel={this.handleModalCancel}
                  onOk={this.handleModalOk}
                />,
              )}
            </FormItem>            
            <FormItem>
              {getFieldDecorator('epicId', {

              })(
                <SelectFocusLoad type="epic_program" style={{ width: 500 }} label="史诗" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('storyPoints', {

              })(
                <SelectNumber style={{ width: 500 }} label="故事点" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('benfitHypothesis', {
              })(
                <Input style={{ width: 500 }} maxLength={30} label="特性价值" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('acceptanceCritera', {
              })(
                <Input style={{ width: 500 }} maxLength={30} label="验收标准" />,
              )}
            </FormItem>
            <Form.Item>
              {getFieldDecorator('upload', {
                valuePropName: 'fileList',
              })(
                <UploadControl />,
              )}
            </Form.Item>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

CreateFeature.propTypes = propTypes;
CreateFeature.defaultProps = defaultProps;


export default CreateFeature;
