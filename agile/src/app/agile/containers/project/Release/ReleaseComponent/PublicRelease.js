import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Modal, Form, Radio, Select, DatePicker } from 'choerodon-ui';
import moment from 'moment';
import ReleaseStore from '../../../../stores/project/release/ReleaseStore';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { AppState } = stores;

@observer
class PublicRelease extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handlePublic(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = {
          projectId: AppState.currentMenuType.id,
          versionId: ReleaseStore.getVersionDetail.versionId,
          releaseDate: values.startDate ? `${moment(values.startDate).format('YYYY-MM-DD')} 00:00:00` : null,
        };
        if (values.chose) {
          if (values.chose === 2) {
            data.targetVersionId = values.moveVersion;
          }
        }
        ReleaseStore.axiosPublicRelease(data).then((res) => {
          this.props.onCancel();
          this.props.refresh();
        }).catch((error) => {
          window.console.error(error);
        });
      }
    });
  }
  renderRadioDisabled() {
    if (ReleaseStore.getPublicVersionDetail.versionNames) {
      if (ReleaseStore.getPublicVersionDetail.versionNames.length > 0) {
        return false;
      }
    }
    return true;
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        title="发布版本"
        visible={this.props.visible}
        onCancel={this.props.onCancel.bind(this)}
        onOk={this.handlePublic.bind(this)}
        okText="确定"
        cancelText="取消"
      >
        <Content
          title={`发布版本"${ReleaseStore.getVersionDetail.name}"`}
          description="根据项目周期，可以对软件项目追踪不同的版本，同时可以将对应的问题分配到版本中。例如：v1.0.0、v0.5.0等。"
          link="http://choerodon.io/zh/docs/user-guide/agile/release/release-version/"
          style={{
            padding: 0,
          }}
        >
          {
            JSON.stringify(ReleaseStore.getPublicVersionDetail) !== '{}' ? (
              <div>
                {
                  ReleaseStore.getPublicVersionDetail.fixIssueCount ? (
                    <p style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="c7n-release-icon">!</div>
                    还有{ReleaseStore.getPublicVersionDetail.fixIssueCount}个
                      <span style={{ color: '#3F51B5' }}>这个版本仍然没有解决的问题。</span>
                    </p>
                  ) : ''
                }
                <Form style={{ width: 512, marginTop: 24 }}>
                  {
                    ReleaseStore.getPublicVersionDetail.fixIssueCount ? (
                      <div>
                        <FormItem>
                          {getFieldDecorator('chose', {
                            initialValue: 1,
                            rules: [{
                              required: true, message: '该选型时必须的',
                            }],
                          })(
                            <RadioGroup  
                              label="未解决的问题"
                            >
                              <Radio style={{ display: 'block', height: 20, marginTop: 10 }} value={1}>
                    忽略并继续发布
                              </Radio>
                              <Radio
                                style={{ display: 'block', height: 20, marginTop: 10 }} 
                                value={2}
                                disabled={this.renderRadioDisabled()}
                              >
                    移动问题到版本
                              </Radio>
                            </RadioGroup>,
                          )}
                        </FormItem>
                        <FormItem>
                          {getFieldDecorator('moveVersion', {
                            initialValue: 
                            ReleaseStore.getPublicVersionDetail.versionNames.length > 0 ?
                              ReleaseStore.getPublicVersionDetail.versionNames[0].versionId 
                              : undefined,
                            rules: [{
                              required: this.props.form.getFieldValue('chose') === 2,
                              message: '移动版本是必须的',
                            }],
                          })(
                            <Select
                              label="选择要移动到的版本"
                              disabled={this.props.form.getFieldValue('chose') === 1}
                            >
                              {
                                ReleaseStore.getPublicVersionDetail.versionNames.map(item => (
                                  <Option value={item.versionId}>{item.name}</Option>
                                ))
                              }
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                    ) : ''
                  }
                  <FormItem>
                    {getFieldDecorator('startDate', {})(
                      <DatePicker label="开始日期" />,
                    )}
                  </FormItem>
                </Form>
              </div>
            ) : ''
          }
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(PublicRelease);
