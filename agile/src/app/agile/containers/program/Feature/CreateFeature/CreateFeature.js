import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { 
  Select, Input, Icon, Radio, Form, Modal, Button,
} from 'choerodon-ui';
import { stores, axios, Content } from 'choerodon-front-boot';
import WYSIWYGEditor from '../../../../components/WYSIWYGEditor';
import FullEditor from '../../../../components/FullEditor';
import UploadButton from '../../../../components/CommonComponent/UploadButton';
import TypeTag from '../../../../components/TypeTag';
import {
  loadPriorities, loadProgramEpics, loadIssueTypes, createIssue, 
} from '../../../../api/NewIssueApi';
import { beforeTextUpload, handleFileUpload } from '../../../../common/utils';
import './CreateFeature.scss';

const { AppState } = stores;
console.log('appState:');
console.log(AppState);
const FormItem = Form.Item;
const { Sidebar } = Modal;
const { Option } = Select;
const RadioDroup = Radio.Group;
const { TextArea } = Input;
const storyPointList = ['0.5', '1', '2', '3', '4', '5', '8', '13'];

@observer
class CreateFeature extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originEpics: [],
      selectedIssueType: undefined,
      defaultPriority: undefined,
      featureType: 'enabler',
      storyPoints: '',
      fullEdit: false,
      delta: '',
      fileList: [],
      selectLoading: false,
    };
  }

  componentDidMount() {
    loadIssueTypes('program').then((res) => {
      this.setState({
        selectedIssueType: res.find(item => item.typeCode === 'feature'),
      });
    });

    loadPriorities().then((res) => {
      this.setState({
        defaultPriority: res.find(item => item.default) || res[0],
      });
    });
  }

  handleOnOk = () => {
    const { callback, form } = this.props;
    const {
      selectedIssueType, defaultPriority, featureType, storyPoints, delta,
    } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        const issueObj = {
          projectId: AppState.currentMenuType.id,
          programId: AppState.currentMenuType.id,
          issueTypeId: selectedIssueType.id,
          typeCode: 'feature',
          summary: values.summary,
          priorityId: defaultPriority.id,
          priorityCode: `priority-${defaultPriority.id}`,
          epicId: values.epicId || 0,
          parentIssueId: 0,
          storyPoints,
          featureDTO: {
            benfitHypothesis: values.benfitHypothesis,
            acceptanceCritera: values.acceptanceCritera,
            featureType,
          },
        };

        const deltaOps = delta;
        if (deltaOps) {
          beforeTextUpload(deltaOps, issueObj, this.handleCreateFeature);
        } else {
          issueObj.description = '';
          this.handleCreateFeature(issueObj);
        }
      }
    });
  }

  handleCreateFeature = (issueObj) => {
    const { form, callback } = this.props;
    const { fileList } = this.state;
    const fileUpdateCallback = () => {
      this.setState({ fileList: [] });
    };
      
    createIssue(issueObj, 'program').then((res) => {
      if (fileList.length > 0) {
        const config = {
          issueType: res.statusId,
          issueId: res.issueId,
          fileName: fileList[0].name,
          projectId: AppState.currentMenuType.id,
        };
        if (fileList.some(one => !one.url)) {
          handleFileUpload(fileList, fileUpdateCallback, config);
        }
      }
      Choerodon.prompt('创建成功');
      form.resetFields();
      this.resetForm();
      callback();
    }).catch(() => {
      Choerodon.prompt('创建失败');
    });
  }
 
  resetForm = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      storyPoints: '',
      delta: '',
      fileList: [],
      featureType: 'enabler',
    });
    this.editor.setEditorContents(this.editor.getEditor(), '');
  }

  handleOnCancel = () => {
    const { callback } = this.props;
    callback();
    this.resetForm();
  }

  handleFeatureTypeChange = (e) => {
    this.setState({
      featureType: e.target.value,
    });
  }

  handleEpicFilterChange = () => {
    this.setState({
      selectLoading: true,
    });
    loadProgramEpics().then((res) => {
      this.setState({
        originEpics: res,
        selectLoading: false,
      });
    });
  }

  handleChangeStoryPoint = (value) => {
    const { storyPoints } = this.state;
    // 只允许输入整数，选择时可选0.5
    if (value === '0.5') {
      this.setState({
        storyPoints: '0.5',
      });
    } else if (/^(0|[1-9][0-9]*)(\[0-9]*)?$/.test(value) || value === '') {
      this.setState({
        storyPoints: String(value).slice(0, 3),
      });
    } else if (value.toString().charAt(value.length - 1) === '.') {
      this.setState({
        storyPoints: value.slice(0, -1),
      });
    } else {
      this.setState({
        storyPoints,
      });
    }
  };

  handleFullEditOnOk = (value) => {
    this.setState({
      delta: value,
      fullEdit: false,
    });
  }

  handleFullEditonCancel = () => {
    this.setState({
      fullEdit: false,
    });
  }

  setFileList = (data) => {
    this.setState({ fileList: data });
  };

  render() {
    const { visible } = this.props;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const {
      fullEdit, delta, selectLoading, originEpics, selectedIssueType, storyPoints, fileList, featureType,
    } = this.state;
    return (
      <Sidebar
        className="c7n-feature-createFeatureSideBar"
        title="创建特性"
        visible={visible}
        cancelText="取消"
        okText="创建"
        onOk={this.handleOnOk}
        onCancel={this.handleOnCancel}
      >
        <Content
          title="在项目群中创建特性"
          description="请在下面输入问题的详细信息，包含详细描述、特性价值、验收标准等等。您可以通过丰富的问题描述帮助相关人员更快更全面的理解任务，同时更好的把控问题进度。"
          link=""
        >
          <Form>
            {selectedIssueType && (
            <FormItem label="问题类型" style={{ width: 520 }}>
              {getFieldDecorator('typeId', {
                rules: [{ required: true, message: '问题类型为必输项' }],
                initialValue: selectedIssueType.id,
              })(
                <Select
                  label="问题类型"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  disabled
                >
                  <Option key={selectedIssueType.id} value={selectedIssueType.id}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                      <TypeTag
                        data={selectedIssueType}
                        showName
                      />
                    </div>
                  </Option>
                </Select>,
              )}
            </FormItem>
            )}
            <RadioDroup label="特性类型" style={{ display: 'flex', flexDirection: 'column', marginBottom: 5 }} value={featureType} onChange={this.handleFeatureTypeChange}>
              <Radio value="business">业务</Radio>
              <Radio value="enabler">使能</Radio>
            </RadioDroup>

            <FormItem label="特性名称" style={{ width: 520, marginBottom: 20 }}>
              {getFieldDecorator('summary', {
                rules: [{ required: true, message: '特性名称为必输项' }],
              })(
                <Input label="特性名称" maxLength={44} />,
              )}
            </FormItem>

            <div style={{ width: 520 }}>
              <div style={{ display: 'flex', marginBottom: 3, alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold' }}>描述</div>
                <div style={{ marginLeft: 80 }}>
                  <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ fullEdit: true })} style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon type="zoom_out_map" style={{ color: '#3f51b5', fontSize: '18px', marginRight: 12 }} />
                    <span style={{ color: '#3f51b5' }}>全屏编辑</span>
                  </Button>
                </div>
              </div>
              {
                  !fullEdit && (
                    <div className="clear-p-mw">
                      <WYSIWYGEditor
                        saveRef={(editor) => { this.editor = editor; }}
                        value={delta}
                        style={{ height: 200, width: '100%' }}
                        onChange={(value) => {
                          this.setState({ delta: value });
                        }}
                      />
                    </div>
                  )
                }
            </div>
            
            <FormItem label="史诗" style={{ width: 520 }}>
              {getFieldDecorator('epicId', {})(
                <Select
                  label="史诗"
                  allowClear
                  filter
                  filterOption={
                    (input, option) => option.props.children && option.props.children.toLowerCase().indexOf(
                      input.toLowerCase(),
                    ) >= 0
                }
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  loading={selectLoading}
                  onFilterChange={this.handleEpicFilterChange}
                >
                  {originEpics.map(
                    epic => (
                      <Option
                        key={epic.issueId}
                        value={epic.issueId}
                      >
                        {epic.epicName}
                      </Option>
                    ),
                  )}
                </Select>,
              )}
            </FormItem>

            <div style={{ width: 520, paddingBottom: 8, marginBottom: 12 }}>
              <Select
                label="故事点"
                value={storyPoints && storyPoints.toString()}
                mode="combobox"
                onPopupFocus={(e) => {
                  this.componentRef.rcSelect.focus();
                }}
                tokenSeparators={[',']}
                style={{ marginTop: 0, paddingTop: 0 }}
                onChange={value => this.handleChangeStoryPoint(value)}
              >
                {storyPointList.map(sp => (
                  <Option key={sp.toString()} value={sp}>
                    {sp}
                  </Option>
                ))}
              </Select>
            </div>
            <FormItem style={{ width: 520 }}>
              {getFieldDecorator('benfitHypothesis', {
              })(
                <Input label="特性价值" placeholder="请输入特性价值" maxLength={44} />,
              )}
            </FormItem>
            <FormItem style={{ width: 520 }}>
              {getFieldDecorator('acceptanceCritera', {
              })(
                <Input label="验收标准" placeholder="请输入验收标准" maxLength={44} />,
              )}
            </FormItem>
          </Form>
        
          <div className="c7n-feature-signUpload" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', marginBottom: '13px', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>附件</div>
            </div>
            <div style={{ marginTop: -38 }}>
              <UploadButton
                onRemove={this.setFileList}
                onBeforeUpload={this.setFileList}
                fileList={fileList}
              />
            </div>
          </div>
          {
            fullEdit ? (
              <FullEditor
                initValue={delta}
                visible={fullEdit}
                onCancel={this.handleFullEditonCancel}
                onOk={this.handleFullEditOnOk}
              />
            ) : null
          }
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(CreateFeature);
