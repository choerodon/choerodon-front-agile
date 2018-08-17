/**
 * props:
 * type
 * defaultValue
 * enterOrBlur
 * disabledDate
 * onChange
 * style
 * disabled
 * byHand
 * editIf
 * time
 */

import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { DatePicker, Input, Button, Select, Icon, Tooltip, Popover, Modal, Table } from 'choerodon-ui';

let isClick = false;
@inject('AppState')
@observer
class EasyEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
      hoverIf: false,
    };
  }
  handleOnOk(e) {
    this.props.onChange(this.state.date, this.state.dateString || e._i);
    isClick = true;
    this.setState({
      edit: false,
      // hoverIf: false,
    });
  }
  renderEdit() {
    const that = this;
    if (this.props.type === 'input') {
      return (
        <Input
          maxLength={this.props.maxLength}
          defaultValue={this.props.defaultValue}
          autoFocus
          onPressEnter={(e) => {
            this.props.enterOrBlur(e.target.value);
            this.setState({
              edit: false,
              hoverIf: false,
            });
          }}
          onBlur={(e) => {
            this.props.enterOrBlur(e.target.value);
            this.setState({
              edit: false,
              hoverIf: false,
            });
          }}
        />
      );
    } else {
      return (
        <DatePicker
          autoFocus
          open={this.state.edit}
          defaultValue={this.props.defaultValue}
          disabledDate={this.props.disabledDate}
          format="YYYY-MM-DD HH:mm:ss"
          showTime={this.props.time}
          onOpenChange={(status) => {
            if (!status) {
              this.setState({
                edit: false,
                hoverIf: false,
              });
            }
          }}
          onChange={(date, dateString) => {
            this.setState({
              edit: false,
              hoverIf: false,
              date,
              dateString,
            });
          }}
          onOk={this.handleOnOk.bind(this)}
        />
      );
    }
  }
  render() {
    return (
      <div
        className={this.props.className}
        style={{ 
          position: 'relative',
          cursor: 'pointer',
          minHeight: 20,
          ...this.props.style ? this.props.style : {},
        }}
        role="none"
        onClick={() => {
          if (!this.props.disabled) {
            if (!this.props.byHand && !isClick) {
              this.setState({
                edit: true,
              });
            }
          }
          isClick = false;
        }}
        onMouseEnter={() => {
          if (!this.props.disabled) {
            if (!this.props.byHand) {
              this.setState({
                hoverIf: true,
              });
            }
          }
        }}
        onMouseLeave={() => {
          if (!this.props.disabled) {
            if (!this.props.byHand) {
              this.setState({
                hoverIf: false,
              });
            }
          }
        }}
      >
        {
          this.state.edit || this.props.editIf ? this.renderEdit() : (
            <div>
              {this.props.children}
              <div
                style={{
                  display: this.state.hoverIf ? 'flex' : 'none',
                  width: '100%',
                  position: 'absolute',
                  height: 'calc(100% + 10px)',
                  top: -5,
                  border: '1px solid gainsboro',
                  justifyContent: 'flex-end',
                  borderRadius: 3,
                }}
              >
                <div
                  style={{
                    background: 'gainsboro',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 3px',
                  }}
                >
                  <Icon style={{ fontSize: 15 }} type="mode_edit" />
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default EasyEdit;

