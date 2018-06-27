import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Icon, Button } from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';

const { Sidebar } = Modal;
const { TextArea } = Input;
const { Option } = Select;
const { AppState } = stores;
const FormItem = Form.Item;

class AddComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      filters: [
        {
          prop: undefined,
          rule: undefined,
          value: undefined,
        },
      ],
      quickFilterFiled: [],
      origin: [],
      delete: [],
      originUsers: [],
    };
  }

  componentDidMount() {
    this.loadQuickFilterFiled();
  }

  loadQuickFilterFiled() {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter/fields`)
      .then((res) => {
        this.setState({
          quickFilterFiled: res,
        });
      });
  }

  loadQuickFilter(filterId) {
    if (filterId === 2) {
      axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/priority`)
        .then((res) => {
          this.setState({
            origin: res.lookupValues,
          });
        });
    } else if (filterId === 1) {
      axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users`)
        .then((res) => {
          this.setState({
            origin: res.content,
            originUsers: res.content,
          });
        });
    } else if (filterId === 3) {
      axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/status_category`)
        .then((res) => {
          this.setState({
            origin: res.lookupValues,
          });
        });
    }
  }

  handleOk(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const arr = [];
        const expressQueryArr = [];
        const o = [];
        const f = this.state.filters.slice();
        f.forEach((v, i) => {
          if (this.state.delete.indexOf(i) !== -1) {
            return;
          }
          const a = {
            fieldId: values[`filter-${i}-prop`],
            operation: values[`filter-${i}-rule`],
            value: values[`filter-${i}-prop`] === 1 ? values[`filter-${i}-value`] : `'${values[`filter-${i}-value`]}'`,
          };
          if (i) {
            o.push(values[`filter-${i}-ao`]);
            expressQueryArr.push(values[`filter-${i}-ao`].toUpperCase());
          }
          arr.push(a);
          expressQueryArr.push(_.find(this.state.quickFilterFiled, { fieldId: a.fieldId }).name);
          expressQueryArr.push(a.operation);
          expressQueryArr.push(values[`filter-${i}-prop`] === 1 ? `${_.find(this.state.originUsers, { id: values[`filter-${i}-value`] }).loginName} ${_.find(this.state.originUsers, { id: values[`filter-${i}-value`] }).realName}` : values[`filter-${i}-value`]);
        });
        const d = new Date();
        const obj = {
          expressQuery: expressQueryArr.join(' '),
          name: values.name,
          description: JSON.stringify({
            arr,
            o,
          }),
          projectId: AppState.currentMenuType.id,
          quickFilterValueDTOList: arr,
          relationOperations: o,
        };
        this.setState({
          loading: true,
        });
        axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`, obj)
          .then((res) => {
            this.setState({
              loading: false,
            });
            this.props.onOk();
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        className="c7n-component-component"
        title="创建快速搜索"
        okText="创建"
        cancelText="取消"
        visible
        confirmLoading={this.state.loading}
        onOk={this.handleOk.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title={`在项目"${AppState.currentMenuType.name}"中创建快速搜索`}
          description="请在下面输入模块名称、模块概要、负责人和默认经办人策略，创建新模版。"
        >
          <Form layout="vertical">
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                }],
              })(
                <Input
                  label="名称"
                  maxLength={30}
                />,
              )}
            </FormItem>
            {
              this.state.filters.map((filter, index) => (
                <div>
                  {
                    this.state.delete.indexOf(index) === -1 && (
                      <div>
                        {
                          index !== 0 && (
                            <FormItem style={{ width: 50, display: 'inline-block', marginRight: 10 }}>
                              {getFieldDecorator(`filter-${index}-ao`, {
                                rules: [{
                                  required: true,
                                }],
                              })(
                                <Select label="关系">
                                  <Option key="and" value="and">AND</Option>
                                  <Option key="or" value="or">OR</Option>  
                                </Select>,
                              )}
                            </FormItem>
                          )
                        }
                        <FormItem style={{ width: 100, display: 'inline-block', marginRight: 10 }}>
                          {getFieldDecorator(`filter-${index}-prop`, {
                            rules: [{
                              required: true,
                            }],
                          })(
                            <Select label="属性">
                              {
                                this.state.quickFilterFiled.map(v => (
                                  <Option key={v.fieldId} value={v.fieldId}>{v.name}</Option>
                                ))
                              }
                            </Select>,
                          )}
                        </FormItem>
                        <FormItem style={{ width: 100, display: 'inline-block', marginRight: 10 }}>
                          {getFieldDecorator(`filter-${index}-rule`, {
                            rules: [{
                              required: true,
                            }],
                          })(
                            <Select label="关系">
                              <Option key="=" value="=">=</Option>
                              <Option key="!=" value="!=">!=</Option>  
                              <Option key="isNot" value="isNot">is not</Option>
                              <Option key="is" value="is">is</Option>  
                              <Option key="notIn" value="notIn">notIn</Option>
                              <Option key="in" value="in">in</Option>
                              <Option key="was" value="was">was</Option>
                              <Option key="notIn" value="notIn">notIn</Option>  
                              <Option key="wasNotIn" value="wasNotIn">wasNotIn</Option>
                              <Option key="changed" value="changed">changed</Option>  
                            </Select>,
                          )}
                        </FormItem>
                        <FormItem style={{ width: 100, display: 'inline-block' }}>
                          {getFieldDecorator(`filter-${index}-value`, {
                            rules: [{
                              required: true,
                            }],
                          })(
                            <Select
                              label="值"
                              onFocus={() => {
                                this.loadQuickFilter(this.props.form.getFieldValue(`filter-${index}-prop`));
                              }}
                            >
                              {
                                this.state.origin.map(v => (
                                  <Option
                                    key={v.valueCode || v.id}
                                    value={v.valueCode || v.id}
                                  >
                                    {v.realName || v.name}
                                  </Option>
                                ))
                              }
                            </Select>,
                          )}
                        </FormItem>
                        <Button
                          shape="circle"
                          style={{ margin: 10 }}
                          onClick={() => {
                            const arr = this.state.delete.slice();
                            arr.push(index);
                            this.setState({
                              delete: arr,
                            });
                          }}
                        >
                          <Icon type="delete" />
                        </Button>
                      </div>
                    )
                  }
                  
                </div>
              ))
            }
            <Button
              type="primary"
              funcTyp="flat"
              onClick={() => {
                const arr = this.state.filters.slice();
                arr.push({
                  prop: undefined,
                  rule: undefined,
                  value: undefined,
                });
                this.setState({
                  filters: arr,
                });
              }}
            >
              <Icon type="add icon" />
              <span>添加属性</span>
            </Button>
            <FormItem>
              {getFieldDecorator('description', {})(
                <TextArea label="描述" autosize maxLength={30} />,
              )}
            </FormItem>
          </Form>
          
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(AddComponent);
